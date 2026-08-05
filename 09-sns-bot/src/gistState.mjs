// GitHub Gist を状態ストアとして読み書きする（外部依存なし、標準の fetch のみ）。
//
// Gist内の1ファイル（既定 sns_state.json）に、X / Threads 両アカウントのトークンと
// 投稿履歴（store/history.mjs が使う重複防止・上限管理用データ）を JSON で保持する。
//
// history を env var やローカルファイルではなく Gist に置く理由:
// content/pick.mjs の選定ロジックは「まだ投稿していないID」を history から除外する
// 方式で、日付からの決定論的な選択ではない。GitHub Actions のランナーは実行のたびに
// 使い捨てられるため、履歴をローカルファイルのままにすると次回の実行は必ず空の履歴から
// 始まり、同じネタを無限に選び続けてしまう。
//
// 必要な環境変数:
//   GH_GIST_TOKEN : gist スコープのみを持つ GitHub PAT
//   GIST_ID       : 状態を保存する Secret Gist の ID
//   GIST_FILENAME : (任意) 既定 "sns_state.json"
//   LOCAL_STATE_FILE : (任意・ローカル検証用) 指定するとこのファイルを Gist の代わりに使う

const API = 'https://api.github.com';
const DEFAULT_FILENAME = 'sns_state.json';

function env(name, required = true) {
  const value = process.env[name];
  if (required && !value) throw new Error(`環境変数 ${name} が未設定です`);
  return value;
}

async function githubRequest(method, url, token, payload) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(payload ? { 'Content-Type': 'application/json' } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} ${method} ${url}: ${await res.text()}`);
  }
  return res.json();
}

export async function loadState() {
  const local = process.env.LOCAL_STATE_FILE;
  if (local) {
    const { readFileSync } = await import('node:fs');
    return JSON.parse(readFileSync(local, 'utf8'));
  }
  const token = env('GH_GIST_TOKEN');
  const gistId = env('GIST_ID');
  const filename = process.env.GIST_FILENAME || DEFAULT_FILENAME;

  const gist = await githubRequest('GET', `${API}/gists/${gistId}`, token);
  const file = gist.files?.[filename];
  if (!file) {
    throw new Error(`Gist に ${filename} が見つかりません。存在: ${Object.keys(gist.files || {})}`);
  }
  return JSON.parse(file.content);
}

export async function saveState(state) {
  const local = process.env.LOCAL_STATE_FILE;
  if (local) {
    const { writeFileSync } = await import('node:fs');
    writeFileSync(local, JSON.stringify(state, null, 2), 'utf8');
    return;
  }
  const token = env('GH_GIST_TOKEN');
  const gistId = env('GIST_ID');
  const filename = process.env.GIST_FILENAME || DEFAULT_FILENAME;

  await githubRequest('PATCH', `${API}/gists/${gistId}`, token, {
    files: { [filename]: { content: JSON.stringify(state, null, 2) } },
  });
}
