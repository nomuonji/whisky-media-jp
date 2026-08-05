import type { AffiliateData } from '../types/affiliate';

/**
 * アフィリエイトリンクDB。
 * 記事Frontmatterには ID（例: `affiliate_ids: [yamazaki-12]`）だけを書き、
 * URLの実体はここに集約する。URL変更時の修正はこの1ファイルで完結する。
 *
 * ※ `url` は省略可能。省略すると銘柄名（name）からAmazon検索リンクを
 *    アソシエイトタグ付きで自動生成する（tag は src/data/site.ts の amazonTag）。
 *    特定の商品ページに固定したいときだけ ASIN 付きURLを入れること。
 */
export const AFFILIATE_DB: Record<string, AffiliateData> = {
  'yamazaki-12': {
    amazon_jp: [{ name: '山崎12年', price: 16800 }],
  },
  'hakushu-12': {
    amazon_jp: [{ name: '白州12年', price: 14800 }],
  },
  'glenfiddich-12': {
    amazon_jp: [{ name: 'グレンフィディック12年', price: 2980 }],
  },
  'makers-mark': {
    amazon_jp: [{ name: 'メーカーズマーク', price: 2480 }],
  },
  jameson: {
    amazon_jp: [{ name: 'ジェムソン', price: 1980 }],
  },
  'wild-turkey-8': {
    amazon_jp: [{ name: 'ワイルドターキー 8年', price: 2580 }],
  },
  'white-horse': {
    amazon_jp: [{ name: 'ホワイトホース', price: 1480 }],
  },
};

export type AffiliateId = keyof typeof AFFILIATE_DB;
