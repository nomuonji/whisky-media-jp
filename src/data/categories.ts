import { CATEGORIES, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, type Category } from '../types/content';

export { CATEGORIES, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS };
export type { Category };

/** 未知のカテゴリでも落ちないラベル解決 */
export function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat as Category] ?? cat;
}

export function categoryDescription(cat: string): string {
  return CATEGORY_DESCRIPTIONS[cat as Category] ?? '';
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
