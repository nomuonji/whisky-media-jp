// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://whisky-data.jp',
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
