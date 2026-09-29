import type { Whisky } from '../utils/whisky';
import type { SortKey } from '../utils/whisky';

/**
 * 「味で選ぶ」の入口。
 * flavor 0〜5 は糖分量・化学分析値ではなく編集部の官能評価。
 * 閾値は一覧を作るための相対基準であり、万人共通の味覚を示さない。
 */
export interface FlavorFilter {
  label: string;
  lead: string;
  criteria: string;
  match: (w: Whisky) => boolean;
  sort: SortKey;
}

export const FLAVOR_FILTERS: Record<string, FlavorFilter> = {
  peaty: {
    label: 'ピーティ・スモーキー',
    lead: 'ピート由来の煙・土・薬品などを連想する香味を感じやすい銘柄を探す入口です。',
    criteria: '編集部の peat スコアが3/5以上。化学分析値ではありません。',
    match: (w) => w.data.flavor.peat >= 3,
    sort: 'rating',
  },
  sweet: {
    label: '甘口',
    lead: '編集部が味覚として甘さを比較的強く感じた銘柄の一覧です。バニラ香など「甘い香り」と、舌で感じる甘味は同じものとして扱いません。',
    criteria: '編集部の sweet スコアが4/5以上。糖分量の測定値ではなく、掲載銘柄内での相対的な官能評価です。',
    match: (w) => w.data.flavor.sweet >= 4,
    sort: 'rating',
  },
  fruity: {
    label: 'フルーティ',
    lead: '果実を連想する香味を編集部が比較的強く感じた銘柄です。',
    criteria: '編集部の fruity スコアが4/5以上。香気成分の分析値ではありません。',
    match: (w) => w.data.flavor.fruity >= 4,
    sort: 'rating',
  },
  mild: {
    label: 'クセが少ない',
    lead: '編集部評価でピート感が弱い銘柄を探す入口です。「誰にとっても飲みやすい」という意味ではありません。',
    criteria: '編集部の peat スコアが1/5以下。',
    match: (w) => w.data.flavor.peat <= 1,
    sort: 'cospa',
  },
  rich: {
    label: 'コクが強い',
    lead: '編集部がボディの厚みを比較的強く感じた銘柄です。',
    criteria: '編集部の body スコアが4/5以上。',
    match: (w) => w.data.flavor.body >= 4,
    sort: 'rating',
  },
};

/** ランキングの定義。`/ranking/[kind]` が生成される */
export interface RankingDef {
  label: string;
  lead: string;
  filter: (w: Whisky) => boolean;
  sort: SortKey;
  showCospa: boolean;
}

export const RANKINGS: Record<string, RankingDef> = {
  cospa: {
    label: 'コスパ',
    lead: '1点あたりの価格（参考価格 ÷ 編集部評価）が安い順。数字が小さいほど「点数のわりに安い」ことになります。',
    filter: (w) => Boolean(w.data.priceYen),
    sort: 'cospa',
    showCospa: true,
  },
  rating: {
    label: '評価',
    lead: '編集部評価の高い順。価格は考慮していません。',
    filter: () => true,
    sort: 'rating',
    showCospa: false,
  },
  beginner: {
    label: '初心者向け',
    lead: 'ピートが弱く、5,000円以下で手に入り、入手しやすい銘柄。最初の1本を選ぶための順位です。',
    filter: (w) =>
      w.data.flavor.peat <= 2 &&
      Boolean(w.data.priceYen && w.data.priceYen <= 5000) &&
      w.data.availability === 'common',
    sort: 'rating',
    showCospa: true,
  },
  premium: {
    label: '一段上',
    lead: '10,000円以上の銘柄を評価順に。贈り物や記念日の1本を選ぶために。',
    filter: (w) => Boolean(w.data.priceYen && w.data.priceYen >= 10000),
    sort: 'rating',
    showCospa: false,
  },
};
