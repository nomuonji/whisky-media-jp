export const POSTS_PER_PAGE = 10;

export interface PageInfo<T> {
  items: T[];
  current: number;
  total: number;
  prevUrl?: string;
  nextUrl?: string;
}

export function totalPages(count: number, perPage: number = POSTS_PER_PAGE): number {
  return Math.max(1, Math.ceil(count / perPage));
}

/**
 * 配列を1ページ分に切り出す。
 * `hrefFor` はページ番号→URL（1ページ目は '/' など）を返す関数。
 */
export function paginate<T>(
  items: T[],
  current: number,
  hrefFor: (page: number) => string,
  perPage: number = POSTS_PER_PAGE
): PageInfo<T> {
  const total = totalPages(items.length, perPage);
  const page = Math.min(Math.max(1, current), total);
  const start = (page - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    current: page,
    total,
    prevUrl: page > 1 ? hrefFor(page - 1) : undefined,
    nextUrl: page < total ? hrefFor(page + 1) : undefined,
  };
}

/**
 * ページ番号リンクの並び。省略部分は null（… 表示用）。
 * 例: 1 … 4 5 [6] 7 8 … 20
 */
export function pageRange(current: number, total: number, around = 1): (number | null)[] {
  const pages = new Set<number>([1, total, current]);
  for (let i = 1; i <= around; i++) {
    if (current - i >= 1) pages.add(current - i);
    if (current + i <= total) pages.add(current + i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push(null);
    out.push(p);
    prev = p;
  }
  return out;
}
