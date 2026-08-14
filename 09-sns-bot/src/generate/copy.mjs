// 投稿文の生成（テンプレート方式・無料）。
// パターン: A記事告知 / Bデータ豆知識 / C質問 / D蒸留所紹介。
// 文の単調さが気になったら generate/llm.mjs を有効にする（Phase 4）。
//
// 方針（2026-08-15）:
//   - Xのスパム判定は「長文+URL+複数ハッシュタグ」の組み合わせを拒否する
//     （実測で確認。短文+URLだけ、長文+URLのみは通る）
//   - そのため投稿は「短いキャッチ文+OGP画像」だけにし、リンク・ハッシュタグは
//     付けない。サイトへの誘導はプロフィールの固定リンクに任せる（認知に振り切る）。

import { resolveOgp } from '../content/pick.mjs';

const MAX_LEN = 280; // X の1投稿上限

// 記事告知のフック文の上限。本文を短く保つ。
const HOOK_MAX_LEN = 40;

const TYPE_JA = {
  'single malt scotch': 'シングルモルト',
  scotch: 'シングルモルト',
  japanese: 'ジャパニーズ',
  'japanese whisky': 'ジャパニーズ',
  bourbon: 'バーボン',
  irish: 'アイリッシュ',
  rye: 'ライ',
  blend: 'ブレンデッド',
  blended: 'ブレンデッド',
  world: 'ワールド',
};

const FLAVOR_JA = {
  peat: 'ピート',
  sweet: '甘さ',
  fruity: 'フルーティ',
  spicy: 'スパイシー',
  oak: 'オーク',
  smoky: 'スモーキー',
  complex: '複雑さ',
  body: 'コク',
};

const CATEGORY_HASHTAGS = {
  japanese: '#ジャパニーズウイスキー',
  scotch: '#スコッチ',
  bourbon: '#バーボン',
  irish: '#アイリッシュ',
  world: '#ワールドウイスキー',
  guide: '#ウイスキー初心者',
  news: '#Whiskybase',
};

export function typeJa(whisky) {
  return TYPE_JA[String(whisky.type || '').toLowerCase()] || whisky.type || 'ウイスキー';
}

export function priceJa(priceYen) {
  return Number(priceYen).toLocaleString('ja-JP');
}

// フレーバー軸から「強い/ほぼない」を抽出して1行に。
function flavorSummary(flavor) {
  if (!flavor || typeof flavor !== 'object') return '';
  const strong = [];
  const none = [];
  for (const [key, val] of Object.entries(flavor)) {
    const label = FLAVOR_JA[key];
    if (!label || typeof val !== 'number') continue;
    if (val >= 4) strong.push(`${label}${'★'.repeat(Math.min(val, 5))}`);
    else if (val <= 1) none.push(label);
  }
  const parts = [];
  if (strong.length) parts.push(`特徴: ${strong.join(' ')}`);
  if (none.length) parts.push(`${none.join('・')}は控えめ`);
  return parts.join('｜');
}

// 長い本文を280字以内へ切る。
function clip(text) {
  if ([...text].length <= MAX_LEN) return text;
  return [...text].slice(0, MAX_LEN - 1).join('').trimEnd() + '…';
}

function bodyArticle(c) {
  const a = c.data;
  const hook = (a.excerpt || '').replace(/\s+/g, ' ').trim();
  const short = [...hook].length > HOOK_MAX_LEN ? [...hook].slice(0, HOOK_MAX_LEN).join('').trimEnd() + '…' : hook;
  return [a.title, short ? `\n${short}` : ''].filter(Boolean).join('');
}

function bodyWhisky(c) {
  const w = c.data;
  const lines = [
    `${w.name}（${typeJa(w)}）`,
    `Whiskybase評価 ${w.rating || '?'}/100｜市場価格 ${priceJa(w.priceYen)}円`,
  ];
  const summary = flavorSummary(w.flavor);
  if (summary) lines.push(summary);
  if (w.notes) lines.push(w.notes);
  return lines.join('\n');
}

function bodyDistillery(c) {
  const d = c.data;
  const lines = [`${d.name}${d.nameEn ? `（${d.nameEn}）` : ''}`];
  if (d.founded) lines.push(`創業${d.founded}年${d.owner ? `｜${d.owner}` : ''}`);
  if (d.notes) lines.push(d.notes);
  return lines.join('\n');
}

function bodyQuestion(c) {
  const { left, right } = c.data;
  return [
    'あなたならどっちを選ぶ？',
    `A：${left.name}（評価${left.rating}/100）`,
    `B：${right.name}（評価${right.rating}/100）`,
    '理由をコメントで教えてください',
  ].join('\n');
}

const BODY = {
  article: bodyArticle,
  whisky: bodyWhisky,
  distillery: bodyDistillery,
  question: bodyQuestion,
};

// 投稿本文 + 添付画像の絶対パスを生成する。
// リンク・ハッシュタグは付けない（スパム判定回避。誘導はプロフィールの固定リンク）。
export function buildPost(candidate, cfg) {
  const body = (BODY[candidate.kind]?.(candidate, cfg)) || '';
  const text = clip(body);
  const image = resolveOgp(cfg, candidate);
  return { text, hashtags: [], image };
}
