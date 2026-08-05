// 投稿履歴の管理（Gist 状態内の history フィールドを操作する）。
// - 重複防止: 同じネタIDを同じチャンネルに2度投稿しない
// - 上限管理: 1日あたりの投稿数を SNS ごとに数える
//
// 以前はローカル `data/history.json` に保存していたが、GitHub Actions の
// ランナーは実行のたびに使い捨てなのでローカルファイルは毎回空に戻ってしまい、
// 重複防止も上限管理も機能していなかった。gistState.mjs 経由で読み書きする
// 状態オブジェクトの一部として履歴を持たせることで永続化する。

/** state.history が無ければ初期化して返す。state は呼び出し側が gistState.loadState() で取得したもの。 */
export function ensureHistory(state) {
  if (!state.history || !Array.isArray(state.history.records)) {
    state.history = { records: [] };
  }
  return state.history;
}

export function todayCount(history, channel, date = todayStr()) {
  return history.records.filter((r) => r.channel === channel && r.date === date).length;
}

export function addRecord(history, { id, channel, text }) {
  history.records.push({ id, channel, date: todayStr(), text });
  // 無制限に増え続けないよう直近2000件に制限
  if (history.records.length > 2000) {
    history.records.splice(0, history.records.length - 2000);
  }
  return history;
}

function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
