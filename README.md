# Whisky Data JP

ウイスキーの製品仕様と出典を日本語で整理する比較データベース。

公開URL: https://whisky-jp.antonbase.com/

## 現行コンセプト（2026-10）

主役は記事や独自ランキングではなく、構造化された銘柄データと比較UI。

- 200銘柄を同じスキーマで保持する
- 地域 / タイプ / 熟成年数 / 度数 / 樽などを横断して探せる
- 2〜4本を仕様表で比較できる
- メーカー・蒸留所・公的機関などの一次情報を優先する
- 外部データを使う場合は、出典と確認日時をレコードに保存する
- 個別銘柄ページは source-ready gate を通ったものだけ検索index対象にする
- 出典整備前のレコードは削除せず、サイト内カタログと比較用途に残す

## source-ready gate

src/utils/trust.ts が検索公開の基準。

個別銘柄が index-ready になるのは、原則として次のどちらかを満たすとき。

1. officialSourceUrl がある
2. whiskybase.score / votes / checkedAt が実確認値として保存されている

出典未整備の個別銘柄URLは noindex,follow で維持し、sitemapから外す。

## 既存の編集値

既存JSONには、過去の制作工程で付与した rating（100点）、flavor（8軸）、
priceSource=editorial の価格が残っている。互換性のため当面保持するが、
サイト全体を順位付けする根拠、検索向けの勝敗、公式データとしては扱わない。

- rating由来のランキング: 内部探索として残すが noindex
- rating と editorial price から作るコスパ: authoritativeな比較に使わない
- flavor閾値の一覧: 内部探索として残すが noindex
- editorial priceだけの価格: 主要仕様表・比較表では表示しない
- 構造化実飲記録なしに「編集部が試飲した」とは書かない

## 検索公開の境界

Index対象:
- /
- /whiskies/
- /compare/
- /region/*
- /distilleries/
- source-readyな /whisky/*
- 品質確認済みの記事・固定ページ

Noindex:
- source-readyではない /whisky/*
- /ranking/*
- /flavor/*
- /budget/*
- /tag/*
- 出典フィールド未整備の /distillery/*
- /search/

URLは消さず、出典整備後にindexへ戻せる設計にする。

## データの出典表示

UI上のマーク:
- 公: メーカー・蒸留所・公的機関などの一次情報をレコードに保存して確認
- 外: 出典URL / 確認日時を持つ外部・市場データ
- 登: 出典整備前のローカルカタログ登録値

「登」は公式確認済みを意味しない。

## 主な構造

- src/content/whiskies/: 200銘柄のJSON
- src/content/distilleries/: 蒸留所JSON
- src/content/blog/: 解説記事
- src/pages/: Astro routes
- src/utils/trust.ts: source-ready gate
- astro.config.mjs: sitemapもsource-ready gateに連動
- src/data/affiliates.ts: アフィリエイトURL
- src/data/whisky-photos.json: Wikimedia Commons写真のクレジット

## ローカル実行

npm install
npm run dev
npm run build
npx astro check

Cloudflare Pages は master へのpushで本番デプロイする。
ビルドコマンドは npm run build、出力は dist/。

## データ更新

OGP:
python docs/08-scripts/generate-ogp.py

CSV:
python docs/08-scripts/whiskies-csv.py export
python docs/08-scripts/whiskies-csv.py import

CSV import後も source-ready 判定はJSON内の出典フィールドで行う。

## 写真

Wikimedia CommonsのCCライセンス写真を一部銘柄で使用。

- 画像: public/images/whiskies/*
- クレジット: src/data/whisky-photos.json
- 写真がない銘柄はSVGへフォールバック
- CC BY / CC BY-SAはページで帰属表示する

写真の存在は source-ready 判定とは無関係。

## アフィリエイト

アフィリエイトURLは src/data/affiliates.ts に集約。
Amazonタグは src/data/site.ts の amazonTag。

アフィリエイトの有無は、検索index可否・出典状態・比較結果を決める条件にしない。

## 運用原則

1. 新しい銘柄を増やすより、既存200銘柄の出典整備を優先する。
2. source-readyへ上げるときは、対象JSONに根拠を保存する。
3. 価格は公式価格か、取得元と確認日を持つ市場価格のみ比較UIに出す。
4. Whiskybase値は実確認した score / votes / checkedAt だけ使う。
5. 「おすすめ」「コスパ」「上位何%」を内部点数から自動生成しない。
6. Search Consoleで需要が見えた銘柄から一次情報を追加し、index-readyへ昇格させる。
7. 20歳未満の飲酒禁止、妊娠・授乳中の飲酒回避、飲酒運転禁止の注意を維持する。
