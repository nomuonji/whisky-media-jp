// Whisky Data JP SNS集客bot — エントリポイント（CLI）
//
// 使い方（プロジェクトルートで実行）:
//   node 09-sns-bot/src/index.mjs draft                # 今日の投稿文を生成して表示（投稿なし・推奨）
//   node 09-sns-bot/src/index.mjs post                 # 生成＋投稿（BOT_DRY_RUN=true なら表示のみ）
//   node 09-sns-bot/src/index.mjs post --no-dry-run    # 実際に投稿（本番）
//   node 09-sns-bot/src/index.mjs post --channel all   # X と Threads 両方
//   node 09-sns-bot/src/index.mjs post --pattern data  # パターン指定: article|data|question|distillery|auto
//   node 09-sns-bot/src/index.mjs history              # 投稿履歴を表示（Gist から取得）
//   node 09-sns-bot/src/index.mjs test                 # 環境と設定の確認
//
// 認証情報（X: dekio_g / Threads: devil_dog_ch）と投稿履歴は GitHub Gist で管理する
// （gistState.mjs）。ローカルで試す場合は GH_GIST_TOKEN + GIST_ID を設定するか、
// LOCAL_STATE_FILE で代替のローカルJSONを指定する。

import { channelsFor, loadConfig } from './config.mjs';
import { loadAll } from './content/load.mjs';
import { pickCandidate } from './content/pick.mjs';
import { buildPost } from './generate/copy.mjs';
import { generateWithLlm } from './generate/llm.mjs';
import { postToX } from './post/x.mjs';
import { postToThreads } from './post/threads.mjs';
import * as gistState from './gistState.mjs';
import * as historyStore from './store/history.mjs';
import { getThreadsCredentials } from './threadsAuth.mjs';

// チャンネル名 → Gist 状態内のアカウントキー
const GIST_ACCOUNT = { x: 'dekio_g', threads: 'devil_dog_ch' };

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

/** チャンネルに応じた認証情報を Gist 状態から取り出す。X は静的、Threads は必要ならリフレッシュ。 */
async function credentialsFor(channel, state, dryRun) {
  const accountName = GIST_ACCOUNT[channel];
  if (channel === 'x') {
    const account = state.accounts?.[accountName];
    if (!account) throw new Error(`アカウント ${accountName} が Gist の状態に見つかりません`);
    return {
      consumerKey: account.consumer_key,
      consumerSecret: account.consumer_secret,
      accessToken: account.access_token,
      accessTokenSecret: account.access_token_secret,
    };
  }
  if (channel === 'threads') {
    return getThreadsCredentials(gistState, state, accountName, dryRun);
  }
  return null;
}

async function runPost(cfg, args, { forceDryRun = false } = {}) {
  const dryRun = forceDryRun ? true : args.dryRun === undefined ? cfg.dryRun : args.dryRun;
  const channels = channelsFor(args.channel);

  const state = await gistState.loadState();
  const history = historyStore.ensureHistory(state);
  let stateChanged = false;

  for (const channel of channels) {
    const content = loadAll(cfg);

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

    if (dryRun) continue; // dry-run は履歴に記録せず Gist も更新しない（再実行で同じ文をレビューできる）

    let credentials;
    try {
      credentials = await credentialsFor(channel, state, dryRun);
    } catch (err) {
      console.error(`[${channel}] 認証情報の取得に失敗: ${err.message}`);
      continue;
    }
    // getThreadsCredentials がリフレッシュして state を書き換えた可能性があるため、
    // dry-run でなければ常に「変更あり」として扱い、最後に保存する。
    stateChanged = true;

    const result = await POSTERS[channel](post, runCfg, credentials);
    if (result.posted) {
      historyStore.addRecord(history, { id: candidate.id, channel, text: post.text });
      console.log(`[${channel}] 履歴に記録: ${candidate.id}`);
    } else {
      console.log(`[${channel}] 投稿しませんでした（${result.reason}）`);
    }
  }

  if (stateChanged && !dryRun) {
    await gistState.saveState(state);
    console.log('状態を Gist へ保存しました');
  }
}

async function cmdDraft(cfg, args) {
  await runPost(cfg, args, { forceDryRun: true });
}

async function cmdPost(cfg, args) {
  await runPost(cfg, args);
}

async function cmdHistory(cfg) {
  const state = await gistState.loadState();
  const history = historyStore.ensureHistory(state);
  console.log(`履歴 ${history.records.length}件`);
  for (const r of [...history.records].reverse().slice(0, 20)) {
    console.log(`  ${r.date} [${r.channel}] ${r.id}: ${String(r.text).slice(0, 50)}`);
  }
}

async function cmdTest(cfg) {
  const content = loadAll(cfg);
  console.log('== 設定 ==');
  console.log(`  サイトURL      : ${cfg.siteUrl}`);
  console.log(`  コンテンツ     : ${cfg.contentDir} (記事${content.articles.length} 銘柄${content.whiskies.length} 蒸留所${content.distilleries.length})`);
  console.log(`  dry-run        : ${cfg.dryRun}`);
  console.log(`  1日あたり上限  : ${cfg.dailyLimit}`);
  console.log(`  基本ハッシュタグ: ${cfg.baseHashtags.join(' ')}`);
  console.log(`  LLM            : ${cfg.llm.apiKey ? `設定済み（${cfg.llm.model || cfg.llm.baseUrl}）` : '未設定（テンプレ生成）'}`);
  console.log('== Gist 状態 ==');
  try {
    const state = await gistState.loadState();
    const history = historyStore.ensureHistory(state);
    console.log(`  接続           : OK`);
    console.log(`  X (dekio_g)    : ${state.accounts?.dekio_g?.access_token ? '設定済み' : '未設定'}`);
    console.log(`  Threads (devil_dog_ch): ${state.accounts?.devil_dog_ch?.token ? '設定済み' : '未設定'}`);
    console.log(`  履歴           : ${history.records.length}件`);
  } catch (err) {
    console.log(`  接続           : 失敗 (${err.message})`);
  }
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
