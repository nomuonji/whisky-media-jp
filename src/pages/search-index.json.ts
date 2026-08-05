import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../utils/posts';
import { categoryLabel } from '../data/categories';
import { formatDate } from '../utils/date';
import { postUrl } from '../utils/url';
import { getWhiskies, whiskyUrl, priceLabel, ageLabel } from '../utils/whisky';
import { getDistilleries, distilleryUrl } from '../utils/distillery';
import { REGION_LABELS, TYPE_LABELS } from '../types/taxonomy';

/** クライアント検索用の軽量インデックス（記事・銘柄・蒸留所を横断する。本文は含めない） */
export const GET: APIRoute = async () => {
  const [posts, whiskies, distilleries] = await Promise.all([
    getPublishedPosts(),
    getWhiskies(),
    getDistilleries(),
  ]);

  const index = [
    ...whiskies.map((w) => ({
      kind: 'whisky' as const,
      kindLabel: '銘柄',
      title: w.data.name,
      url: whiskyUrl(w.id),
      excerpt: w.data.notes,
      meta: `${REGION_LABELS[w.data.region]}／${TYPE_LABELS[w.data.type]}／${ageLabel(w.data.age)}／${priceLabel(w.data.priceYen)}`,
      // 英語名・蒸留所名でも引けるようにする
      keywords: [w.data.nameEn, w.data.distillery, REGION_LABELS[w.data.region], TYPE_LABELS[w.data.type]],
    })),
    ...distilleries.map((d) => ({
      kind: 'distillery' as const,
      kindLabel: '蒸留所',
      title: d.data.name,
      url: distilleryUrl(d.id),
      excerpt: d.data.notes,
      meta: `${REGION_LABELS[d.data.region]}${d.data.founded ? `／${d.data.founded}年創業` : ''}`,
      keywords: [d.data.nameEn, d.data.owner ?? '', REGION_LABELS[d.data.region]],
    })),
    ...posts.map((post) => ({
      kind: 'post' as const,
      kindLabel: '記事',
      title: post.data.title,
      url: postUrl(post.slug),
      excerpt: post.data.excerpt ?? '',
      meta: `${categoryLabel(post.data.category)}／${formatDate(post.data.date)}`,
      keywords: post.data.tags ?? [],
    })),
  ];

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
