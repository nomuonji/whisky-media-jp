// English dictionary — placeholder for the future English edition.
// Partially filled: missing keys fall back to `ja` (see i18n/index.ts).
export const en = {
  site: {
    name: 'Whisky Data JP',
    tagline: 'Whisky, read through data',
    description: 'Whiskybase data on 200,000 bottles, organised and visualised',
  },
  post: {
    backToList: '← Back to all posts',
    backToHome: '← Back to home',
    publishedOn: 'Published',
    updatedOn: 'Updated',
    relatedPosts: 'Related posts',
    nextPost: 'Next post',
    prevPost: 'Previous post',
  },
  empty: {
    noPosts: 'No posts yet — coming soon.',
  },
  errors: {
    notFound: 'Page not found',
    notFoundMessage: 'This page may have been removed, or the URL may be incorrect.',
    backToTop: 'Back to home',
  },
  pagination: {
    prev: 'Prev',
    next: 'Next',
    page: 'Page',
  },
} as const;
