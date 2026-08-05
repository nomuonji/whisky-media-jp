import { defineCollection, z } from 'astro:content';
import { CATEGORIES } from '../types/content';
import { COUNTRIES, REGIONS, WHISKY_TYPES } from '../types/taxonomy';

const affiliateLink = z.object({
  name: z.string(),
  url: z.string(),
  price: z.number().optional(),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    updated: z.date().optional(),
    category: z.enum(CATEGORIES),
    tags: z.array(z.string()).default([]),
    excerpt: z.string().optional(),
    /** true の間はビルド対象から外す */
    draft: z.boolean().default(false),

    /** 推奨：data/affiliates.ts のID */
    affiliate_ids: z.array(z.string()).default([]),
    /** 旧形式：Frontmatter直書き（移行期のみサポート） */
    affiliate: z.object({
      amazon_jp: z.array(affiliateLink).optional(),
      amazon_us: z.array(affiliateLink).optional(),
      rakuten: z.array(affiliateLink).optional(),
    }).optional(),

    /** content/whiskies/ のID。渡すと比較表を自動生成する */
    compare: z.array(z.string()).default([]),
    /** 記事で紹介した銘柄。省略時は本文から自動で拾う */
    whiskies: z.array(z.string()).default([]),

    radar_chart: z.object({
      labels: z.array(z.string()),
      datasets: z.array(z.object({
        name: z.string(),
        data: z.array(z.number()),
        color: z.string(),
      })),
    }).optional(),

    seo: z.object({
      description: z.string().max(160),
      og_image: z.string().optional(),
    }).optional(),
  }),
});

/**
 * 銘柄コレクション。
 * 数値には必ず出典区分を持たせる（site-requirements.md §5）。
 *   official   … 公式表記（度数・熟成年数・タイプなど）
 *   market     … 市場価格の実測
 *   editorial  … 編集部の推定・評価
 */
const whiskyCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    nameEn: z.string(),
    distillery: z.string(),
    distillerySlug: z.string().optional(),
    country: z.enum(COUNTRIES),
    region: z.enum(REGIONS),
    type: z.enum(WHISKY_TYPES),
    /** NAS（熟成年数非表記）は省略 */
    age: z.number().optional(),
    abv: z.number(),
    cask: z.array(z.string()).default([]),

    /** 参考価格（円・700ml換算）。基準日と出典区分を必ず持つ */
    priceYen: z.number().optional(),
    priceAsOf: z.string().optional(),
    priceSource: z.enum(['market', 'editorial']).default('editorial'),
    availability: z.enum(['common', 'limited', 'rare']).default('common'),

    /** 編集部評価（100点）。Whiskybaseのスコアとは別物 */
    rating: z.number().min(0).max(100),

    /** 味の8軸（0〜5）。公開データが無いため編集部推定 */
    flavor: z.object({
      peat: z.number().min(0).max(5),
      sweet: z.number().min(0).max(5),
      fruity: z.number().min(0).max(5),
      spicy: z.number().min(0).max(5),
      oak: z.number().min(0).max(5),
      smoky: z.number().min(0).max(5),
      complex: z.number().min(0).max(5),
      body: z.number().min(0).max(5),
    }),

    notes: z.string(),
    recommendedFor: z.array(z.string()).default([]),
    affiliateId: z.string().optional(),

    /** 実際にWhiskybaseで確認できたときだけ埋める。推測で書かない */
    whiskybase: z.object({
      score: z.number(),
      votes: z.number(),
      checkedAt: z.string(),
    }).optional(),
  }),
});

/**
 * 蒸留所コレクション。
 * 緯度経度はおおよその位置（地図の配置用であり、正確な所在地を示すものではない）。
 */
const distilleryCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    nameEn: z.string(),
    country: z.enum(COUNTRIES),
    region: z.enum(REGIONS),
    founded: z.number().optional(),
    owner: z.string().optional(),
    lat: z.number().optional(),
    lon: z.number().optional(),
    waterSource: z.string().optional(),
    notes: z.string(),
  }),
});

export const collections = {
  blog: blogCollection,
  whiskies: whiskyCollection,
  distilleries: distilleryCollection,
};
