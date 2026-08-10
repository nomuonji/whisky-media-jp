// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // 公開URL: whisky-jp.antonbase.com（src/data/site.ts / 09-sns-bot/src/config.mjs も同様）。
  site: 'https://whisky-jp.antonbase.com',
  integrations: [
    sitemap({
      // 検索結果ページは索引させない（noindexを付けているページと揃える）
      filter: (page) => !page.includes('/search'),
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
  build: {
    assets: 'assets',
  },
  vite: {
    resolve: {
      alias: {
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@styles': '/src/styles',
        '@utils': '/src/utils',
      },
    },
  },
});
