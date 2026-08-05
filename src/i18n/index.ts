import { ja } from './ja';
import { en } from './en';

export const DEFAULT_LOCALE = 'ja' as const;
export const LOCALES = ['ja', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** リテラル型（'スコッチ'）を string に緩めて、言語間で同じ形として扱えるようにする */
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof ja>;

const dictionaries: Record<Locale, Dictionary> = {
  ja,
  // 英語版は未完成。セクション単位で未訳のキーは日本語にフォールバックする
  en: { ...ja, ...en },
};

export function useTranslations(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

/** URLパスから言語を判定する（/en/... なら 'en'） */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0];
  return (LOCALES as readonly string[]).includes(first) ? (first as Locale) : DEFAULT_LOCALE;
}

/** 変数を埋める: t('© {year} {name}', { year: 2026, name: 'X' }) */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match
  );
}

export { ja, en };
