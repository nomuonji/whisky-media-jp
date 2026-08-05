// Whisky Data JP SNS集客bot — エントリポイント（CLI）
//
// 使い方（プロジェクトルートで実行）:
//   node 09-sns-bot/src/index.mjs draft                # 今日の投稿文を生成して表示（投稿なし・推奨）
//   node 09-sns-bot/src/index.mjs post                 # 生成＋投稿（BOT_DRY_RUN=true なら表示のみ）
//   node 09-sns-bot/src/index.mjs post --no-dry-run    # 実際に投稿（本番）
//   node 09-sns-bot/src/index.mjs post --channel all   # X と Threads 両方
//   node 09-sns-bot/src/index.mjs post --pattern data  # パターン指定: article|data|question|distillery|auto
//   node 09-sns-bot/src/index.mjs history              # 投稿履歴を表示
//   node 09-sns-bot/src/index.mjs test                 # 環境と設定の確認

import { channelsFor, loadConfig } from './config.mjs';
import { loadAll } from './content/load.mjs';
import { pickCandidate } from './content/pick.mjs';
import { buildPost } from './generate/copy.mjs';
import { generateWithLlm } from './generate/llm.mjs';
import { postToX } from './post/x.mjs';
import { postToThreads } from './post/threads.mjs';
import * as historyStore from './store/history.mjs';

function parseArgs(argv) {
  const out = { channel: ['x'], pattern: 'auto', dryRun: undefined, llm: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--channel') out.channel = (argv[++i] || 'x').split(',').map((s) => s.trim());
    else if (a === '--pattern') out.pattern = argv[++i] || 'auto';
    else if (a === '--no-dry-run') out.dryRun = false;
    else if (a === '--llm') out.llm = true;
  }
  return out;
}

const POSTERS = { x: postToX, threads: postToThreads };

function printPost(cfg, channel, post) {
  console.log(`\n=== ${channel.toUpperCase()} 投稿候補 ===`);
  console.log(post.text);
  if (post.image) console.log(`[画像] ${post.image}`);
  console.log(`[文字数] ${[...post.text].length} / 280`);
  if (cfg.dryRun) {
    console.log(`[dry-run] 実際には投稿していません。投稿するには --no-dry-run を指定。`);
  }
}

async function runPost(cfg, args, { forceDryRun = false } = {}) {
  const dryRun = forceDryRun ? true : args.dryRun === undefined ? cfg.dryRun : args.dryRun;
  const channels = channelsFor(args.channel);
  let saved = false;

  for (const channel of channels) {
    const content = loadAll(cfg);
    const history = historyStore.loadHistory(cfg);

    const count = historyStore.todayCount(history, channel);
    if (count >= cfg.dailyLimit) {
      console.log(`[${channel}] 本日の投稿上限（${cfg.dailyLimit}件）に達しています。`);
      continue;
    }

    const candidate = pickCandidate({ ...content, history, channel, pattern: args.pattern });
    if (!candidate) {
      console.log(`[${channel}] 投稿できるネタがありません。`);
      continue;
    }

    let post = buildPost(candidate, cfg);
    if (args.llm) {
      const llmText = await generateWithLlm(candidate, cfg);
      if (llmText) post = { ...post, text: llmText };
      else console.log(`[${channel}] LLM未設定/失敗 → テンプレートで投稿します`);
    }

    const runCfg = { ...cfg, dryRun };
    printPost(runCfg, channel, post);

    if (dryRun) continue; // dry-run は履歴に記録しない（再実行で同じ文をレビューできる）

    const result = await POSTERS[channel](post, runCfg);
    if (result.posted) {
      historyStore.addRecord(history, { id: candidate.id, channel, text: post.text });
      historyStore.saveHistory(cfg, history);
      saved = true;
      console.log(`[${channel}] 履歴に記録: ${candidate.id}`);
    } else {
      console.log(`[${channel}] 投稿しませんでした（${result.reason}）`);
    }
  }
  return { saved };
}

async function cmdDraft(cfg, args) {
  await runPost(cfg, args, { forceDryRun: true });
}

async function cmdPost(cfg, args) {
  await runPost(cfg, args);
}

function cmdHistory(cfg) {
  const history = historyStore.loadHistory(cfg);
  console.log(`履歴 ${history.records.length}件`);
  for (const r of [...history.records].reverse().slice(0, 20)) {
    console.log(`  ${r.date} [${r.channel}] ${r.id}: ${String(r.text).slice(0, 50)}`);
  }
}

function cmdTest(cfg) {
  const content = loadAll(cfg);
  console.log('== 設定 ==');
  console.log(`  サイトURL      : ${cfg.siteUrl}`);
  console.log(`  コンテンツ     : ${cfg.contentDir} (記事${content.articles.length} 銘柄${content.whiskies.length} 蒸留所${content.distilleries.length})`);
  console.log(`  dry-run        : ${cfg.dryRun}`);
  console.log(`  1日あたり上限  : ${cfg.dailyLimit}`);
  console.log(`  基本ハッシュタグ: ${cfg.baseHashtags.join(' ')}`);
  console.log('== API ==');
  console.log(`  X Bearer       : ${cfg.x.bearerToken ? '設定済み' : '未設定'}`);
  console.log(`  Threads        : ${cfg.threads.accessToken ? '設定済み' : '未設定'}`);
  console.log(`  LLM            : ${cfg.llm.apiKey ? `設定済み（${cfg.llm.model || cfg.llm.baseUrl}）` : '未設定（テンプレ生成）'}`);
  console.log('== 履歴 ==');
  const history = historyStore.loadHistory(cfg);
  console.log(`  ${history.records.length}件記録済み（${cfg.historyPath}）`);
}

const COMMANDS = { draft: cmdDraft, post: cmdPost, history: cmdHistory, test: cmdTest };

const [cmd, ...rest] = process.argv.slice(2);
const fn = COMMANDS[cmd];
if (!fn) {
  console.error(`不明なコマンド: ${cmd || '(なし)'}`);
  console.error('使い方: node 09-sns-bot/src/index.mjs {draft|post|history|test} [--channel x|threads|all] [--pattern auto|article|data|question|distillery] [--no-dry-run] [--llm]');
  process.exit(1);
}

const cfg = loadConfig();
await fn(cfg, parseArgs(rest));
