import type { SiteConfig } from '../types/site';

export const SITE: SiteConfig = {
  name: 'Whisky Data JP',
  url: 'https://whisky-data.jp',
  description: 'Whiskybase 20万本のデータを日本語で整理・可視化。レーダーチャートで味の傾向比較、価格推移グラフ、蒸留所系統図。',
  locale: 'ja_JP',
  ogImage: '/images/ogp-default.png',
  twitter: '@whisky_data_jp',
  copyright: 'Whisky Data JP',
  startYear: 2026,
  // AmazonアソシエイトのトラッキングIDに置き換えること。
  // この値は全アフィリエイトURLの ?tag= に自動で付与される。
  amazonTag: 'your-associates-tag-22',
};
