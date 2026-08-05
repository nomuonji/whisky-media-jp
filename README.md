# Whisky Data JP

ウイスキーデータメディア — Whiskybase 20万本の情報を日本語で整理・可視化する。

## コンセプト
「データで読むウイスキー」
- 主観レビューではなく、**データ＋海外知見の翻訳＋可視化**で差別化
- PC完結・予算ゼロ・営業不要
- 円＋外貨（ポンド/ドル）の両方でマネタイズ

## 収益目標
| 時期 | 月収 |
|------|------|
| 1ヶ月 | 1万円 |
| 3ヶ月 | 5万円 |
| 6ヶ月 | 15万円 |

## フォルダ構成

リポジトリのルートがそのままAstroサイト本体（旧 `site/` はルート直下に統合済み）。
計画・戦略ドキュメント類は `docs/` にまとめてある。

```
├── src/                       # Astroサイト本体（ページ・コンテンツ・データ）
├── public/                    # 静的アセット（画像・OGP画像など）
├── astro.config.mjs
├── package.json
├── 09-sns-bot/                # SNS集客bot（X/Threadsへの自動投稿。設計書は DESIGN.md）
├── scripts/publish.sh         # ビルド→コミット→push（Cloudflare Pagesが自動デプロイ）
└── docs/                      # 計画・戦略ドキュメント
    ├── plan.md                # 全体計画
    ├── site-requirements.md   # 完成要件（何をもって完成とするか）
    ├── site-todo.md           # 残タスク
    ├── site-plan-v2.md        # サイト設計（現行アーキテクチャ）
    ├── 01-strategy/           # 差別化戦略・競合分析
    ├── 02-prompts/            # AIプロンプト集（最重要資産）
    ├── 03-templates/          # 投稿テンプレート
    ├── 04-affiliate/          # アフィリエイト設定
    ├── 05-visuals/            # 可視化ガイド
    ├── 06-first-content/      # 初月コンテンツ
    ├── 07-resources/          # データソース・ツール一覧
    └── 08-scripts/            # 将来の自動化用
```

## サイトを動かす

```bash
npm install && npm run dev
```

| コマンド | 内容 |
|----------|------|
| `npm run dev` | 開発サーバー（http://localhost:4321） |
| `npm run build` | 本番ビルド（`dist/`） |
| `npm run preview` | ビルド結果の確認 |
| `npx astro check` | 型チェック |

デプロイはCloudflare PagesのGit連携で、`master` へのpushをトリガーに自動ビルドされる
（ビルドコマンド `npm run build`、出力ディレクトリ `dist`）。

### データを更新したときに走らせるもの

```bash
python docs/08-scripts/generate-ogp.py
```

| コマンド | 内容 |
|----------|------|
| `python docs/08-scripts/generate-ogp.py` | 銘柄OGP画像を再生成（銘柄を追加・変更したら必須。写真がある銘柄はボトル写真を合成） |
| `python docs/08-scripts/whiskies-csv.py export` | 銘柄データをCSVに書き出す（表計算で一括編集用） |
| `python docs/08-scripts/whiskies-csv.py import` | CSVから銘柄JSONに取り込む |

### 銘柄写真について

49銘柄にWikimedia CommonsのCCライセンス写真（CC0 / CC BY / CC BY-SA）を使っている。

- 画像：`public/images/whiskies/*`
- クレジット情報：`src/data/whisky-photos.json`（撮影者・ライセンス・出典URL）
- 写真の無い銘柄はボトルのSVGに自動でフォールバック
- 新規に写真を追加するときは、CommonsのカテゴリAPIでライセンスを確認（`article-material-research` スキルの `commons_image.py`）してから
  `public/images/whiskies/` に置き、`whisky-photos.json` にクレジットを登録する。CC BY系は帰属表記が必須。

### サイトの構造

| データ | 置き場所 | ページ |
|--------|---------|--------|
| 銘柄 | `src/content/whiskies/*.json` | `/whisky/[id]/`、`/whiskies/` |
| 蒸留所 | `src/content/distilleries/*.json` | `/distillery/[id]/`、`/distilleries/` |
| 記事 | `src/content/blog/*.md` | `/[slug]/`、`/articles/` |
| アフィリURL | `src/data/affiliates.ts`（タグは `src/data/site.ts` の `amazonTag`） | — |

銘柄への入口：`/whiskies/`（絞り込み）・`/budget/[予算]/`・`/flavor/[味]/`・
`/region/[地域]/`・`/ranking/[種類]/`・`/compare/`（比較）・`/search/`（横断検索）。

### データの原則

数値には出典区分（`公`＝公式表記／`市`＝市場価格の実測／`推`＝編集部推定）を必ず付ける。
**味の8軸と編集部評価は推定値、参考価格は編集部調べ**であり、画面上でもその旨を表示している。
詳細は `docs/site-requirements.md` §5。

### 記事の書き方

`src/content/blog/YYYY-MM-DD-slug.md` を追加する。Frontmatterの主要項目：

```yaml
---
title: "記事タイトル"
date: 2026-08-10            # 未来日付は本番ビルドから自動で除外（予約投稿）
category: japanese          # scotch/japanese/bourbon/irish/world/guide/news
tags: [比較, 初心者]
excerpt: "一覧・OGPに出る要約"
draft: false                # true の間は本番に出ない
affiliate_ids: [yamazaki-12]  # 購入リンク（URLは src/data/affiliates.ts）
compare: [yamazaki-12, hakushu-12]  # 比較表を自動生成
whiskies: [yamazaki-12]     # 紹介銘柄（省略時は本文から自動検出）
radar_chart:                # 味のレーダーチャート
  labels: [ピート, 甘さ, フルーティ, スパイシー, オーク, スモーキー, 複雑さ, コスパ]
  datasets:
    - name: "山崎12年"
      data: [2, 4, 4, 2, 3, 1, 4, 3]
      color: "#D4A030"
seo:
  description: "検索結果に出る説明（160字以内）"
---
```

アフィリエイトURLは記事に直書きせず `src/data/affiliates.ts` に集約する。
ウイスキーの数値は `src/content/whiskies/` のJSONが唯一の情報源で、
記事・一覧・ランキング・比較・OGPはすべてそこを参照する。

## 最初にやること
1. `docs/04-affiliate/setup-guide.md` を読んでアフィリエイト登録
2. **AmazonアソシエイトのトラッキングIDを `src/data/site.ts` の `amazonTag` に設定**
   （この1箇所だけ。全銘柄のAmazonリンクがタグ付きで自動生成される。PA-API不要）
3. 特定の商品ページに固定したい銘柄は `src/data/affiliates.ts` に ASIN 付きURLを追加
4. noteアカウント作成
5. Xアカウント作成
6. `docs/06-first-content/week-01/` の記事テンプレを使って最初の5記事を制作
7. `09-sns-bot/DESIGN.md` を読んでSNS投稿botの下準備を開始（まず `draft` で文面確認）

## 日次作業（所要60〜90分）
1. Whiskybaseでネタ探し（10分）
2. AIにデータ投入・翻訳/生成（10分）
3. AI出力チェック・微修正（15分）
4. 可視化画像の生成（15分）
5. note記事整形・投稿（15分）
6. X投稿作成（5分）
7. リプライ返信（10分）
