/** 2026年8月6日 */
export function formatDate(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 2026.08.06 */
export function formatDateShort(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${mm}.${dd}`;
}

/** 2026-08-06 — <time datetime> と JSON-LD 用 */
export function toDateAttr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** 記事が公開済みか（未来日付の下書きを本番で隠す） */
export function isPublished(d: Date, now: Date = new Date()): boolean {
  return d.getTime() <= now.getTime();
}
