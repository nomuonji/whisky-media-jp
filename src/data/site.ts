import type { SiteConfig } from '../types/site';

export const SITE: SiteConfig = {
  name: 'Whisky Data JP',
  // 公開URL: whisky-jp.antonbase.com（astro.config.mjs / 09-sns-bot/src/config.mjs も同様）。
  url: 'https://whisky-jp.antonbase.com',
  description: 'ウイスキー200銘柄の仕様を日本語で整理する比較データベース。地域・タイプ・熟成年数・度数・樽・出典を横断し、確認済みソースを明示します。',
  locale: 'ja_JP',
  ogImage: '/images/ogp-default.png',
  twitter: '@dekio_g',
  copyright: 'Whisky Data JP',
  startYear: 2026,
  // AmazonアソシエイトのトラッキングID。
  // この値は全アフィリエイトURLの ?tag= に自動で付与される。
  amazonTag: 'whiskey-ja-22',
};
