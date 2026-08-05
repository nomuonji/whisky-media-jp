import type { Whisky } from '../utils/whisky';
import type { SortKey } from '../utils/whisky';

/**
 * 「味で選ぶ」の入口。
 * 8軸の閾値を読者の言葉に翻訳する定義で、`/flavor/[flavor]` が生成される。
 * （getStaticPaths はコンポーネント外に巻き上げられるため、定義はこのファイルに置く）
 */
export interface FlavorFilter {
  label: string;
  lead: string;
  match: (w: Whisky) => boolean;
  sort: SortKey;
}

export const FLAVOR_FILTERS: Record<string, FlavorFilter> = {
  peaty: {
    label: 'ピーティ・スモーキー',
    lead: 'ピートの効いた煙たい味わい。好みは分かれますが、ハマると抜け出せません。',
    match: (w) => w.data.flavor.peat >= 3,
    sort: 'rating',
  },
  sweet: {
    label: '甘口',
    lead: '蜂蜜やバニラのような甘さが前に出るタイプ。ウイスキーの入口として選びやすい。',
    match: (w) => w.data.flavor.sweet >= 4,
    sort: 'rating',
  },
  fruity: {
    label: 'フルーティ',
    lead: '果実感が主役。華やかな香りを楽しみたいときに。',
    match: (w) => w.data.flavor.fruity >= 4,
    sort: 'rating',
  },
  mild: {
    label: 'クセが少ない',
    lead: 'ピートがほとんど無く、飲みやすいタイプ。最初の1本や贈り物に。',
    match: (w) => w.data.flavor.peat <= 1,
    sort: 'cospa',
  },
  rich: {
    label: 'コクが強い',
    lead: 'ボディが厚く、飲みごたえがあるタイプ。ストレートでじっくり。',
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
