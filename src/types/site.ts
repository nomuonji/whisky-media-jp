export interface SiteConfig {
  name: string;
  url: string;
  description: string;
  locale: string;
  ogImage: string;
  twitter?: string;
  copyright: string;
  startYear: number;
  /** AmazonアソシエイトのトラッキングID（Associates Centralで取得） */
  amazonTag: string;
}
