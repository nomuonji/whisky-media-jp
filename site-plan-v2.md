# Site Architecture v2 — Complete Restructure Plan

## 現状の問題点（全特定済み）

| # | 問題 | 場所 | 影響 |
|---|------|------|------|
| 1 | CSSが283行の1ファイル | `styles/global.css` | 新コンポーネント追加で崩壊 |
| 2 | `categoryLabels` が3ファイルに重複定義 | PostCard / [slug] / category/[cat] | カテゴリ追加時に3箇所修正 |
| 3 | コンポーネントがフラット3個 | `components/` | 増えると迷子になる |
| 4 | ヘッダー・フッターがBaseLayoutに直書き | `layouts/BaseLayout.astro` | レイアウト変更が全ページに波及 |
| 5 | アフィリエイトURLが記事Frontmatterに直書き | `content/blog/*.md` | URL変更で全記事修正 |
| 6 | `content.config.ts` と `content/config.ts` が重複 | `src/content/` | 型の参照元が不明瞭 |
| 7 | 型定義が各コンポーネント内に散在 | 各.astroファイル | 型変更で影響範囲不明 |
| 8 | デザイントークンが不完全（スペーシングなし等） | `global.css` | 一貫性のないデザインに |
| 9 | 404ページなし | — | リンク切れでユーザー離脱 |
| 10 | トップにページネーションなし | `pages/index.astro` | 100記事で1ページに全表示 |
| 11 | パンくずなし | — | 内部リンク構造が弱い（SEO減点） |
| 12 | i18nの準備ゼロ | — | 英語展開時に全ページ二重化 |
| 13 | コンテンツコレクションがblogだけ | `content.config.ts` | 蒸留所DB・用語集が作れない |

---

## 新アーキテクチャ

