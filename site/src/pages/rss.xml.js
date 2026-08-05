import rss from '@astrojs/rss';
import { SITE } from '../data/site';
import { getPublishedPosts } from '../utils/posts';
import { postUrl } from '../utils/url';

export async function GET() {
  const posts = await getPublishedPosts();

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: SITE.url,
    customData: '<language>ja</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt || post.data.seo?.description || '',
      link: postUrl(post.slug),
      categories: [post.data.category, ...(post.data.tags || [])],
    })),
  });
}
