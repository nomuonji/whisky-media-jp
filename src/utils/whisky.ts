import { getCollection, type CollectionEntry } from 'astro:content';
import {
  FLAVOR_AXES,
  FLAVOR_LABELS,
  PRICE_BANDS,
  REGION_LABELS,
  TYPE_LABELS,
  type Flavor,
  type PriceBandId,
  type Region,
  type WhiskyType,
} from '../types/taxonomy';
import type { RadarChartData } from '../types/whisky';

export type Whisky = CollectionEntry<'whiskies'>;

/** 全銘柄を編集部評価の高い順で返す */
export async function getWhiskies(): Promise<Whisky[]> {
  const all = await getCollection('whiskies');
  return all.sort((a, b) => b.data.rating - a.data.rating);
}

export async function getWhiskyById(id: string): Promise<Whisky | undefined> {
  const all = await getCollection('whiskies');
  return all.find((w) => w.id === id);
}

/** IDの配列から解決する（未登録IDは黙って無視する） */
export async function getWhiskiesByIds(ids: string[]): Promise<Whisky[]> {
  const all = await getCollection('whiskies');
  const map = new Map<string, Whisky>(all.map((w) => [w.id, w]));
  return ids.map((id) => map.get(id)).filter((w): w is Whisky => Boolean(w));
}

// === 表示用の変換 ===

export const whiskyUrl = (id: string) => `/whisky/${id}/`;

export function typeLabel(type: WhiskyType): string {
  return TYPE_LABELS[type];
}

export function regionLabel(region: Region): string {
  return REGION_LABELS[region];
}

/** 12年 / NAS */
export function ageLabel(age?: number): string {
  return age ? `${age}年` : 'NAS';
}

export function priceLabel(price?: number): string {
  return price ? `${price.toLocaleString('ja-JP')}円` : '—';
}

export function priceBand(price?: number): PriceBandId | null {
  if (!price) return null;
  const band = PRICE_BANDS.find((b) => price <= b.max);
  return band ? band.id : 'over';
}

// === データから導く指標 ===

/** 1点あたりの価格。小さいほどコスパが良い */
export function costPerPoint(w: Whisky): number | null {
  const { priceYen, rating } = w.data;
  if (!priceYen || !rating) return null;
  return Math.round(priceYen / rating);
}

/** 味の8軸の距離。0に近いほど似ている */
export function flavorDistance(a: Flavor, b: Flavor): number {
  const sum = FLAVOR_AXES.reduce((acc, axis) => acc + (a[axis] - b[axis]) ** 2, 0);
  return Math.sqrt(sum);
}

/**
 * 味が似ている銘柄。
 * 味の距離を主、価格帯の近さを従として並べる（同じ味なら買いやすい方を上に）。
 */
export function similarWhiskies(target: Whisky, all: Whisky[], limit = 4): Whisky[] {
  return all
    .filter((w) => w.id !== target.id)
    .map((w) => {
      const distance = flavorDistance(target.data.flavor, w.data.flavor);
      const priceGap =
        target.data.priceYen && w.data.priceYen
          ? Math.abs(Math.log10(w.data.priceYen) - Math.log10(target.data.priceYen))
          : 0.5;
      return { w, score: distance + priceGap };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ w }) => w);
}

/** 表記ゆれ（空白・全角半角）を吸収してから本文と突き合わせる */
function normalize(text: string): string {
  return text
    .replace(/[\s　]/g, '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .toLowerCase();
}

/**
 * 記事本文に登場する銘柄を拾う。
 * Frontmatterの `whiskies` で明示された場合はそちらを優先する。
 */
export function mentionedWhiskies(
  body: string,
  title: string,
  all: Whisky[],
  explicitIds: string[] = []
): Whisky[] {
  if (explicitIds.length > 0) {
    const map = new Map<string, Whisky>(all.map((w) => [w.id, w]));
    return explicitIds.map((id) => map.get(id)).filter((w): w is Whisky => Boolean(w));
  }

  const haystack = normalize(`${title}\n${body}`);
  return all.filter((w) => haystack.includes(normalize(w.data.name)));
}

// === チャート用 ===

const CHART_COLORS = ['#D4A030', '#20B2AA', '#C44D4D', '#4A7C59'];

/** 銘柄をレーダーチャートのデータに変換する */
export function toRadarData(whiskies: Whisky[]): RadarChartData {
  return {
    labels: FLAVOR_AXES.map((axis) => FLAVOR_LABELS[axis]),
    datasets: whiskies.map((w, i) => ({
      name: w.data.name,
      data: FLAVOR_AXES.map((axis) => w.data.flavor[axis]),
      color: CHART_COLORS[i % CHART_COLORS.length],
    })),
  };
}

/** 軸数とデータ数が食い違っているチャートを描かせない */
export function isValidRadarData(data: RadarChartData): boolean {
  if (data.labels.length === 0 || data.datasets.length === 0) return false;
  return data.datasets.every((ds) => ds.data.length === data.labels.length);
}

// === 並び替え ===

export const SORT_KEYS = ['rating', 'price-asc', 'price-desc', 'cospa', 'name'] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_LABELS: Record<SortKey, string> = {
  rating: '評価が高い順',
  'price-asc': '価格が安い順',
  'price-desc': '価格が高い順',
  cospa: 'コスパが良い順',
  name: '名前順',
};

export function sortWhiskies(list: Whisky[], key: SortKey): Whisky[] {
  const sorted = [...list];
  switch (key) {
    case 'price-asc':
      return sorted.sort((a, b) => (a.data.priceYen ?? Infinity) - (b.data.priceYen ?? Infinity));
    case 'price-desc':
      return sorted.sort((a, b) => (b.data.priceYen ?? 0) - (a.data.priceYen ?? 0));
    case 'cospa':
      return sorted.sort((a, b) => (costPerPoint(a) ?? Infinity) - (costPerPoint(b) ?? Infinity));
    case 'name':
      return sorted.sort((a, b) => a.data.name.localeCompare(b.data.name, 'ja'));
    case 'rating':
    default:
      return sorted.sort((a, b) => b.data.rating - a.data.rating);
  }
}
