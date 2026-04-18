/**
 * Lab 1 チュートリアルモード (/lab/render/tutorial)。
 * - レイアウト部分は SSG、step 状態は nuqs で URL 同期
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LAB_RENDER_META } from '@/features/lab-render'
import { TutorialMode } from '@/features/lab-render/components/TutorialMode'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `${LAB_RENDER_META.shortTitle} — 稽古（チュートリアル）`,
  description:
    '8 ステップのガイド付きで Layout / Paint / Composite を順番に観察するチュートリアル。',
  alternates: { canonical: `${LAB_RENDER_META.path}/tutorial` },
  openGraph: {
    title: `${LAB_RENDER_META.shortTitle} 稽古 | ${SITE.name}`,
    description: 'ガイド付きのレンダリングパイプライン稽古。',
    url: `${SITE.url}${LAB_RENDER_META.path}/tutorial`,
  },
}

export default function LabRenderTutorialPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <Suspense fallback={null}>
        <TutorialMode />
      </Suspense>
    </div>
  )
}
