// 今日投稿するネタを1件選ぶ。
// 優先順位: 未告知の新しい記事 → 高評価・未紹介の銘柄 → 蒸留所 → 質問（フォールバック）。
// 選定ロジックを変えたければこのファイルの PRIORITY と各 pick* 関数を編集する。

import { existsSync } from 'node:fs';
import path from 'node:path';

const PATTERN_TO_KIND = {
  auto: null,
  article: 'article',
  note: 'article',
  data: 'whisky',
  whisky: 'whisky',
  question: 'question',
  distillery: 'distillery',
};

// 履歴に載っているID（このチャンネルで投稿済み）は除外する。
function isUsed(id, history, channel) {
  return history.records.some((h) => h.channel === channel && h.id === id);
}

function pickArticle(articles, history, channel) {
  const found = articles.find((a) => !isUsed(`article:${a.slug}`, history, channel));
  return found ? { kind: 'article', id: `article:${found.slug}`, data: found } : null;
}

function pickWhisky(whiskies, history, channel) {
  const found = [...whiskies]
    .filter((w) => !isUsed(`whisky:${w.id}`, history, channel))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  return found ? { kind: 'whisky', id: `whisky:${found.id}`, data: found } : null;
}

function pickDistillery(distilleries, history, channel) {
  const found = distilleries.find((d) => !isUsed(`distillery:${d.id}`, history, channel));
  return found ? { kind: 'distillery', id: `distillery:${found.id}`, data: found } : null;
}

function pickQuestion(whiskies, history, channel, today) {
  const top = [...whiskies]
    .filter((w) => !isUsed(`whisky:${w.id}`, history, channel))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const [left, right] = top;
  if (!left || !right) return null;
  return { kind: 'question', id: `question:${today}#${left.id}-${right.id}`, data: { left, right } };
}

const PRIORITY = {
  article: pickArticle,
  whisky: pickWhisky,
  distillery: pickDistillery,
  question: pickQuestion,
};

export function pickCandidate({ articles, whiskies, distilleries, history, channel, pattern = 'auto' }) {
  const kind = PATTERN_TO_KIND[String(pattern).toLowerCase()] || null;
  const today = new Date().toISOString().slice(0, 10);
  const orders = kind ? [kind] : Object.keys(PRIORITY);

  for (const k of orders) {
    const args =
      k === 'question'
        ? [whiskies, history, channel, today]
        : k === 'article'
          ? [articles, history, channel]
          : k === 'whisky'
            ? [whiskies, history, channel]
            : [distilleries, history, channel];
    const c = PRIORITY[k](...args);
    if (c) return c;
  }
  return null;
}

// 投稿に添付できる OGP 画像（あれば）の絶対パスを返す。
export function resolveOgp(cfg, candidate) {
  if (!candidate) return null;
  if (candidate.kind === 'whisky') return findOgp(cfg.ogpDir, candidate.data.id);
  if (candidate.kind === 'article') {
    const ids = [...(candidate.data.compare || []), ...(candidate.data.affiliateIds || [])];
    for (const id of ids) {
      const p = findOgp(cfg.ogpDir, id);
      if (p) return p;
    }
  }
  return null;
}

function findOgp(ogpDir, id) {
  const p = path.join(ogpDir, `whisky-${id}.png`);
  return existsSync(p) ? p : null;
}
