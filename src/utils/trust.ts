import type { Whisky } from './whisky';

/**
 * Search/index readiness is evidence-gated.
 * A bottle page is index-ready only when we have an explicit primary source
 * or a checked Whiskybase record stored on the bottle itself.
 */
export function isIndexReadyWhisky(whisky: Whisky): boolean {
  return Boolean(whisky.data.officialSourceUrl || whisky.data.whiskybase?.checkedAt);
}

export function hasSourcedPrice(whisky: Whisky): boolean {
  const { priceYen, priceSource, priceSourceUrl } = whisky.data;
  return Boolean(priceYen && priceSource !== 'editorial' && priceSourceUrl);
}

export function sourcedPrice(whisky: Whisky): number | null {
  return hasSourcedPrice(whisky) ? whisky.data.priceYen ?? null : null;
}

export function sourceStatusLabel(whisky: Whisky): string {
  if (whisky.data.officialSourceUrl) return '公式情報確認済み';
  if (whisky.data.whiskybase?.checkedAt) return '外部データ確認済み';
  return 'カタログ登録';
}