```
site/src/
│
├── types/                         # ★全TypeScript型定義（1箇所集約）
│   ├── index.ts                   #   再エクスポート
│   ├── content.ts                 #   Frontmatter・コレクションの型
│   ├── whisky.ts                  #   ウイスキーデータ型（RadarChart等）
│   ├── affiliate.ts               #   アフィリエイト型
│   ├── navigation.ts              #   ナビゲーション項目の型
│   └── site.ts                    #   サイト設定の型
│
├── data/                          # ★構造化データ（Markdown以外のデータ）
│   ├── site.ts                    #   サイト名・URL・SNS・運営者情報
│   ├── categories.ts              #   カテゴリ定義（ラベル・スラッグ・説明）
│   ├── navigation.ts             #   ナビゲーション構造（配列）
│   ├── affiliates.ts              #   アフィリエイトリンクDB（ID→URL）
│   └── whiskies.ts                #   ウイスキーマスターデータ（スコア等）
│
├── content/                       # ★コンテンツコレクション（拡張可能）
│   ├── config.ts                  #   全コレクション統合定義（1ファイル）
│   ├── blog/                      #   記事
│   │   ├── 2026-08-04-beginner-guide-types.md
│   │   └── ...
│   ├── distilleries/              #   蒸留所DB（将来）
│   └── glossary/                  #   用語集（将来）
│
├── components/                    # ★Atomic Design 6階層
│   ├── ui/                        #   Atoms: 最小単位・状態なし・再利用100%
│   │   ├── Button.astro
│   │   ├── Tag.astro
│   │   ├── Card.astro
│   │   └── Badge.astro
│   ├── blog/                      #   Molecules: ブログ固有
│   │   ├── PostCard.astro         #     記事カード
│   │   ├── PostList.astro         #     記事一覧 + ページネーション
│   │   ├── PostMeta.astro         #     日付・カテゴリ・タグ
│   │   ├── PostGrid.astro         #     グリッドレイアウト表示
│   │   └── RelatedPosts.astro     #     関連記事（将来）
│   ├── whisky/                    #   Molecules: ウイスキー固有
│   │   ├── RadarChart.astro       #     レーダーチャート
│   │   ├── ComparisonTable.astro  #     比較表
│   │   ├── FlavorWheel.astro      #     フレーバーホイール（将来）
│   │   └── PriceGraph.astro       #     価格グラフ（将来）
│   ├── affiliate/                 #   Molecules: アフィリエイト
│   │   ├── AffiliateSection.astro #     購入セクション全体
│   │   ├── BuyButton.astro        #     購入ボタン
│   │   └── PriceDisplay.astro     #     価格表示
│   ├── layout/                    #   Organisms: レイアウト部品
│   │   ├── SiteHeader.astro       #     サイトヘッダー
│   │   ├── SiteFooter.astro       #     サイトフッター
│   │   ├── MainNav.astro          #     ナビゲーション
│   │   ├── Breadcrumb.astro       #     パンくず
│   │   ├── Container.astro        #     幅制限ラッパー
│   │   └── Hero.astro             #     トップヒーロー
│   └── seo/                       #   Organisms: SEO
│       ├── BaseHead.astro         #     meta/OGP/TwitterCard
│       └── JsonLd.astro           #     構造化データ（Article）
│
├── layouts/                       # ★ページレイアウト（役割別4種）
│   ├── BaseLayout.astro           #   最小構成（404用・ヘッダー＋フッターのみ）
│   ├── BlogPostLayout.astro       #   記事ページ（パンくず＋チャート＋アフィリ）
│   ├── IndexLayout.astro          #   トップページ（ヒーロー＋グリッド）
│   └── ListLayout.astro           #   一覧ページ（カテゴリ・タグ・検索）
│
├── pages/                         # ★ルーティング（既存5 + 追加3）
│   ├── index.astro                #   トップ
│   ├── [slug].astro               #   個別記事
│   ├── category/[cat].astro       #   カテゴリ一覧
│   ├── tag/[tag].astro            #   タグ一覧
│   ├── about.astro                #   運営者情報
│   ├── 404.astro                  #   ★追加：エラーページ
│   ├── search.astro               #   ★追加：検索結果（将来枠）
│   ├── distilleries/              #   ★追加：蒸留所DB（将来枠）
│   │   └── [slug].astro
│   └── rss.xml.js                 #   RSS
│
├── styles/                        # ★分割CSS
│   ├── tokens.css                 #   デザイントークン（CSS変数定義）
│   ├── reset.css                  #   リセット
│   ├── base.css                   #   ベーススタイル（html/body/a/img/table）
│   ├── typography.css             #   文字（h1〜h6/p/blockquote/code）
│   ├── utilities.css              #   ユーティリティ（sr-only等）
│   ├── components/               #   コンポーネント別（CSS Modules的）
│   │   ├── header.css
│   │   ├── footer.css
│   │   ├── cards.css
│   │   ├── buttons.css
│   │   ├── charts.css
│   │   └── affiliate.css
│   └── global.css                 #   全importの統合エントリポイント
│
├── utils/                         # ★ユーティリティ
│   ├── date.ts                    #   日付フォーマット（formatDate等）
│   ├── url.ts                     #   URL生成（blogUrl, categoryUrl等）
│   ├── affiliate.ts              #   アフィリエイトリンク解決
│   ├── pageination.ts            #   ページネーション計算
│   └── whisky.ts                  #   スコア計算・データ変換
│
├── i18n/                          # ★国際化（英語展開用）
│   ├── index.ts                   #   言語切り替えロジック
│   ├── ja.ts                      #   日本語辞書
│   └── en.ts                      #   英語辞書（枠のみ、将来実装）
│
├── middleware.ts                  # リダイレクト・言語判別
└── env.d.ts                      # Asto型定義
```

---

## デザインシステム

### 1. 完全なデザイントークン

