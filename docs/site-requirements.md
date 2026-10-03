# Whisky Data JP — 現行完成要件

この文書は2026-10の「出典付きウイスキー仕様比較DB」方針を基準にする。
過去の rating / flavor / コスパ中心の完成要件は廃止する。

## 0. サイト定義

ウイスキーを選ぶ人が、銘柄の仕様と根拠を同じ形式で比較できるデータベース。

価値の中心:
- 200銘柄を同一スキーマで保持
- 地域 / タイプ / 熟成年数 / 度数 / 樽を横断探索
- 2〜4銘柄を仕様表で比較
- 出典状態を読者が判別可能
- source-readyな個別ページだけ検索公開

非目標:
- 根拠のない独自100点ランキング
- editorial price ÷ rating で「コスパ」を断定
- 全200ページを一律index
- Whiskybase 20万本を転載・翻訳するサイト
- 構造化された実飲記録なしに官能評価を権威化すること

## 1. データ品質

### source-ready

個別銘柄の検索公開条件:
- officialSourceUrl がある、または
- 実確認した whiskybase.score / votes / checkedAt がある

source-readyでない銘柄:
- URL維持
- noindex,follow
- sitemap除外
- /whiskies/ と /compare/ では利用可能

### 価格

比較UIに出せる価格:
- priceSource が official または market
- priceSourceUrl がある
- priceAsOf がある

editorial 価格は互換データとして残してよいが、主要比較値には使わない。

### 出典マーク

- 公: 一次情報確認済み
- 外: 出典と確認日時を持つ外部データ
- 登: 出典整備前のカタログ値

未確認値に 公 を付けない。

## 2. 検索公開

Index:
- /
- /whiskies/
- /compare/
- /region/*
- /distilleries/
- source-ready /whisky/*
- 品質確認済み記事

Noindex:
- source-readyではない /whisky/*
- /ranking/*
- /flavor/*
- /budget/*
- /tag/*
- /distillery/*（蒸留所レコードに出典フィールドが未実装の間）
- /search/

sitemapはこの境界と一致させる。

## 3. UI受け入れ基準

- [ ] 全200銘柄を /whiskies/ で地域・タイプから探索できる
- [ ] source-readyだけに絞れる
- [ ] 一覧カードが独自評価点を主要数値として表示しない
- [ ] /compare/ で最大4本を仕様比較できる
- [ ] 比較表は region / type / age / ABV / cask / sourced price / source status を表示
- [ ] 比較表に rating / cost-per-point / flavor winner を出さない
- [ ] 個別ページは出典状態を明示
- [ ] 未検証価格を主要仕様表に出さない
- [ ] 公式ソースがある場合はリンクを表示
- [ ] Wikimedia写真の帰属を維持

## 4. 技術受け入れ基準

- [ ] npm run build が成功
- [ ] npx astro check が重大エラーなし
- [ ] sitemapにnoindex対象を入れない
- [ ] source-ready銘柄は sitemap に含まれる
- [ ] unverified銘柄は sitemap に含まれない
- [ ] 全200の /whisky/[slug]/ URL自体は生成される
- [ ] canonicalは https://whisky-jp.antonbase.com
- [ ] Cloudflare Pages本番デプロイ成功

## 5. 成長運用

新規記事量産より、GSC需要を見て既存レコードを source-ready に昇格する。

優先順位:
1. impressions/clicksが既にある銘柄
2. 検索需要が大きく、一次情報が取得できる銘柄
3. 比較需要がある同一ブランド/同一シリーズ
4. regionページを強くする主要銘柄

source-ready昇格のたびに:
- 公式仕様を再確認
- source URLを保存
- 価格を載せるなら価格条件・確認日・出典URLを保存
- 既存notesの未検証断定を除去または出典分離
- build / preview / production確認
- GSCを完全期間で評価

## 6. 飲酒・商用ポリシー

- 20歳未満の飲酒禁止表記を維持
- 妊娠・授乳中の飲酒回避
- 飲酒運転禁止
- アフィリエイト関係を明示
- アフィリエイト有無を評価・index条件にしない
