import type { NavItem } from '../types/navigation';

/** ヘッダー。読者は記事ではなく「どれを買うか」を探しに来るので銘柄軸を主にする */
export const MAIN_NAV: NavItem[] = [
  { label: '銘柄データベース', href: '/whiskies/' },
  { label: '比較する', href: '/compare/' },
  { label: '地域から探す', href: '/region/japan/' },
  { label: '蒸留所', href: '/distilleries/' },
  { label: '記事', href: '/articles/' },
];

/** 銘柄への入口（トップとフッターで使う） */
export const DISCOVERY_LINKS: NavItem[] = [
  { label: '全銘柄から探す', href: '/whiskies/' },
  { label: '2〜4本を比較する', href: '/compare/' },
  { label: 'ジャパニーズ一覧', href: '/region/japan/' },
  { label: 'アイラ一覧', href: '/region/islay/' },
  { label: '蒸留所から探す', href: '/distilleries/' },
  { label: 'ウイスキーの種類を知る', href: '/2026-08-04-beginner-guide-types/' },
];

export const FOOTER_LINKS: NavItem[] = [
  { label: '銘柄を探す', href: '/whiskies/' },
  { label: '比較する', href: '/compare/' },
  { label: '蒸留所', href: '/distilleries/' },
  { label: '記事一覧', href: '/articles/' },
  { label: '検索', href: '/search/' },
  { label: 'RSS', href: '/rss.xml' },
  { label: 'このサイトについて', href: '/about/' },
  { label: 'プライバシーポリシー', href: '/privacy/' },
  { label: '免責事項', href: '/disclaimer/' },
  { label: 'お問い合わせ', href: '/contact/' },
];
