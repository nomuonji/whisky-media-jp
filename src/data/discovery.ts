import type { Whisky } from '../utils/whisky';
import type { SortKey } from '../utils/whisky';
import { sourcedPrice } from '../utils/trust';

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

/** 内部探索用の選択。未検証価格・編集点数による順位は廃止。一次情報価格のみ使用。 */
export interface RankingDef {
  label: string;
  lead: string;
  filter: (w: Whisky) => boolean;
  sort: SortKey;
  showCospa: boolean;
  emptyMessage: string;
}

export const RANKINGS: Record<string, RankingDef> = {
  cospa: {
    label: '参考価格のある銘柄',
    lead: '一次情報で確認できる参考価格を持つ銘柄の選択です。順位やコスパ評価は行いません。価格は変動し、購入時の確認が必要です。',
    filter: (w) => sourcedPrice(w) !== null,
    sort: 'name',
    showCospa: false,
    emptyMessage: '価格の一次根拠がまだない銘柄のみです。',
  },
  rating: {
    label: 'カタログ選択',
    lead: '編集部評価に基づく順位は廃止しました。出典確認済みの銘柄を名前順で表示します。詳細比較は /compare/ をご利用ください。',
    filter: (w) => true,
    sort: 'name',
    showCospa: false,
    emptyMessage: '',
  },
  beginner: {
    label: '入手しやすい価格帯',
    lead: '一次情報で確認できる参考価格が5,000円以下で、入手しやすいとされる銘柄の選択です。順位や「初心者向け」評価は行いません。価格は変動します。',
    filter: (w) => {
      const p = sourcedPrice(w);
      return p !== null && p <= 5000 && w.data.availability === 'common';
    },
    sort: 'name',
    showCospa: false,
    emptyMessage: '価格の一次根拠がまだないか、条件に合う銘柄がありません。',
  },
  premium: {
    label: '高めの価格帯',
    lead: '一次情報で確認できる参考価格が10,000円以上の銘柄の選択です。順位は行いません。価格は変動します。',
    filter: (w) => {
      const p = sourcedPrice(w);
      return p !== null && p >= 10000;
    },
    sort: 'name',
    showCospa: false,
    emptyMessage: '価格の一次根拠がまだないか、条件に合う銘柄がありません。',
  },
};
