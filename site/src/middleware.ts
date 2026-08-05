import { defineMiddleware } from 'astro:middleware';
import { localeFromPath, useTranslations } from './i18n';

/**
 * 静的ビルドでは各ページの生成時に1度だけ実行される。
 * URLから言語を判定し、辞書を Astro.locals に載せる。
 * （英語版を追加したら、各コンポーネントは locals.t を参照するだけでよい）
 */
export const onRequest = defineMiddleware((context, next) => {
  const locale = localeFromPath(context.url.pathname);
  context.locals.locale = locale;
  context.locals.t = useTranslations(locale);
  return next();
});
