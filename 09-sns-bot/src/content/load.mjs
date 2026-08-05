// サイトのコンテンツ（記事・銘柄・蒸留所・OGP画像）を読み込む。
// ネタ元: src/content/*（唯一の情報源。botはここしか見ない）。

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

// 記事の YAML frontmatter を軽量に解析（必要なキーだけ）。
export function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { data: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: text };
  const fm = text.slice(3, end);
  const data = {};
  for (const line of fm.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    let key = m[1];
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (val.startsWith('[') && val.endsWith(']')) {
      val = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => (s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s));
    }
    data[key] = val;
  }
  return { data, body: text.slice(end + 4) };
}

function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function listArticles(contentDir) {
  const dir = path.join(contentDir, 'blog');
  if (!existsSync(dir)) return [];
  const today = todayStr();
  const out = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const raw = readFileSync(path.join(dir, file), 'utf8');
    const { data } = parseFrontmatter(raw);
    if (data.draft === true) continue;
    if (typeof data.date === 'string' && data.date > today) continue;
    const slug = file.replace(/\.md$/, '');
    out.push({
      slug,
      file,
      title: data.title || slug,
      date: data.date || '',
      excerpt: data.excerpt || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      category: data.category || '',
      compare: Array.isArray(data.compare) ? data.compare : [],
      affiliateIds: Array.isArray(data.affiliate_ids) ? data.affiliate_ids : [],
    });
  }
  out.sort((a, b) => (a.date < b.date ? 1 : -1));
  return out;
}

export function listWhiskies(contentDir) {
  const dir = path.join(contentDir, 'whiskies');
  if (!existsSync(dir)) return [];
  const out = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    try {
      const data = JSON.parse(readFileSync(path.join(dir, file), 'utf8'));
      out.push({ id: file.replace(/\.json$/, ''), ...data });
    } catch (err) {
      console.warn(`[load] skip broken whisky JSON: ${file} (${err.message})`);
    }
  }
  return out;
}

export function listDistilleries(contentDir) {
  const dir = path.join(contentDir, 'distilleries');
  if (!existsSync(dir)) return [];
  const out = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    try {
      const data = JSON.parse(readFileSync(path.join(dir, file), 'utf8'));
      out.push({ id: file.replace(/\.json$/, ''), ...data });
    } catch (err) {
      console.warn(`[load] skip broken distillery JSON: ${file} (${err.message})`);
    }
  }
  return out;
}

// 対応するOGP画像があれば絶対パスを返す（なければ null）。
export function findOgp(ogpDir, id) {
  const p = path.join(ogpDir, `whisky-${id}.png`);
  return existsSync(p) ? p : null;
}

export function loadAll(cfg) {
  return {
    articles: listArticles(cfg.contentDir),
    whiskies: listWhiskies(cfg.contentDir),
    distilleries: listDistilleries(cfg.contentDir),
  };
}
