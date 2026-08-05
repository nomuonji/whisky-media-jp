// Threads API（Graph API）への投稿クライアント。
// 2ステップ: /threads にコンテナを作成 → /threads_publish で公開。
// 認証情報は Gist 管理（gistState.mjs / threadsAuth.mjs）のトークンを都度渡す。

const API = 'https://graph.threads.net/v1.0';

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

  const pubRes = await fetch(
    `${API}/${credentials.userId}/threads_publish?access_token=${encodeURIComponent(credentials.accessToken)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: created.id }),
    }
  );
  const published = await pubRes.json().catch(() => ({}));
  if (!pubRes.ok) {
    console.error(`[threads] publish error ${pubRes.status}: ${JSON.stringify(published)}`);
    return { posted: false, reason: `publish:${pubRes.status}` };
  }
  console.log(`[threads] 投稿成功 id=${published.id}`);
  return { posted: true, id: published.id };
}
