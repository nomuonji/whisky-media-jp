import { SITE } from '../data/site';
import type { Category } from '../types/content';

export const postUrl = (slug: string) => `/${slug}/`;
export const categoryUrl = (cat: Category | string) => `/category/${cat}/`;

const FLAVOR_TAG_URLS: Record<string, string> = {
  'スモーキー': '/flavor/peaty/',
  'ピーティ': '/flavor/peaty/',
  '甘口': '/flavor/sweet/',
  'フルーティ': '/flavor/fruity/',
  'クセが少ない': '/flavor/mild/',
  'コクが強い': '/flavor/rich/',
};

/** 味わいtaxonomyと同じ意図のタグは正式な /flavor/ ページへ寄せる。 */
export const tagUrl = (tag: string) =>
  FLAVOR_TAG_URLS[tag] ?? `/tag/${encodeURIComponent(tag)}/`;

export const articlesUrl = (page = 1) => (page <= 1 ? '/articles/' : `/articles/page/${page}/`);
export const whiskyUrl = (id: string) => `/whisky/${id}/`;
export const regionUrl = (region: string) => `/region/${region}/`;

/** サイトURLを前置した絶対URL（OGP・JSON-LD・RSS用） */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE.url.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

/** ナビの現在地判定。'/' は完全一致、それ以外は前方一致 */
export function isCurrentPath(href: string, currentPath: string): boolean {
  if (href === '/') return currentPath === '/';
  return currentPath.startsWith(href);
}
