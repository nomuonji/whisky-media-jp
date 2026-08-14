// Threads API（Graph API）への投稿クライアント。
// 2ステップ: /threads にコンテナを作成 → /threads_publish で公開。
// 認証情報は Gist 管理（gistState.mjs / threadsAuth.mjs）のトークンを都度渡す。
//
// 注意: コンテナは作成直後は IN_PROGRESS 状態で、FINISHED になるまで publish できない。
// 早すぎる publish は "Media Not Found"(code 24, subcode 4279009) になる。
// そのため作成後に status_code をポーリングしてから publish する。

const API = 'https://graph.threads.net/v1.0';

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 20000;
const PUBLISH_RETRIES = 2;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** コンテナの status_code を取得する（FINISHED 待ちに使う）。 */
async function containerStatus(credentials, containerId) {
  const url = `${API}/${credentials.userId}/threads/${containerId}?fields=status_code,error_message&access_token=${encodeURIComponent(credentials.accessToken)}`;
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.warn(`[threads] ステータス取得失敗 ${res.status}: ${JSON.stringify(json)}`);
    return null;
  }
  return json.status_code || null;
}

/** コンテナが FINISHED になるまでポーリングする。 */
async function waitForContainer(credentials, containerId) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const status = await containerStatus(credentials, containerId);
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

export async function postToThreads({ text }, cfg, credentials) {
  if (cfg.dryRun) {
    console.log(`[threads] DRY-RUN: 投稿しません（BOT_DRY_RUN=true）`);
    return { posted: false, reason: 'dry-run' };
  }
  if (!credentials?.accessToken || !credentials?.userId) {
    console.warn(`[threads] 認証情報未設定のため Threads 投稿をスキップ`);
    return { posted: false, reason: 'no-token' };
  }

  const createRes = await fetch(
    `${API}/${credentials.userId}/threads?access_token=${encodeURIComponent(credentials.accessToken)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_type: 'TEXT', text }),
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
      console.log(`[threads] 投稿成功 id=${published.id}`);
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
