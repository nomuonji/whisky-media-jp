# マスター出力フォーマット

## これは最重要プロンプトです

すべての記事系プロンプトで、この出力フォーマットを使用してください。
AIが出力したMarkdownは、そのまま `src/content/blog/[slug].mdx` に保存すれば
サイトに公開されます。

---

## 出力フォーマット指示（すべての記事プロンプトの末尾に追加）

```
## 出力形式

以下の形式の完全なMDXファイルを出力してください。
このファイルはそのまま `src/content/blog/YYYY-MM-DD-slug.mdx` に保存され、
自動的にサイトに公開されます。

```mdx
---
title: "[30〜40文字のタイトル]"
date: YYYY-MM-DD
category: scotch | japanese | bourbon | irish | world | guide | news
tags: [タグ1, タグ2, タグ3]
excerpt: "[100文字以内の要約。検索結果やSNSで表示されます]"
seo:
  description: "[120〜160文字のSEO用説明文]"
  og_image: "/images/[画像ファイル名].png"
affiliate:
  amazon_jp:
    - name: "[商品名]"
      url: "https://amazon.co.jp/..."
      price: 数値のみ（円）
  amazon_us:
    - name: "[Product Name]"
      url: "https://amazon.com/..."
      price: 数値のみ（ドル）
  rakuten:
    - name: "[商品名]"
      url: "https://..."
      price: 数値のみ（円）
radar_chart:
  labels: [ピート, 甘さ, フルーティ, スパイシー, オーク, スモーキー, 複雑さ, コスパ]
  datasets:
    - name: "[銘柄名]"
      data: [0〜5, 0〜5, 0〜5, 0〜5, 0〜5, 0〜5, 0〜5, 0〜5]
      color: "#D4A030"
---

[ここにMarkdown本文を書く]
```

### Frontmatter ルール

1. **title**: 30〜40文字。数字や比較を含めるとクリック率UP
2. **date**: 必ず YYYY-MM-DD 形式。未来日は不可
3. **category**: 以下のいずれか
   - scotch: スコッチウイスキー
   - japanese: ジャパニーズウイスキー
   - bourbon: バーボン
   - irish: アイリッシュ
   - world: その他のワールドウイスキー
   - guide: 初心者ガイド・ハウツー
   - news: ニュース・トレンド
4. **tags**: 配列形式。初心者、比較、サントリー、ニッカ、スコッチ、バーボン、ピート、シェリー、投資、おすすめ などから適切なものを
5. **excerpt**: 100文字以内。記事一覧に表示される要約
6. **seo.description**: 120〜160文字。Google検索結果に表示される説明文
7. **affiliate**: アフィリエイトリンク情報（ない場合は省略可）
   - 価格は数値のみ（カンマや¥記号不要）
   - URLは実際のアフィリエイトリンク
8. **radar_chart**: レーダーチャートデータ（比較記事の場合のみ）
   - labelsは8軸固定
   - 各スコアは0〜5の整数
   - colorはHEXカラーコード

### 本文ルール

- です・ます調
- 見出しは h2（##）と h3（###）のみ使用
- 1段落は2〜4文まで（スマホで読みやすく）
- 必ず1つ以上の表（Markdownテーブル）を含める
- 数量・価格・点数は具体的な数字を入れる
- 画像は `![代替テキスト](/images/ファイル名.png)` 形式
- 最後に「次に読むべき記事」の内部リンクを2〜3件入れる
- 総文字数：1,500〜3,000文字

### ファイル名ルール
`YYYY-MM-DD-[英語スラッグ].md`
例: `2026-08-04-beginner-guide-types.md`
```
