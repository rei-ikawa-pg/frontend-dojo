/**
 * Lab 1 自由操作モード (/lab/render/playground)。
 * - レイアウトは SSG、インタラクションはクライアント
 */

import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { LAB_RENDER_META } from '@/features/lab-render'
import { PlaygroundMode } from '@/features/lab-render/components/PlaygroundMode'
import { buildTechArticle } from '@/lib/seo'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `${LAB_RENDER_META.shortTitle} — 道場（自由操作）`,
  description:
    '要素数と CSS プロパティを自由に組み合わせ、Layout / Paint / Composite の実測値と理論値を並べて確認できる自由操作モード。',
  alternates: { canonical: `${LAB_RENDER_META.path}/playground` },
  openGraph: {
    title: `${LAB_RENDER_META.shortTitle} 道場 | ${SITE.name}`,
    description: 'CSS プロパティとフレーム内訳を自由に実験できる稽古場。',
    url: `${SITE.url}${LAB_RENDER_META.path}/playground`,
  },
}

const JSON_LD = buildTechArticle({
  title: `${LAB_RENDER_META.shortTitle} 道場`,
  description:
    '要素数と CSS プロパティを自由に組み合わせ、Layout / Paint / Composite の実測値と理論値を並べて確認できる自由操作モード。',
  path: `${LAB_RENDER_META.path}/playground`,
  datePublished: '2026-04-18',
  keywords: ['Playground', 'レンダリングパイプライン', 'FPS', 'LoAF'],
})

export default function LabRenderPlaygroundPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <JsonLd data={JSON_LD} />
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-ink-400">§ Playground</p>
        <h1 className="mt-2 font-mincho text-3xl tracking-tight text-ink-900 md:text-4xl">
          道場 — 自由操作
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-500 leading-relaxed">
          要素数と CSS プロパティを自由に組み合わせ、LoAF API で計測されたフレーム内訳を観察します。
          実行ボタンを押すまでアニメーションは止まっています（低スペック端末保護）。
        </p>
      </header>
      <PlaygroundMode />
    </div>
  )
}
