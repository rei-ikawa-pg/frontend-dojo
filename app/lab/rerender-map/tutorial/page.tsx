/**
 * Lab 3 チュートリアルモード (/lab/rerender-map/tutorial)。
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { JsonLd } from '@/components/seo/JsonLd'
import { LAB_RERENDER_MAP_META } from '@/features/lab-rerender-map'
import { TutorialMode } from '@/features/lab-rerender-map/components/TutorialMode'
import { buildTechArticle } from '@/lib/seo'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `${LAB_RERENDER_MAP_META.shortTitle} — 稽古（チュートリアル）`,
  description: '6 ステップのガイド付きで React の再 render 挙動を順番に観察するチュートリアル。',
  alternates: { canonical: `${LAB_RERENDER_MAP_META.path}/tutorial` },
  openGraph: {
    title: `${LAB_RERENDER_MAP_META.shortTitle} 稽古 | ${SITE.name}`,
    description: 'React 再 render の地図を木で歩く。',
    url: `${SITE.url}${LAB_RERENDER_MAP_META.path}/tutorial`,
  },
}

const JSON_LD = buildTechArticle({
  title: `${LAB_RERENDER_MAP_META.shortTitle} 稽古`,
  description: '6 ステップのガイド付きで React の再 render 挙動を順番に観察するチュートリアル。',
  path: `${LAB_RERENDER_MAP_META.path}/tutorial`,
  datePublished: '2026-04-19',
  keywords: ['チュートリアル', 'React', 'memo', '再 render'],
})

export default function LabRerenderMapTutorialPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <JsonLd data={JSON_LD} />
      <Suspense fallback={null}>
        <TutorialMode />
      </Suspense>
    </div>
  )
}
