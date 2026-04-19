/**
 * Lab 2 チュートリアルモード (/lab/memory-leak/tutorial)。
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { JsonLd } from '@/components/seo/JsonLd'
import { LAB_MEMORY_LEAK_META } from '@/features/lab-memory-leak'
import { TutorialMode } from '@/features/lab-memory-leak/components/TutorialMode'
import { buildTechArticle } from '@/lib/seo'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `${LAB_MEMORY_LEAK_META.shortTitle} — 稽古（チュートリアル）`,
  description: '5 ステップのガイド付きで 4 種類のメモリリークを観察するチュートリアル。',
  alternates: { canonical: `${LAB_MEMORY_LEAK_META.path}/tutorial` },
  openGraph: {
    title: `${LAB_MEMORY_LEAK_META.shortTitle} 稽古 | ${SITE.name}`,
    description: 'ガイド付きのメモリリーク稽古。',
    url: `${SITE.url}${LAB_MEMORY_LEAK_META.path}/tutorial`,
  },
}

const JSON_LD = buildTechArticle({
  title: `${LAB_MEMORY_LEAK_META.shortTitle} 稽古`,
  description: '5 ステップのガイド付きでメモリリーク 4 種類を順番に観察するチュートリアル。',
  path: `${LAB_MEMORY_LEAK_META.path}/tutorial`,
  datePublished: '2026-04-19',
  keywords: ['チュートリアル', 'メモリリーク', 'performance.memory', 'AbortController'],
})

export default function LabMemoryLeakTutorialPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <JsonLd data={JSON_LD} />
      <Suspense fallback={null}>
        <TutorialMode />
      </Suspense>
    </div>
  )
}
