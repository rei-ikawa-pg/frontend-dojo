/**
 * JSON-LD 構造化データのビルダー。
 * schema.org の語彙に合わせて、サイト全体・記事・パンくずなどを生成する。
 */

import type { BreadcrumbList, TechArticle, WebSite, WithContext } from 'schema-dts'
import { SITE } from './site'

export function buildWebSite(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    alternateName: SITE.nameEn,
    url: SITE.url,
    inLanguage: 'ja-JP',
    description: SITE.description,
  }
}

export type TechArticleInput = {
  title: string
  description: string
  /** サイト内の絶対パス (e.g. /lab/render) */
  path: string
  datePublished?: string
  dateModified?: string
  keywords?: readonly string[]
}

export function buildTechArticle(input: TechArticleInput): WithContext<TechArticle> {
  const url = `${SITE.url}${input.path}`
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: input.title,
    description: input.description,
    url,
    inLanguage: 'ja-JP',
    mainEntityOfPage: url,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    keywords: input.keywords ? Array.from(input.keywords) : undefined,
    author: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
  }
}

export type BreadcrumbItem = { name: string; path: string }

export function buildBreadcrumbs(items: readonly BreadcrumbItem[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  }
}