```css
/* tokens.css */
:root {
  /* === Color Palette === */
  /* Brand */
  --color-brand:            #D4A030;
  --color-brand-light:      #F5E6D3;
  --color-brand-dark:       #B8860B;

  /* Surface */
  --color-surface:          #FFFFFF;
  --color-surface-elevated: #FAF9F6;
  --color-surface-subdued:  #F5F0E8;

  /* Text */
  --color-text:             #2C2416;
  --color-text-secondary:   #6B5E4A;
  --color-text-tertiary:    #9B8E7A;
  --color-text-link:        #8B6914;

  /* Border */
  --color-border:           #E0D5C1;
  --color-border-light:     #F0EBE0;

  /* Status */
  --color-success:          #4A7C59;
  --color-error:            #C44D4D;

  /* Chart colors */
  --color-chart-a:          #D4A030;  /* 琥珀 */
  --color-chart-b:          #20B2AA;  /* 青緑 */
  --color-chart-c:          #C44D4D;  /* 赤 */
  --color-chart-d:          #4A7C59;  /* 緑 */

  /* === Typography === */
  --font-sans:    'Noto Sans JP', 'Hiragino Sans', sans-serif;
  --font-display: 'Noto Serif JP', 'Hiragino Mincho', serif;

  --text-xs:      0.75rem;     /* 12px */
  --text-sm:      0.875rem;    /* 14px */
  --text-base:    1.0625rem;   /* 17px */
  --text-lg:      1.25rem;     /* 20px */
  --text-xl:      1.5rem;      /* 24px */
  --text-2xl:     2rem;        /* 32px */

  --leading-tight:  1.4;
  --leading-base:   1.8;
  --leading-loose:  2.0;

  --weight-normal: 400;
  --weight-medium: 600;
  --weight-bold:   700;

  /* === Spacing === */
  --space-3xs:  0.125rem;   /* 2px */
  --space-2xs:  0.25rem;    /* 4px */
  --space-xs:   0.5rem;     /* 8px */
  --space-sm:   0.75rem;    /* 12px */
  --space-md:   1rem;       /* 16px */
  --space-lg:   1.5rem;     /* 24px */
  --space-xl:   2rem;       /* 32px */
  --space-2xl:  3rem;       /* 48px */
  --space-3xl:  4rem;       /* 64px */

  /* === Layout === */
  --content-width:   720px;
  --content-wide:    960px;
  --header-height:   64px;

  /* === Border Radius === */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-pill: 999px;

  /* === Shadows === */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.06);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg:  0 8px 24px rgba(0,0,0,0.12);

  /* === Transitions === */
  --transition-fast:   150ms ease;
  --transition-base:   250ms ease;

  /* === Z-index === */
  --z-header:   100;
  --z-dropdown: 200;
  --z-modal:    300;
}
```

### 2. カラーロール（使い分けルール）

| トークン | 使用場所 |
|----------|---------|
| `--color-brand` | ボタン、アクセント線、チャート |
| `--color-brand-light` | 背景ハイライト、blockquote |
| `--color-surface` | カード、ヘッダー、フッター背景 |
| `--color-surface-elevated` | ホバー時のカード |
| `--color-text` | 本文 |
| `--color-text-secondary` | 補足文、日付、メタ情報 |
| `--color-text-link` | リンク |
| `--color-border` | 境界線、テーブル罫線 |

### 3. タイポグラフィスケール

| トークン | 用途 |
|----------|------|
| `--text-xs` | ディスクレーマー、フッター注釈 |
| `--text-sm` | メタ情報、タグ、ナビゲーション |
| `--text-base` | 本文 |
| `--text-lg` | 小見出し、リード文 |
| `--text-xl` | h3 |
| `--text-2xl` | h1、ヒーロータイトル |

### 4. スペーシングスケール

| トークン | 用途 |
|----------|------|
| `--space-xs` | アイコンとテキストの間 |
| `--space-sm` | タグ間、リスト項目間 |
| `--space-md` | 段落間、カード内padding |
| `--space-lg` | セクション間、カード間 |
| `--space-xl` | 大きなセクション間 |
| `--space-2xl` | ページトップ・ボトムの余白 |

---

## 型システム

