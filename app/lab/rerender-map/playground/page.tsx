/**
 * Lab 3 自由操作モード (/lab/rerender-map/playground)。
 */

import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { LAB_RERENDER_MAP_META } from '@/features/lab-rerender-map'
import { PlaygroundMode } from '@/features/lab-rerender-map/components/PlaygroundMode'
import { buildTechArticle } from '@/lib/seo'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `${LAB_RERENDER_MAP_META.shortTitle} — 道場（自由操作）`,
  description:
    'コンポーネントツリーの深さ・fanout・memo・prop 種別・state source を自由に組み合わせ、再 render の伝播を実時間で観察できる自由操作モード。',
  alternates: { canonical: `${LAB_RERENDER_MAP_META.path}/playground` },
  openGraph: {
    title: `${LAB_RERENDER_MAP_META.shortTitle} 道場 | ${SITE.name}`,
    description: 'React 再 render を自由に組み合わせて実験する稽古場。',
    url: `${SITE.url}${LAB_RERENDER_MAP_META.path}/playground`,
  },
}

const JSON_LD = buildTechArticle({
  title: `${LAB_RERENDER_MAP_META.shortTitle} 道場`,
  description: 'React 再 render を自由に組み合わせて実験する自由操作モード。',
  path: `${LAB_RERENDER_MAP_META.path}/playground`,
  datePublished: '2026-04-19',
  keywords: ['Playground', 'React', 'memo', 'Context', 'Zustand'],
})

export default function LabRerenderMapPlaygroundPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <JsonLd data={JSON_LD} />
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-ink-400">§ Playground</p>
        <h1 className="mt-2 font-mincho text-3xl tracking-tight text-ink-900 md:text-4xl">
          道場 — 自由操作
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-500 leading-relaxed">
          木の深さ・fanout・memo・prop 種別・state source を自由に組み合わせて、 「state
          を更新」ボタンでどこが光るかを観察します。
        </p>
      </header>
      <PlaygroundMode />
    </div>
  )
}
