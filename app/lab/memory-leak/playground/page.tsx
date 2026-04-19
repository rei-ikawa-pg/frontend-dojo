/**
 * Lab 2 自由操作モード (/lab/memory-leak/playground)。
 */

import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { LAB_MEMORY_LEAK_META } from '@/features/lab-memory-leak'
import { PlaygroundMode } from '@/features/lab-memory-leak/components/PlaygroundMode'
import { buildTechArticle } from '@/lib/seo'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `${LAB_MEMORY_LEAK_META.shortTitle} — 道場（自由操作）`,
  description:
    'リーク種別・対策・保持サイズ・サイクル数を自由に組み合わせ、performance.memory の推移で結果を確認できる自由操作モード。',
  alternates: { canonical: `${LAB_MEMORY_LEAK_META.path}/playground` },
  openGraph: {
    title: `${LAB_MEMORY_LEAK_META.shortTitle} 道場 | ${SITE.name}`,
    description: 'メモリリークを自由に作り・直せる稽古場。',
    url: `${SITE.url}${LAB_MEMORY_LEAK_META.path}/playground`,
  },
}

const JSON_LD = buildTechArticle({
  title: `${LAB_MEMORY_LEAK_META.shortTitle} 道場`,
  description: 'メモリリークを自由に組み合わせて実験できる自由操作モード。',
  path: `${LAB_MEMORY_LEAK_META.path}/playground`,
  datePublished: '2026-04-19',
  keywords: ['Playground', 'メモリリーク', 'heap', 'WeakRef'],
})

export default function LabMemoryLeakPlaygroundPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <JsonLd data={JSON_LD} />
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-ink-400">§ Playground</p>
        <h1 className="mt-2 font-mincho text-3xl tracking-tight text-ink-900 md:text-4xl">
          道場 — 自由操作
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-500 leading-relaxed">
          リーク種別・対策・保持サイズ・サイクル数を自由に組み合わせて `performance.memory`
          の推移を観察します。 「1 サイクル実行」で手動 1 回、「自動実行」で 1
          秒間隔で連続サイクルを回せます。
        </p>
      </header>
      <PlaygroundMode />
    </div>
  )
}
