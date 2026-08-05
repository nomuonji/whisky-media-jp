// 設定の読み込みと検証。
// .env は 09-sns-bot/.env から読む（存在しなければ素通り）。
// 環境変数（process.env）が最優先で上書きする。

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const BOT_ROOT = path.resolve(HERE, '..');
export const REPO_ROOT = path.resolve(BOT_ROOT, '..');

// X (dekio_g) / Threads (devil_dog_ch) の認証情報はここでは扱わない。
// Gist で管理するトークン（gistState.mjs / threadsAuth.mjs）を index.mjs が
// 都度取得して各 post/*.mjs に渡す。理由:
//   - Threads の長期トークンは約60日で失効しリフレッシュが要る
//   - GitHub Actions のランナーは使い捨てなので、リフレッシュ後のトークンを
//     どこかに永続化しないと次回また古いトークンで失敗する
//   - 公開リポジトリの git 履歴・Actions Secrets の平文にトークンを残したくない
const DEFAULTS = {
  // 暫定: カスタムドメイン取得までは Cloudflare Pages の URL。
  // 取得後は https://whisky-data.jp に戻すこと（astro.config.mjs / src/data/site.ts も同様）。
  BOT_SITE_URL: 'https://whisky-media-jp.pages.dev',
  BOT_CONTENT_DIR: 'src/content',
  BOT_OGP_DIR: 'public/ogp',
  BOT_DRY_RUN: 'true',
  BOT_DAILY_LIMIT: '2',
  BOT_HASHTAGS: '#ウイスキー #Whisky',
  LLM_API_KEY: '',
  LLM_BASE_URL: 'https://api.openai.com/v1',
  LLM_MODEL: '',
};

// 簡易 .env パーサ（引用符とコメントに対応）。
function parseDotEnv(file) {
  const out = {};
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    let key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key) out[key] = val;
  }
  return out;
}

export function loadConfig(env = process.env) {
  const fromFile = parseDotEnv(path.join(BOT_ROOT, '.env'));
  const merged = { ...DEFAULTS, ...fromFile, ...env };

  const cfg = {
    siteUrl: String(merged.BOT_SITE_URL).replace(/\/+$/, ''),
    contentDir: path.resolve(REPO_ROOT, merged.BOT_CONTENT_DIR),
    ogpDir: path.resolve(REPO_ROOT, merged.BOT_OGP_DIR),
    dryRun: String(merged.BOT_DRY_RUN).toLowerCase() !== 'false',
    dailyLimit: parseInt(merged.BOT_DAILY_LIMIT, 10) || 2,
    baseHashtags: String(merged.BOT_HASHTAGS).trim().split(/\s+/).filter(Boolean),
    llm: {
      apiKey: merged.LLM_API_KEY.trim(),
      baseUrl: String(merged.LLM_BASE_URL).replace(/\/+$/, ''),
      model: merged.LLM_MODEL.trim(),
    },
  };

  return cfg;
}

export function channelsFor(list) {
  const set = new Set((list || ['x']).map((c) => c.toLowerCase()));
  return set.has('all') ? ['x', 'threads'] : [...set];
}
