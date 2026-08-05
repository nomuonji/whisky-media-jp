import { SITE } from '../data/site';
import type { Category } from '../types/content';

export const postUrl = (slug: string) => `/${slug}/`;
export const categoryUrl = (cat: Category | string) => `/category/${cat}/`;
export const tagUrl = (tag: string) => `/tag/${encodeURIComponent(tag)}/`;
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
