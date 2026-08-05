// 設定の読み込みと検証。
// .env は 09-sns-bot/.env から読む（存在しなければ素通り）。
// 環境変数（process.env）が最優先で上書きする。

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const BOT_ROOT = path.resolve(HERE, '..');
export const REPO_ROOT = path.resolve(BOT_ROOT, '..');

const DEFAULTS = {
  BOT_SITE_URL: 'https://whisky-data.jp',
  BOT_CONTENT_DIR: 'site/src/content',
  BOT_OGP_DIR: 'site/public/ogp',
  BOT_DRY_RUN: 'true',
  BOT_DAILY_LIMIT: '2',
  BOT_HASHTAGS: '#ウイスキー #Whisky',
  X_API_BEARER_TOKEN: '',
  X_API_ACCESS_TOKEN: '',
  X_API_ACCESS_SECRET: '',
  THREADS_ACCESS_TOKEN: '',
  THREADS_USER_ID: '',
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
    x: {
      bearerToken: merged.X_API_BEARER_TOKEN.trim(),
      accessToken: merged.X_API_ACCESS_TOKEN.trim(),
      accessSecret: merged.X_API_ACCESS_SECRET.trim(),
    },
    threads: {
      accessToken: merged.THREADS_ACCESS_TOKEN.trim(),
      userId: merged.THREADS_USER_ID.trim(),
    },
    llm: {
      apiKey: merged.LLM_API_KEY.trim(),
      baseUrl: String(merged.LLM_BASE_URL).replace(/\/+$/, ''),
      model: merged.LLM_MODEL.trim(),
    },
    historyPath: path.join(BOT_ROOT, 'data', 'history.json'),
  };

  return cfg;
}

export function channelsFor(list) {
  const set = new Set((list || ['x']).map((c) => c.toLowerCase()));
  return set.has('all') ? ['x', 'threads'] : [...set];
}