```typescript
// types/content.ts
export const CATEGORIES = [
  'scotch', 'japanese', 'bourbon', 'irish', 'world', 'guide', 'news'
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  scotch: 'スコッチ',
  japanese: 'ジャパニーズ',
  bourbon: 'バーボン',
  irish: 'アイリッシュ',
  world: 'ワールド',
  guide: '初心者ガイド',
  news: 'ニュース',
};

// types/affiliate.ts
export interface AffiliateLink {
  name: string;
  url: string;
  price?: number;
}
export interface AffiliateData {
  amazon_jp?: AffiliateLink[];
  amazon_us?: AffiliateLink[];
  rakuten?: AffiliateLink[];
}
```

---

## データ層（一元管理）

```typescript
// data/categories.ts  ← PostCard/[slug]/categoryの3重複を解消
import { CATEGORY_LABELS, type Category } from '../types/content';
export { CATEGORY_LABELS, type Category };

// data/navigation.ts  ← BaseLayoutのnav直書きを解消
export const MAIN_NAV = [
  { label: 'スコッチ',  href: '/category/scotch/' },
  { label: 'ジャパニーズ', href: '/category/japanese/' },
  { label: 'バーボン',  href: '/category/bourbon/' },
  { label: '初心者ガイド', href: '/category/guide/' },
  { label: 'ニュース',  href: '/category/news/' },
] as const;

// data/site.ts  ← BaseLayoutのsiteName/siteUrl直書きを解消
export const SITE = {
  name: 'Whisky Data JP',
  url: 'https://whisky-data.jp',
  description: 'Whiskybase 20万本のデータを日本語で整理・可視化',
  locale: 'ja_JP',
  ogImage: '/images/ogp-default.png',
  twitter: '@whisky_data_jp',
} as const;

// data/affiliates.ts  ← 記事FrontmatterのURL直書きを解消
export const AFFILIATE_DB: Record<string, AffiliateData> = {
  'yamazaki-12': {
    amazon_jp: [{ name: '山崎12年', url: 'https://amazon.co.jp/...', price: 16800 }],
    amazon_us: [{ name: 'Yamazaki 12', url: 'https://amazon.com/...', price: 199 }],
  },
  // ...
};
```

---

## コンポーネント責務一覧

| コンポーネント | 層 | 受け取るprops | 自分でimportするもの |
|---------------|-----|-------------|-------------------|
| `ui/Button` | Atom | label, href, variant, size | — |
| `ui/Tag` | Atom | label, href | — |
| `ui/Card` | Atom | `<slot>` | — |
| `ui/Badge` | Atom | label, color | — |
| `blog/PostMeta` | Molecule | date, category, tags | CATEGORY_LABELS, formatDate |
| `blog/PostCard` | Molecule | post: CollectionEntry | PostMeta |
| `blog/PostList` | Molecule | posts, page, total | PostCard, Pagination |
| `whisky/RadarChart` | Molecule | labels, datasets, title | Chart.js |
| `affiliate/AffiliateSection` | Molecule | affiliateId or links | AFFILIATE_DB, BuyButton |
| `layout/SiteHeader` | Organism | — | MAIN_NAV, SITE |
| `layout/SiteFooter` | Organism | — | SITE |
| `layout/MainNav` | Organism | items, currentPath | — |
| `layout/Breadcrumb` | Organism | items | — |
| `layout/Hero` | Organism | title, description | — |
| `seo/BaseHead` | Organism | title, description, ogImage | SITE |
| `seo/JsonLd` | Organism | post | SITE |

---

## レイアウト構成図

```
IndexLayout（トップ）
├── BaseLayout
│   ├── BaseHead
│   ├── SiteHeader > MainNav
│   ├── <slot />
│   └── SiteFooter
├── Hero
└── PostList > PostCard[]

BlogPostLayout（記事）
├── BaseLayout（同上）
├── Breadcrumb
├── <article>
│   ├── PostMeta
│   ├── RadarChart（if）
│   ├── <slot />  ← Content
│   └── AffiliateSection（if）
├── JsonLd
└── RelatedPosts（将来）

ListLayout（カテゴリ・タグ・検索）
├── BaseLayout（同上）
├── Breadcrumb
├── <h1>ページタイトル</h1>
└── PostList > PostCard[]

BaseLayout（最小＝404用）
├── BaseHead
├── SiteHeader > MainNav
├── <slot />
└── SiteFooter
```

