// Japanese dictionary — single source of truth for all UI text
export const ja = {
  site: {
    name: 'Whisky Data JP',
    tagline: 'データで読むウイスキー',
    description: 'Whiskybase 20万本のデータを日本語で整理・可視化',
  },
  nav: {
    home: 'トップ',
    scotch: 'スコッチ',
    japanese: 'ジャパニーズ',
    bourbon: 'バーボン',
    guide: '初心者ガイド',
    news: 'ニュース',
    about: 'このサイトについて',
  },
  post: {
    backToList: '← 記事一覧に戻る',
    backToHome: '← トップに戻る',
    publishedOn: '公開',
    updatedOn: '更新',
    relatedPosts: '関連記事',
    nextPost: '次の記事',
    prevPost: '前の記事',
  },
  affiliate: {
    buyHere: '購入はこちら',
    buyButton: '購入 →',
    disclaimer: '※リンクにはアフィリエイト広告が含まれます。購入価格は変わりません。',
  },
  chart: {
    radarTitle: '味の傾向比較（5段階）',
  },
  empty: {
    noPosts: '記事準備中です。近日公開！',
  },
  search: {
    title: '記事を検索',
    placeholder: 'キーワードを入力（例：山崎、ピート、コスパ）',
    label: '検索キーワード',
    resultCount: '{count}件の記事が見つかりました',
    noResults: '「{query}」に一致する記事は見つかりませんでした。',
    prompt: 'キーワードを入力すると記事を検索します。',
  },
  errors: {
    notFound: 'ページが見つかりません',
    notFoundMessage: 'お探しのページは削除されたか、URLが間違っている可能性があります。',
    backToTop: 'トップページに戻る',
  },
  pagination: {
    prev: '前へ',
    next: '次へ',
    page: 'ページ',
  },
  footer: {
    copyright: '© {year} {name}',
  },
} as const;
