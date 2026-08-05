import type { NavItem } from '../types/navigation';

/** ヘッダー。読者は記事ではなく「どれを買うか」を探しに来るので銘柄軸を主にする */
export const MAIN_NAV: NavItem[] = [
  { label: '銘柄を探す', href: '/whiskies/' },
  { label: 'ランキング', href: '/ranking/cospa/' },
  { label: '予算で選ぶ', href: '/budget/5000/' },
  { label: '蒸留所', href: '/distilleries/' },
  { label: '記事', href: '/articles/' },
];

/** 銘柄への入口（トップとフッターで使う） */
export const DISCOVERY_LINKS: NavItem[] = [
  { label: '3,000円以内で買える', href: '/budget/3000/' },
  { label: '5,000円以内で買える', href: '/budget/5000/' },
  { label: 'コスパランキング', href: '/ranking/cospa/' },
  { label: '初心者向けランキング', href: '/ranking/beginner/' },
  { label: 'クセが少ない', href: '/flavor/mild/' },
  { label: 'ピーティ・スモーキー', href: '/flavor/peaty/' },
  { label: 'コクが強い', href: '/flavor/rich/' },
  { label: '甘口', href: '/flavor/sweet/' },
  { label: 'アイラのウイスキー', href: '/region/islay/' },
  { label: 'ジャパニーズ', href: '/region/japan/' },
  { label: '蒸留所を地域から探す', href: '/distilleries/' },
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
