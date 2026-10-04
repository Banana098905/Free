import type { Metadata } from 'next';
import { siteConfig } from './site';

type Options = {
  title: string;
  description: string;
  /** 例: "/articles/foo"（canonical と og:url に使う） */
  path: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildMetadata({
  title,
  description,
  path,
  type = 'website',
  publishedTime,
  modifiedTime,
}: Options): Metadata {
  const fullTitle = `${title}｜${siteConfig.name}`;
  const common = {
    title: fullTitle,
    description,
    url: path,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
  };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph:
      type === 'article'
        ? { ...common, type: 'article', publishedTime, modifiedTime }
        : { ...common, type: 'website' },
    twitter: { card: 'summary', title: fullTitle, description },
  };
}
