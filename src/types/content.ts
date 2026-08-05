// === Category ===
export const CATEGORIES = [
  'scotch', 'japanese', 'bourbon', 'irish', 'world', 'guide', 'news',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  scotch: 'スコッチ',
  japanese: 'ジャパニーズ',
  bourbon: 'バーボン',
  irish: 'アイリッシュ',
  world: 'ワールド',
  guide: '初心者ガイド',
  news: 'ニュース',
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  scotch: 'スコッチウイスキーのレビュー・比較・データ分析',
  japanese: 'ジャパニーズウイスキーの最新情報・レビュー・投資データ',
  bourbon: 'バーボン・テネシーウイスキーのレビューとおすすめ',
  irish: 'アイリッシュウイスキーの入門ガイドとレビュー',
  world: 'スコッチ以外のワールドウイスキー情報',
  guide: 'ウイスキー初心者のための基礎知識・選び方ガイド',
  news: 'ウイスキー業界ニュース・新作・価格動向',
};
