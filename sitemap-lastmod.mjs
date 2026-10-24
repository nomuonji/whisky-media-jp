// Real content dates for <lastmod> in the generated sitemap.
//
// Google uses <lastmod> only when it is consistently accurate, so this never
// falls back to build time: a URL gets a lastmod only when its content file
// carries an explicit updated/published date. Pages without one (home,
// category, tag lists) are left without lastmod on purpose.
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const UPDATED_KEYS = ['updatedDate', 'updated', 'updatedAt', 'lastUpdated', 'modifiedDate', 'lastmod'];
const PUBLISHED_KEYS = ['pubDate', 'publishedAt', 'published', 'date'];

function walk(dir) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return []; }
  return entries.flatMap(entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function toDay(raw) {
  if (raw === null || raw === undefined) return null;
  const text = String(raw).trim().replace(/^['"]|['"]$/g, '');
  if (!text) return null;
  // Keep the calendar day as written (avoids UTC shifting a JST date to the previous day).
  const literal = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  const date = literal ? new Date(`${literal[1]}-${literal[2]}-${literal[3]}T00:00:00Z`) : new Date(text);
  if (Number.isNaN(date.valueOf())) return null;
  // Reject future dates (scheduled posts, typos): a lastmod ahead of today is never accurate.
  if (date.getTime() > Date.now() + 24 * 60 * 60 * 1000) return null;
  return literal ? `${literal[1]}-${literal[2]}-${literal[3]}` : date.toISOString().slice(0, 10);
}

function frontmatterValue(frontmatter, key) {
  const match = new RegExp(`^${key}:[ \\t]*([^\\n#]+)`, 'm').exec(frontmatter);
  return match ? match[1].trim() : null;
}

function pick(getter, extraKeys = []) {
  for (const key of [...extraKeys, ...UPDATED_KEYS, ...PUBLISHED_KEYS]) {
    const day = toDay(getter(key));
    if (day) return day;
  }
  return null;
}

function jsonPath(object, path) {
  return path.split('.').reduce((value, key) => (value && typeof value === 'object' ? value[key] : undefined), object);
}

/**
 * Build slug -> YYYY-MM-DD from content files under `dirs` (paths relative to the
 * project root, e.g. 'src/content/blog'). The slug is frontmatter `slug:` when
 * present, otherwise the file name (or the folder name for index files).
 * A slug that appears with different dates is dropped rather than guessed.
 */
export function contentLastmod(dirs, { root = process.cwd(), jsonDateFields = [] } = {}) {
  const dates = new Map();
  const conflicts = new Set();
  for (const dir of dirs) {
    for (const file of walk(join(root, dir))) {
      const ext = extname(file);
      if (!['.md', '.mdx', '.markdoc', '.json'].includes(ext)) continue;
      const source = readFileSync(file, 'utf8');
      let slug = null;
      let day = null;
      if (ext === '.json') {
        let data;
        try { data = JSON.parse(source); } catch { continue; }
        if (!data || typeof data !== 'object' || Array.isArray(data)) continue;
        slug = typeof data.slug === 'string' ? data.slug : null;
        day = pick(key => (key.includes('.') ? jsonPath(data, key) : data[key]), jsonDateFields);
      } else {
        if (!source.startsWith('---')) continue;
        const end = source.indexOf('\n---', 3);
        if (end < 0) continue;
        const frontmatter = source.slice(3, end);
        if (/^draft:\s*true\b/m.test(frontmatter)) continue;
        slug = frontmatterValue(frontmatter, 'slug')?.replace(/^['"]|['"]$/g, '') ?? null;
        day = pick(key => frontmatterValue(frontmatter, key));
      }
      if (!day) continue;
      const name = basename(file, ext);
      const key = (slug || (name === 'index' ? basename(dirname(file)) : name)).replace(/^\/+|\/+$/g, '').split('/').pop();
      if (!key) continue;
      if (dates.has(key) && dates.get(key) !== day) conflicts.add(key);
      else dates.set(key, day);
    }
  }
  for (const key of conflicts) dates.delete(key);
  return dates;
}

/** Wrap an @astrojs/sitemap serialize hook so matching URLs get the content date. */
export function withLastmod(dates, serialize) {
  return item => {
    const segments = new URL(item.url).pathname.split('/').filter(Boolean);
    const last = segments.length ? decodeURIComponent(segments[segments.length - 1]) : null;
    if (last && dates.has(last)) item.lastmod = dates.get(last);
    return serialize ? serialize(item) : item;
  };
}

export const projectRoot = configUrl => dirname(fileURLToPath(configUrl));
