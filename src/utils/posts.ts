import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished } from './date';
import policy from '../data/content-policy.json';

export type Post = CollectionEntry<'blog'>;

const NOINDEX_ARTICLES = new Set(policy.noindexArticles);

export function isActivePost(post: Post): boolean {
  return !NOINDEX_ARTICLES.has(post.slug);
}

export function isLegacyPost(post: Post): boolean {
  return NOINDEX_ARTICLES.has(post.slug);
}

export async function getAllPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => {
    if (!import.meta.env.PROD) return true;
    return !data.draft && isPublished(data.date);
  });

  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/**
 * 通常の一覧・カテゴリ・関連記事に出す active 記事だけを返す。
 * legacy記事はURL自体を維持するため getAllPublishedPosts() から生成する。
 */
export async function getPublishedPosts(): Promise<Post[]> {
  return (await getAllPublishedPosts()).filter(isActivePost);
}

export function byCategory(posts: Post[], category: string): Post[] {
  return posts.filter((p) => p.data.category === category);
}

export function byTag(posts: Post[], tag: string): Post[] {
  return posts.filter((p) => (p.data.tags || []).includes(tag));
}

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
