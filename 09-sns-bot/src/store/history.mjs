// 投稿履歴（data/history.json）の管理。
// - 重複防止: 同じネタIDを同じチャンネルに2度投稿しない
// - 上限管理: 1日あたりの投稿数を SNS ごとに数える

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export function loadHistory(cfg) {
  if (!existsSync(cfg.historyPath)) {
    return { records: [] };
  }
  try {
    const raw = JSON.parse(readFileSync(cfg.historyPath, 'utf8'));
    return { records: Array.isArray(raw.records) ? raw.records : [] };
  } catch (err) {
    console.warn(`[history] 読み込みに失敗したため空から始めます: ${err.message}`);
    return { records: [] };
  }
}

// history.records: [{ id, channel, date, text }]
export function usedIds(history) {
  return history.records;
}

export function todayCount(history, channel, date = todayStr()) {
  return history.records.filter((r) => r.channel === channel && r.date === date).length;
}

export function addRecord(history, { id, channel, text }) {
  history.records.push({ id, channel, date: todayStr(), text });
  return history;
}

export function saveHistory(cfg, history) {
  mkdirSync(path.dirname(cfg.historyPath), { recursive: true });
  writeFileSync(cfg.historyPath, JSON.stringify({ records: history.records }, null, 2), 'utf8');
}

function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
