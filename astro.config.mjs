// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

const whiskyDir = new URL('./src/content/whiskies/', import.meta.url);
const INDEX_READY_WHISKIES = new Set(
  readdirSync(whiskyDir)
    .filter((name) => name.endsWith('.json'))
    .filter((name) => {
      const data = JSON.parse(readFileSync(new URL(name, whiskyDir), 'utf8'));
      return Boolean(data.officialSourceUrl || data.whiskybase?.checkedAt);
    })
    .map((name) => name.replace(/\.json$/, ''))
);

function shouldIncludeInSitemap(page) {
  const pathname = new URL(page).pathname;

  if (
    pathname.startsWith('/search') ||
    pathname.startsWith('/ranking/') ||
    pathname.startsWith('/flavor/') ||
    pathname.startsWith('/budget/') ||
    pathname.startsWith('/tag/') ||
    pathname.startsWith('/distillery/')
  ) {
    return false;
  }

  const whiskyMatch = pathname.match(/^\/whisky\/([^/]+)\/?$/);
  if (whiskyMatch) {
    return INDEX_READY_WHISKIES.has(decodeURIComponent(whiskyMatch[1]));
  }

  return true;
}

export default defineConfig({
  site: 'https://whisky-jp.antonbase.com',
  integrations: [
    sitemap({
      filter: shouldIncludeInSitemap,
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
