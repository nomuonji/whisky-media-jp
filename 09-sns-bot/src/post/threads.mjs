// Threads API（Graph API）への投稿クライアント。
// 2ステップ: /threads にコンテナを作成 → /threads_publish で公開。
// 前提: Threadsビジネス/クリエイターアカウントとFacebookアプリの連携（Phase 3）。

const API = 'https://graph.threads.net/v1.0';

export async function postToThreads({ text }, cfg) {
  if (cfg.dryRun) {
    console.log(`[threads] DRY-RUN: 投稿しません（BOT_DRY_RUN=true）`);
    return { posted: false, reason: 'dry-run' };
  }
  if (!cfg.threads.accessToken || !cfg.threads.userId) {
    console.warn(`[threads] THREADS_ACCESS_TOKEN / USER_ID 未設定のため Threads 投稿をスキップ`);
    return { posted: false, reason: 'no-token' };
  }

  // 1. コンテナ作成
  const createRes = await fetch(
    `${API}/${cfg.threads.userId}/threads?access_token=${encodeURIComponent(cfg.threads.accessToken)}`,
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

  // 2. 公開
  const pubRes = await fetch(
    `${API}/${cfg.threads.userId}/threads_publish?access_token=${encodeURIComponent(cfg.threads.accessToken)}`,
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
