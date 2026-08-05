export interface AffiliateLink {
  name: string;
  /** 未指定の場合は銘柄名からアソシエイトタグ付きURLを自動生成する */
  url?: string;
  price?: number;
}

export interface AffiliateData {
  amazon_jp?: AffiliateLink[];
  amazon_us?: AffiliateLink[];
  rakuten?: AffiliateLink[];
}

export type AffiliateStore = 'amazon_jp' | 'amazon_us' | 'rakuten';

export const STORE_LABELS: Record<AffiliateStore, string> = {
  amazon_jp: 'Amazon.co.jp',
  amazon_us: 'Amazon.com',
  rakuten: '楽天市場',
};
