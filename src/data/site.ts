import type { SiteConfig } from '../types/site';

export const SITE: SiteConfig = {
  name: 'Whisky Data JP',
  // 公開URL: whisky-jp.antonbase.com（astro.config.mjs / 09-sns-bot/src/config.mjs も同様）。
  url: 'https://whisky-jp.antonbase.com',
  description: 'Whiskybase 20万本のデータを日本語で整理・可視化。レーダーチャートで味の傾向比較、価格推移グラフ、蒸留所系統図。',
  locale: 'ja_JP',
  ogImage: '/images/ogp-default.png',
  twitter: '@dekio_g',
  copyright: 'Whisky Data JP',
  startYear: 2026,
  // AmazonアソシエイトのトラッキングID。
  // この値は全アフィリエイトURLの ?tag= に自動で付与される。
  amazonTag: 'whiskey-ja-22',
};
