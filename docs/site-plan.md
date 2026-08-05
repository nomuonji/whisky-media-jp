# 自サイト構築計画

## コンセプト

**AIが直接 Markdown ファイルを生成 → git push → 自動デプロイ → 公開**

人間がやること：AIに指示を出すだけ。
ブラウザでnoteの管理画面を触る必要なし。

---

## 技術スタック

| 層 | 技術 | 理由 | 費用 |
|---|------|------|------|
| ドメイン | `.com` or `.jp` | お名前.com / Xserverドメイン | 年1,000〜3,000円 |
| ホスティング | **Cloudflare Pages** | 静的サイト無料・カスタムドメインOK・自動デプロイ | **0円** |
| サイト生成 | **Astro** | Markdownから静的HTML生成・高速・日本語対応 | **0円** |
| コンテンツ | **Markdown + 独自Frontmatter** | AIが直接ファイル生成できる | **0円** |
| バージョン管理 | **GitHub**（無料プラン） | git push → Cloudflareが自動ビルド | **0円** |
| グラフ描画 | **Chart.js**（CDN） | レーダーチャート・折れ線グラフ | **0円** |

**月額費用：0円。年間費用：ドメイン代のみ（〜3,000円）**

---

## 投稿フロー

### 今までのnote運用（人間がやること多すぎ）
```
人間：Whiskybaseでデータ収集
人間：AIにプロンプト投入
人間：AI出力をnoteにコピペ
人間：画像アップロード
人間：タグ設定
人間：公開ボタン
```

### これからの運用（AI→Markdown→自動公開）
```
人間：「今週のウイスキーニュース記事を作って」
AI：データ収集 → 記事生成 → Markdownファイル出力 → git push
→ Cloudflare Pagesが自動ビルド → 3分後に公開
```

---

## サイト構造

```
サイトマップ：
/                          # トップページ（最新記事一覧）
/category/scotch/          # カテゴリ別
/category/japanese/
/category/bourbon/
/tag/初心者/               # タグ別
/[slug]/                   # 個別記事
/about/                    # 運営者情報
/rss.xml                   # RSS
/sitemap.xml               # サイトマップ
```

---

## Markdown記事の形式（AIが生成）

```markdown
---
title: "山崎12年 vs 白州12年──データで決着、あなたに合う1本"
date: 2026-08-04
category: japanese
tags: [比較, 初心者, サントリー]
affiliate:
  amazon_jp:
    - name: "山崎12年"
      url: "https://amazon.co.jp/..."
      price: 16800
    - name: "白州12年"
      url: "https://amazon.co.jp/..."
      price: 14800
  amazon_us:
    - name: "Yamazaki 12"
      url: "https://amazon.com/..."
      price: 199
radar_chart:
  labels: [ピート, 甘さ, フルーティ, スパイシー, オーク, スモーキー, 複雑さ, コスパ]
  datasets:
    - name: "山崎12年"
      data: [2, 4, 4, 2, 3, 1, 3, 5]
      color: "#D4A030"
    - name: "白州12年"
      data: [1, 3, 4, 1, 2, 0, 2, 4]
      color: "#20B2AA"
seo:
  description: "Whiskybaseのデータで山崎12年と白州12年を徹底比較。レーダーチャートで味の違いが一目瞭然。"
  og_image: "/images/compare-yamazaki-hakushu.png"
---

## はじめに

ウイスキーを始めた人が最初にぶつかる壁──「山崎」か「白州」か。
どちらも美味しい。でも、自分の好みに合うのはどっち？

Whiskybaseの口コミ312件と評価データをもとに、**数値で比較**しました。

## 比較表

| 項目 | 山崎12年 | 白州12年 |
|------|---------|---------|
| タイプ | シングルモルト | シングルモルト |
| Whiskybase平均点 | 87.2 | 85.8 |
| 市場価格 | 16,800円 | 14,800円 |
| ピート | ★★☆☆☆ | ★☆☆☆☆ |

...（本文続く）
```

---

## ディレクトリ構成