---

## 既存記事の移行

3記事のFrontmatterを新形式に更新：

```markdown
---
title: "..."
date: 2026-08-06
# affiliate: yamazaki-12,hakushu-12  ← ID指定に変更（将来）
# 移行中は旧形式もサポート
radar_chart:
  ...
---
```

---

## 実装順序（壊さずに7フェーズ）

| Phase | 内容 | ビルド確認 |
|-------|------|-----------|
| **1** | ディレクトリ作成 + types/ + data/ 作成 | ✅ |
| **2** | CSSを tokens.css + 分割ファイルに再編 | ✅ |
| **3** | コンポーネントを新構造に移行（旧ファイルは削除せず残す） | ✅ |
| **4** | レイアウト4種作成 + ページを新レイアウトに接続 | ✅ |
| **5** | 404 + ページネーション + パンくず追加 | ✅ |
| **6** | i18n枠 + middleware作成 | ✅ |
| **7** | 旧ファイル削除 + 最終クリーンアップ | ✅ |

各Phaseで `npx astro build` を実行し、壊れていないことを確認してから次に進む。

---

## 実装状況（2026-08-05 時点）

`npx astro build` / `npx astro check`（0 errors）を通過済み。

### 完了

- **types/ · data/** — 型を1箇所に集約。`data/categories.ts`（3重複を解消）、
  `data/affiliates.ts`（URLをFrontmatterから追い出し）、`data/whiskies.ts`（数値データ）
- **utils/** — `date` `url` `affiliate` `pagination` `whisky` `posts`
  （`posts.ts` は plan外の追加。draft・未来日付の除外ロジックを1箇所にまとめるため）
- **CSS分割** — `tokens / reset / base / typography / utilities` +
  components 11ファイル。インラインstyleはページから全廃
- **コンポーネント** — ui（Button/Tag/Card/Badge）、blog（PostCard/PostMeta/PostGrid/
  PostList/Pagination/RelatedPosts）、whisky（RadarChart/ComparisonTable）、
  affiliate（AffiliateSection/BuyButton/PriceDisplay）、layout（+Container）、
  seo（BaseHead/JsonLd）
- **レイアウト4種** — Base / BlogPost / Index / List。全ページが接続済み
- **ページ追加** — `/page/[page]`（トップのページネーション。1ページ目は `/` のまま）、
  `/search`（`/search-index.json` を使ったクライアント検索）
- **i18n** — `index.ts` の辞書切り替え + `en.ts` の枠。`middleware.ts` で
  `Astro.locals.locale` / `locals.t` を供給
- **SEO** — canonical / og:url / og:locale / article:published_time /
  JSON-LD（WebSite + Article + BreadcrumbList）/ 2ページ目以降のnoindex

### 修正した既存バグ

1. **レーダーチャートが描画されていなかった** — Astroの `<script>` は
   Frontmatterの変数を埋め込まないため `getElementById('{chartId}')` が常にnullだった。
   `data-radar` 属性 + `querySelectorAll` に変更（複数チャートにも対応）
2. **記事カードのリンク入れ子** — `<a class="post-card">` の中にカテゴリ・タグの
   `<a>` があり不正なHTMLだった。タイトルのみリンクにし、`::after` でカード全面を
   クリック領域に
3. `AffiliateSection` の `return null` を条件レンダリングに変更

### 意図的に見送り（将来枠）

- `whisky/FlavorWheel` `whisky/PriceGraph` — データが揃ってから
- `pages/distilleries/` — 蒸留所コレクションを作る段階で追加
- サイトマップ — `astro.config.mjs` のコメント通り記事が増えてから有効化
- 英語版ページの実体 — 辞書と判定ロジックのみ用意
