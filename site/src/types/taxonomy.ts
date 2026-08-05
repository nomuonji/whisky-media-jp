// === 国 ===
export const COUNTRIES = ['scotland', 'japan', 'usa', 'ireland', 'taiwan', 'india', 'australia'] as const;
export type Country = (typeof COUNTRIES)[number];

export const COUNTRY_LABELS: Record<Country, string> = {
  scotland: 'スコットランド',
  japan: '日本',
  usa: 'アメリカ',
  ireland: 'アイルランド',
  taiwan: '台湾',
  india: 'インド',
  australia: 'オーストラリア',
};

// === 地域 ===
export const REGIONS = [
  'islay', 'speyside', 'highland', 'lowland', 'campbeltown', 'island',
  'japan', 'kentucky', 'tennessee', 'ireland', 'taiwan', 'india', 'australia',
] as const;
export type Region = (typeof REGIONS)[number];

export const REGION_LABELS: Record<Region, string> = {
  islay: 'アイラ',
  speyside: 'スペイサイド',
  highland: 'ハイランド',
  lowland: 'ローランド',
  campbeltown: 'キャンベルタウン',
  island: 'アイランズ',
  japan: '日本',
  kentucky: 'ケンタッキー',
  tennessee: 'テネシー',
  ireland: 'アイルランド',
  taiwan: '台湾',
  india: 'インド',
  australia: 'オーストラリア',
};

export const REGION_DESCRIPTIONS: Record<Region, string> = {
  islay: 'ピートの効いたスモーキーな味わいで知られる島。好き嫌いがはっきり分かれる',
  speyside: '蒸留所が最も密集する地域。華やかでフルーティ、シェリー樽熟成が多い',
  highland: '広大な地域で個性は多様。全体に麦の甘みとコクがある',
  lowland: '軽やかで穏やか。ウイスキー入門に向く',
  campbeltown: 'かつての一大産地。塩気とオイリーさが特徴',
  island: 'アイラ以外の島々。潮の香りとほのかなスモーク',
  japan: '繊細でバランス重視。ミズナラ樽など日本独自の要素',
  kentucky: 'バーボンの本場。新樽由来のバニラとキャラメルの甘み',
  tennessee: 'メイプル炭で濾過するチャコール・メロウイング製法',
  ireland: '3回蒸留による軽やかで滑らかな口当たり',
  taiwan: '亜熱帯の急速熟成。濃厚でトロピカルな果実感',
  india: '高温熟成による凝縮感。スパイシーで力強い',
  australia: 'ワイン樽の使用が盛ん。果実味と樽由来の甘みが強く出る',
};

/** 地域 → 国 */
export const REGION_COUNTRY: Record<Region, Country> = {
  islay: 'scotland',
  speyside: 'scotland',
  highland: 'scotland',
  lowland: 'scotland',
  campbeltown: 'scotland',
  island: 'scotland',
  japan: 'japan',
  kentucky: 'usa',
  tennessee: 'usa',
  ireland: 'ireland',
  taiwan: 'taiwan',
  india: 'india',
  australia: 'australia',
};

// === 種類 ===
export const WHISKY_TYPES = [
  'single-malt', 'blended', 'blended-malt', 'grain', 'bourbon', 'tennessee', 'rye',
] as const;
export type WhiskyType = (typeof WHISKY_TYPES)[number];

export const TYPE_LABELS: Record<WhiskyType, string> = {
  'single-malt': 'シングルモルト',
  blended: 'ブレンデッド',
  'blended-malt': 'ブレンデッドモルト',
  grain: 'グレーン',
  bourbon: 'バーボン',
  tennessee: 'テネシー',
  rye: 'ライ',
};

// === 味の8軸 ===
export const FLAVOR_AXES = [
  'peat', 'sweet', 'fruity', 'spicy', 'oak', 'smoky', 'complex', 'body',
] as const;
export type FlavorAxis = (typeof FLAVOR_AXES)[number];

export const FLAVOR_LABELS: Record<FlavorAxis, string> = {
  peat: 'ピート',
  sweet: '甘さ',
  fruity: 'フルーティ',
  spicy: 'スパイシー',
  oak: 'オーク',
  smoky: 'スモーキー',
  complex: '複雑さ',
  body: 'ボディ',
};

export type Flavor = Record<FlavorAxis, number>;

// === 価格帯 ===
export const PRICE_BANDS = [
  { id: '3000', label: '〜3,000円', max: 3000 },
  { id: '5000', label: '3,000〜5,000円', max: 5000 },
  { id: '10000', label: '5,000〜10,000円', max: 10000 },
  { id: '20000', label: '10,000〜20,000円', max: 20000 },
  { id: 'over', label: '20,000円〜', max: Infinity },
] as const;
export type PriceBandId = (typeof PRICE_BANDS)[number]['id'];

// === 入手しやすさ ===
export const AVAILABILITY_LABELS: Record<'common' | 'limited' | 'rare', string> = {
  common: '入手しやすい',
  limited: 'やや品薄',
  rare: '入手困難',
};

// === 出典区分 ===
export const SOURCE_LABELS = {
  official: '公式表記',
  market: '市場価格の実測',
  editorial: '編集部推定',
} as const;
