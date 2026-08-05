// 投稿文の生成（テンプレート方式・無料）。
// パターン: A記事告知 / Bデータ豆知識 / C質問 / D蒸留所紹介。
// 文の単調さが気になったら generate/llm.mjs を有効にする（Phase 4）。

import { resolveOgp } from '../content/pick.mjs';

const MAX_LEN = 280; // X の1投稿上限

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

// 長い本文を末尾（ハッシュタグ）を壊さずに280字以内へ切る。
function clip(text) {
  if ([...text].length <= MAX_LEN) return text;
  return [...text].slice(0, MAX_LEN - 1).join('').trimEnd() + '…';
}

function buildHashtags(candidate, cfg) {
  const tags = [...cfg.baseHashtags];
  if (candidate.kind === 'article') {
    const ht = CATEGORY_HASHTAGS[candidate.data.category];
    if (ht) tags.push(ht);
    if (candidate.data.tags?.includes('比較')) tags.push('#ウイスキー好きと繋がりたい');
  }
  if (candidate.kind === 'whisky') {
    const ht = CATEGORY_HASHTAGS[candidate.data.type] || CATEGORY_HASHTAGS[candidate.data.country];
    if (ht) tags.push(ht);
  }
  return [...new Set(tags)].slice(0, 4); // ハッシュタグは4個まで（規約対策）
}

function bodyArticle(c, cfg) {
  const a = c.data;
  const url = `${cfg.siteUrl}/${a.slug}/`;
  const hook = (a.excerpt || '').replace(/\s+/g, ' ').trim();
  return [
    `${a.title}`,
    hook ? `${hook}👇` : '',
    '',
    url,
  ]
    .filter(Boolean)
    .join('\n');
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
    '【アンケート】あなたならどっちを選ぶ？',
    `A：${left.name}（評価${left.rating}/100）`,
    `B：${right.name}（評価${right.rating}/100）`,
    '理由をリプライで教えてください',
  ].join('\n');
}

const BODY = {
  article: bodyArticle,
  whisky: bodyWhisky,
  distillery: bodyDistillery,
  question: bodyQuestion,
};

// 投稿本文 + 添付画像の絶対パスを生成する。
export function buildPost(candidate, cfg) {
  const body = (BODY[candidate.kind]?.(candidate, cfg)) || '';
  const hashtags = buildHashtags(candidate, cfg);
  const text = clip(`${body}\n\n${hashtags.join(' ')}`);
  const image = resolveOgp(cfg, candidate);
  return { text, hashtags, image };
}
