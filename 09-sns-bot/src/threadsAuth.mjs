// Threads の長期トークンを Gist 状態から取得し、期限が近ければリフレッシュして書き戻す。
// Threads の長期トークンは自分自身をリフレッシュトークンとして使う
// （grant_type=th_refresh_token & access_token=<現在のトークン>）。
// 発行から24時間以上経過していないとリフレッシュできない点に注意。

const REFRESH_BEFORE_DAYS = Number(process.env.REFRESH_BEFORE_DAYS ?? '10');

function needsRefresh(expiresAt) {
  if (!expiresAt) return true;
  const expires = new Date(expiresAt).getTime();
  if (Number.isNaN(expires)) return true;
  const thresholdMs = REFRESH_BEFORE_DAYS * 24 * 60 * 60 * 1000;
  return expires - Date.now() <= thresholdMs;
}

async function refreshToken(currentToken) {
  const url = new URL('https://graph.threads.net/refresh_access_token');
  url.searchParams.set('grant_type', 'th_refresh_token');
  url.searchParams.set('access_token', currentToken);
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new Error(`Threads token refresh failed: ${JSON.stringify(json)}`);
  }
  return json;
}

/**
 * Gist 状態の accounts[accountName] から Threads の {userId, accessToken} を返す。
 * 期限が近ければリフレッシュして Gist に書き戻す（dryRun=true のときは書き込まない）。
 *
 * @param {import('./gistState.mjs')} gistState
 * @param {object} state - loadState() の戻り値（呼び出し側でロード済みのものを渡す）
 * @param {string} accountName
 * @param {boolean} dryRun
 */
export async function getThreadsCredentials(gistState, state, accountName, dryRun) {
  const account = state.accounts?.[accountName];
  if (!account) {
    throw new Error(`アカウント ${accountName} が Gist の状態に見つかりません`);
  }

  if (dryRun || !needsRefresh(account.expires_at)) {
    return { userId: account.user_id, accessToken: account.token };
  }

  try {
    const refreshed = await refreshToken(account.token);
    account.token = refreshed.access_token;
    account.expires_at = new Date(Date.now() + (refreshed.expires_in ?? 60 * 24 * 3600) * 1000).toISOString();
    await gistState.saveState(state);
    console.log(`[threads:${accountName}] トークンをリフレッシュしました（新期限 ${account.expires_at}）`);
  } catch (err) {
    console.warn(`[threads:${accountName}] リフレッシュに失敗、現在のトークンで続行: ${err.message}`);
  }

  return { userId: account.user_id, accessToken: account.token };
}
