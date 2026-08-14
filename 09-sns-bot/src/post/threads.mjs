// Threads API（Graph API）への投稿クライアント。
// 2ステップ: /threads にコンテナを作成 → /threads_publish で公開。
// 認証情報は Gist 管理（gistState.mjs / threadsAuth.mjs）のトークンを都度渡す。
//
// 注意: コンテナは作成直後は IN_PROGRESS 状態で、FINISHED になるまで publish できない。
// 早すぎる publish は "Media Not Found"(code 24, subcode 4279009) になる。
// そのため作成後に status_code をポーリングしてから publish する。
//
// 画像: 添付する場合は media_type=IMAGE のコンテナを作る。image_url には
// 公開URL（サイトの /ogp/ 配下）が必要。ローカルパスは cfg.siteUrl に変換する。

import path from 'node:path';

const API = 'https://graph.threads.net/v1.0';

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 20000;
const PUBLISH_RETRIES = 2;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** OGPのローカル絶対パスを公開URL（siteUrl + /ogp/<file>）に変換する。 */
function toPublicImageUrl(cfg, image) {
  if (!image) return null;
  const basename = path.basename(image);
  return `${cfg.siteUrl}/ogp/${encodeURIComponent(basename)}`;
}

/** コンテナの status_code を取得する（FINISHED 待ちに使う）。失敗しても警告は1回だけ出す。 */
async function containerStatus(credentials, containerId, logFirstFailure) {
  const url = `${API}/${credentials.userId}/media/${containerId}?fields=status_code,error_message&access_token=${encodeURIComponent(credentials.accessToken)}`;
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (logFirstFailure) {
      console.warn(`[threads] ステータス取得不可（${res.status}）。ポーリングは続けます`);
    }
    return null;
  }
  return json.status_code || null;
}

/** コンテナが FINISHED になるまでポーリングする。 */
async function waitForContainer(credentials, containerId) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let warned = false;
  while (Date.now() < deadline) {
    const status = await containerStatus(credentials, containerId, !warned);
    warned = true;
    if (status === 'FINISHED') return true;
    if (status === 'ERROR') {
      console.error(`[threads] コンテナが ERROR 状態になりました`);
      return false;
    }
    await sleep(POLL_INTERVAL_MS);
  }
  console.warn(`[threads] コンテナが FINISHED になるのを待てませんでした（${POLL_TIMEOUT_MS}ms）`);
  return false;
}

export async function postToThreads({ text, image }, cfg, credentials) {
  if (cfg.dryRun) {
    console.log(`[threads] DRY-RUN: 投稿しません（BOT_DRY_RUN=true）`);
    return { posted: false, reason: 'dry-run' };
  }
  if (!credentials?.accessToken || !credentials?.userId) {
    console.warn(`[threads] 認証情報未設定のため Threads 投稿をスキップ`);
    return { posted: false, reason: 'no-token' };
  }

  // 画像があれば IMAGE コンテナ、なければ TEXT コンテナ
  // IMAGE コンテナは alt_text が必須
  const imageUrl = toPublicImageUrl(cfg, image);
  const altText = [...text].slice(0, 150).join('') || 'ウイスキー紹介';
  const createBody = imageUrl
    ? { media_type: 'IMAGE', image_url: imageUrl, alt_text: altText, text }
    : { media_type: 'TEXT', text };

  const createRes = await fetch(
    `${API}/${credentials.userId}/threads?access_token=${encodeURIComponent(credentials.accessToken)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createBody),
    }
  );
  const created = await createRes.json().catch(() => ({}));
  if (!createRes.ok || !created.id) {
    console.error(`[threads] create error ${createRes.status}: ${JSON.stringify(created)}`);
    return { posted: false, reason: `create:${createRes.status}` };
  }

  await waitForContainer(credentials, created.id);

  for (let attempt = 0; attempt <= PUBLISH_RETRIES; attempt++) {
    const pubRes = await fetch(
      `${API}/${credentials.userId}/threads_publish?access_token=${encodeURIComponent(credentials.accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: created.id }),
      }
    );
    const published = await pubRes.json().catch(() => ({}));
    if (pubRes.ok) {
      console.log(`[threads] 投稿成功 id=${published.id}${imageUrl ? '（画像付き）' : ''}`);
      return { posted: true, id: published.id };
    }

    const subcode = published.error?.error_subcode;
    const transient = subcode === 4279009 || subcode === 1 || published.error?.code === 2 || published.error?.is_transient;
    if (attempt < PUBLISH_RETRIES && transient) {
      console.log(`[threads] publish 一時エラー（subcode=${subcode}）→ ${attempt + 1}回目のリトライ`);
      await sleep(POLL_INTERVAL_MS * (attempt + 1));
      continue;
    }
    console.error(`[threads] publish error ${pubRes.status}: ${JSON.stringify(published)}`);
    return { posted: false, reason: `publish:${pubRes.status}` };
  }
  return { posted: false, reason: 'publish:retries-exhausted' };
}