```
whisky-media-jp/
(このリポジトリのルートが Astro プロジェクト本体)
│   ├── src/
│   │   ├── content/
│   │   │   └── blog/             # ★AIがMarkdownを直接書き込む場所
│   │   │       ├── 2026-08-04-yamazaki-vs-hakushu.md
│   │   │       ├── 2026-08-05-beginner-guide.md
│   │   │       └── ...
│   │   ├── components/
│   │   │   ├── RadarChart.astro   # レーダーチャート表示
│   │   │   ├── PriceGraph.astro   # 価格推移グラフ
│   │   │   ├── ComparisonTable.astro
│   │   │   ├── AffiliateCard.astro # アフィリエイトリンク
│   │   │   ├── PostCard.astro     # 記事カード（一覧用）
│   │   │   └── SeoHead.astro      # SEOメタタグ
│   │   ├── layouts/
│   │   │   └── BaseLayout.astro   # 共通レイアウト
│   │   ├── pages/
│   │   │   ├── index.astro        # トップページ
│   │   │   ├── [slug].astro       # 個別記事
│   │   │   ├── category/[cat].astro
│   │   │   ├── tag/[tag].astro
│   │   │   ├── about.astro
│   │   │   └── rss.xml.js         # RSS生成
│   │   ├── styles/
│   │   │   └── global.css
│   │   └── utils/
│   │       ├── affiliate.ts       # アフィリエイトリンク管理
│   │       └── date.ts
│   ├── public/
│   │   ├── images/                # グラフ画像・OGP画像
│   │   └── favicon.svg
│   ├── astro.config.mjs
│   ├── package.json
│   └── tsconfig.json
│
├── scripts/                       # 運用スクリプト
│   └── publish.sh                 # Markdown生成→ビルド→デプロイ
│
├── 01-strategy/                   # （既存）
├── 02-prompts/                    # ★更新：Markdown出力指示を追加
├── 03-templates/                  # （既存）
├── 04-affiliate/                  # （既存）
├── 05-visuals/                    # ★更新：Chart.jsデータ形式に
├── 06-first-content/              # （既存）
├── 07-resources/                  # （既存）
└── 08-scripts/                    # （既存）
```

---

## 必要なコンポーネント

### 1. RadarChart.astro
Frontmatterの `radar_chart` データを読み取り、Chart.jsで描画。
クライアントサイドでレンダリング。

### 2. AffiliateCard.astro
Frontmatterの `affiliate` データから購買リンクカードを生成。
「Amazonで購入」「楽天で購入」ボタン。

### 3. ComparisonTable.astro
比較記事用のスタイリング済みテーブル。

### 4. SeoHead.astro
OGP / Twitter Card / meta description / canonical URL。

---

## AIプロンプトの改修

既存のプロンプトに、以下の出力指示を追加する：

```
## 出力フォーマット

以下の形式でMarkdownファイルを直接出力してください。
Frontmatter（---で囲まれた部分）も含めてください。

[上記のMarkdown記事形式をテンプレートとして提示]
```

こうすれば、AIの出力を `src/content/blog/2026-08-04-title.md` に
保存するだけで記事が公開される。

---

## 構築ステップ

### Step 1: Astroプロジェクト作成（30分）
```bash
cd D:\youph\Hobby\whisky-media-jp
npm create astro@latest site
# テンプレート: Blog
# TypeScript: Yes
# 依存関係インストール: Yes
```

### Step 2: カスタマイズ（2〜3時間）
- 日本語フォント設定
- カテゴリ・タグページ
- Chart.js組み込み
- アフィリエイトカードコンポーネント
- RSS生成
- SEO設定

### Step 3: GitHubリポジトリ作成（10分）
```bash
git init
git remote add origin https://github.com/[user]/whisky-media-jp.git
```

### Step 4: Cloudflare Pages設定（15分）
- GitHub連携
- ビルドコマンド: `cd site && npm run build`
- 出力ディレクトリ: `dist`
- カスタムドメイン設定

### Step 5: ドメイン取得・設定（10分）
- お名前.com 等でドメイン購入
- Cloudflare Pagesにカスタムドメイン登録
- DNS設定（CNAMEレコード）

### Step 6: 最初の記事をAIで生成→公開（15分）
- プロンプト投入
- 出力をMarkdown保存
- git push → 自動デプロイ

---

## スケジュール

| 日 | 作業 |
|----|------|
| 今日 | Astroプロジェクト作成・基本設定 |
| 明日 | コンポーネント開発（Chart.js・アフィリエイトカード） |
| 明後日 | GitHub + Cloudflare Pages + ドメイン設定 |
| 4日目 | プロンプト更新 + 最初の5記事をAIで量産 |
| 5日目 | デザイン調整・動作確認 → **公開** |
