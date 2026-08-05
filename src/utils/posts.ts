import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished } from './date';

export type Post = CollectionEntry<'blog'>;

/**
 * 公開記事を新しい順で返す。
 * 本番ビルドでは draft と未来日付を除外し、開発中はすべて表示する。
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => {
    if (!import.meta.env.PROD) return true;
    return !data.draft && isPublished(data.date);
  });

  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function byCategory(posts: Post[], category: string): Post[] {
  return posts.filter((p) => p.data.category === category);
}

export function byTag(posts: Post[], tag: string): Post[] {
  return posts.filter((p) => (p.data.tags || []).includes(tag));
}

/** 全記事のタグを出現回数の多い順に返す */
export function collectTags(posts: Post[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags || []) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'ja'));
}
