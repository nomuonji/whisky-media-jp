import { getCollection, type CollectionEntry } from 'astro:content';
import { REGIONS, REGION_LABELS, type Region } from '../types/taxonomy';
import { getWhiskies, type Whisky } from './whisky';

export type Distillery = CollectionEntry<'distilleries'>;

export const distilleryUrl = (id: string) => `/distillery/${id}/`;

/** 創業年の古い順（不明は末尾） */
export async function getDistilleries(): Promise<Distillery[]> {
  const all = await getCollection('distilleries');
  return all.sort((a, b) => (a.data.founded ?? 9999) - (b.data.founded ?? 9999));
}

/** その蒸留所の銘柄。銘柄側の distillerySlug で紐付ける */
export function whiskiesOf(distillery: Distillery, whiskies: Whisky[]): Whisky[] {
  return whiskies.filter((w) => w.data.distillerySlug === distillery.id);
}

export interface RegionSummary {
  region: Region;
  label: string;
  distilleries: Distillery[];
  whiskyCount: number;
}

/** 地域ごとの蒸留所・銘柄数をまとめる（マップ表示用） */
export async function getRegionSummaries(): Promise<RegionSummary[]> {
  const [distilleries, whiskies] = await Promise.all([getDistilleries(), getWhiskies()]);

  return REGIONS.map((region) => ({
    region,
    label: REGION_LABELS[region],
    distilleries: distilleries.filter((d) => d.data.region === region),
    whiskyCount: whiskies.filter((w) => w.data.region === region).length,
  })).filter((s) => s.distilleries.length > 0 || s.whiskyCount > 0);
}
