# SNS集客bot（Whisky Data JP）

サイト（whisky-data.jp）の記事・銘柄データからSNS投稿文を自動生成し、X / Threads に投稿するbot。

- **設計方針・アーキテクチャ・コンプライアンス**: まず `DESIGN.md` を読むこと
- **自動化範囲**: 投稿の自動生成＋自動投稿のみ（リプライ・いいね等は対象外）
- **Node.js 20+ のみ**。外部依存・API料金なしで動く（投稿API・LLMは任意）

## クイックスタート

```bash
# 1. 設定ファイルを作成（まず dry-run=true のまま）
copy 09-sns-bot\.env.example 09-sns-bot\.env

# 2. 今日の投稿文を確認（一切投稿しない）
node 09-sns-bot/src/index.mjs draft

# 3. パターン・チャンネルを切り替えて確認
node 09-sns-bot/src/index.mjs draft --pattern data
node 09-sns-bot/src/index.mjs draft --channel all

# 4. 実際に投稿する（X APIのBearerトークン設定後）
node 09-sns-bot/src/index.mjs post --no-dry-run
```

## コマンド

| コマンド | 内容 |
|---------|------|
| `draft` | 今日の投稿文を生成して表示（投稿なし・推奨） |
| `post` | 生成して投稿。`BOT_DRY_RUN=true` の間は表示のみ |
| `post --no-dry-run` | 実際に投稿（本番） |
| `post --channel all` | X と Threads の両方に投稿 |
| `post --pattern data` | パターン指定 `article\|data\|question\|distillery\|auto` |
| `history` | 投稿履歴を表示 |
| `test` | 設定・APIトークン・コンテンツ数の確認 |

## 設定（09-sns-bot/.env）

`.env.example` をコピーして `.env` を作る。主要項目:

| 項目 | 意味 |
|------|------|
| `BOT_DRY_RUN` | `true` の間は投稿しない（推奨） |
| `BOT_DAILY_LIMIT` | 1SNSあたり1日の投稿上限（既定2） |
| `BOT_HASHTAGS` | 基本ハッシュタグ |
| `X_API_BEARER_TOKEN` | X API v2 Write権限のBearerトークン（**X投稿に必須**） |
| `THREADS_ACCESS_TOKEN` / `THREADS_USER_ID` | Threads API（任意・Phase 3） |
| `LLM_API_KEY` / `LLM_BASE_URL` / `LLM_MODEL` | LLM生成（任意・Phase 4） |

## 自動実行（スケジュール）

毎日決まった時間に走らせる。2択:

1. **opencodeのscheduleスキル**: 朝7時/昼12時/夜20時の投稿枠で
   `node 09-sns-bot/src/index.mjs post --channel x --pattern <パターン>` を定期実行
2. **Windows タスクスケジューラ**: 同じコマンドを.bat経由で毎日実行

詳細は `DESIGN.md` §7 を参照。

## ディレクトリ構成

```
09-sns-bot/
├── DESIGN.md              # 設計書（必読）
├── README.md              # このファイル
├── .env.example           # 設定サンプル
├── package.json           # npm scripts
├── data/                  # history.json（投稿履歴・gitignore）
└── src/
    ├── index.mjs          # CLIエントリ
    ├── config.mjs         # .env読み込み・検証
    ├── content/
    │   ├── load.mjs       # 記事・銘柄・蒸留所の読み込み
    │   └── pick.mjs       # 今日のネタ選定
    ├── generate/
    │   ├── copy.mjs       # 投稿文生成（テンプレ・無料）
    │   └── llm.mjs        # LLM生成（任意・有料）
    ├── post/
    │   ├── x.mjs          # X API v2クライアント
    │   └── threads.mjs    # Threads APIクライアント
    └── store/
        └── history.mjs    # 投稿履歴・重複/上限管理
```

## コンプライアンス（重要）

- **AmazonアソシエイトリンクをSNS投稿に含めない**（規約で禁止）。リンク先はサイト記事かnote
- ハッシュタグは投稿あたり4個まで。完全同一文の連投を避ける
- 本番投稿は `draft`（dry-run）で文面確認をしてから行う
