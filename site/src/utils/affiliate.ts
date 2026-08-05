import { AFFILIATE_DB } from '../data/affiliates';
import { SITE } from '../data/site';
import { STORE_LABELS, type AffiliateData, type AffiliateLink, type AffiliateStore } from '../types/affiliate';

export interface ResolvedLink extends AffiliateLink {
  store: AffiliateStore;
  storeLabel: string;
}

/** 表示順（国内優先） */
const STORE_ORDER: AffiliateStore[] = ['amazon_jp', 'rakuten', 'amazon_us'];

const AMAZON_DOMAINS: Record<'amazon_jp' | 'amazon_us', string> = {
  amazon_jp: 'amazon.co.jp',
  amazon_us: 'amazon.com',
};

/** URLがまだ未設定（プレースホルダ等）かどうか */
function isPlaceholder(url?: string): boolean {
  return !url || url.includes('...') || url.endsWith('/dp/');
}

/**
 * アソシエイトタグ付きのAmazon検索URL。
 * PA-API（直近30日に3件以上の成約）が無くても使える、
 * SiteStripeの検索ボックスと同じ形式のリンク。
 */
export function buildAmazonUrl(
  productName: string,
  store: 'amazon_jp' | 'amazon_us' = 'amazon_jp',
  tag = SITE.amazonTag
): string {
  return `https://www.${AMAZON_DOMAINS[store]}/s?k=${encodeURIComponent(productName)}&tag=${encodeURIComponent(tag)}`;
}

/** URL未指定のAmazonリンクに銘柄名からタグ付きURLを補完する */
function ensureAmazonUrl(link: ResolvedLink): ResolvedLink {
  if ((link.store === 'amazon_jp' || link.store === 'amazon_us') && isPlaceholder(link.url)) {
    return { ...link, url: buildAmazonUrl(link.name, link.store) };
  }
  return link;
}

/**
 * URLを持たないリンクを表示すると壊れるため、補完後にURLの無いものを除く。
 */
function ensureUrl(link: ResolvedLink): ResolvedLink | null {
  return link.url ? link : null;
}

/** AffiliateData を表示用のフラットな配列に変換する */
export function flattenAffiliate(data: AffiliateData | undefined): ResolvedLink[] {
  if (!data) return [];
  return STORE_ORDER.flatMap((store) =>
    (data[store] || []).map((link) => ({
      ...link,
      store,
      storeLabel: STORE_LABELS[store],
    }))
  );
}

/**
 * 記事から購入リンクを解決する。
 * - `ids`: data/affiliates.ts のID（推奨）
 * - `inline`: Frontmatterに直書きされた旧形式（移行期のみサポート）
 * 同一URLは重複排除する。
 */
export function resolveAffiliateLinks(
  ids: string[] = [],
  inline?: AffiliateData
): ResolvedLink[] {
  const fromIds = ids.flatMap((id) => flattenAffiliate(AFFILIATE_DB[id]));
  const all = [...fromIds, ...flattenAffiliate(inline)]
    .map(ensureAmazonUrl)
    .map(ensureUrl)
    .filter((l): l is ResolvedLink => Boolean(l));

  const seen = new Set<string>();
  return all.filter((link) => {
    const key = `${link.store}:${link.name}:${link.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * 明示的な登録が無い銘柄向けの自動リンク。
 * 銘柄名からアソシエイトタグ付きのAmazon検索リンクを生成する。
 */
export function buildAffiliateLink(productName: string): ResolvedLink {
  return {
    name: productName,
    url: buildAmazonUrl(productName, 'amazon_jp'),
    store: 'amazon_jp',
    storeLabel: STORE_LABELS.amazon_jp,
  };
}

/** ¥16,800 / $199 */
export function formatPrice(price: number, store: AffiliateStore): string {
  return store === 'amazon_us'
    ? `$${price.toLocaleString('en-US')}`
    : `¥${price.toLocaleString('ja-JP')}`;
}
