/**
 * Lab 3 概要ページ (/lab/rerender-map)。
 */

import { BookOpen, Compass } from '@phosphor-icons/react/dist/ssr'
import type { Metadata } from 'next'
import { ModeCta } from '@/components/lab/ModeCta'
import { JsonLd } from '@/components/seo/JsonLd'
import { Prose } from '@/components/typography/Prose'
import { LAB_RERENDER_MAP_META } from '@/features/lab-rerender-map'
import OverviewContent from '@/features/lab-rerender-map/content/overview.mdx'
import { buildTechArticle } from '@/lib/seo'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: LAB_RERENDER_MAP_META.title,
  description: LAB_RERENDER_MAP_META.description,
  alternates: { canonical: LAB_RERENDER_MAP_META.path },
  openGraph: {
    title: `${LAB_RERENDER_MAP_META.title} | ${SITE.name}`,
    description: LAB_RERENDER_MAP_META.description,
    url: `${SITE.url}${LAB_RERENDER_MAP_META.path}`,
  },
}

const JSON_LD = buildTechArticle({
  title: LAB_RERENDER_MAP_META.title,
  description: LAB_RERENDER_MAP_META.description,
  path: LAB_RERENDER_MAP_META.path,
  datePublished: '2026-04-19',
  keywords: ['React', '再レンダリング', 'memo', 'Context', 'Zustand', '派生 state'],
})

export default function LabRerenderMapOverviewPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <JsonLd data={JSON_LD} />
      <header className="mb-10">
        <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-ink-400">§ 03 — Lab</p>
        <h1 className="font-mincho text-3xl leading-tight tracking-tight text-ink-900 md:text-5xl">
          {LAB_RERENDER_MAP_META.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-ink-500 leading-relaxed">
          React の再 render がコンポーネントツリーをどう伝播するかを「光る木」で可視化します。 memo
          を付けたのに止まらない、Context で全部再 render されて驚く、派生 state で
          ループを作ってしまう — こうした中級者の鬼門を、手元で触って確かめる稽古場です。
        </p>
      </header>

      <section aria-label="モード選択" className="mb-16 grid gap-5 md:grid-cols-2">
        <ModeCta
          href={`${LAB_RERENDER_MAP_META.path}/tutorial`}
          kanji="稽"
          label="稽古"
          subtitle="Tutorial"
          description="6 ステップのガイド付き。伝播 → memo → object prop → Context → 派生 state → commit の順に進みます。"
          icon={<BookOpen size={20} weight="duotone" />}
          primary
        />
        <ModeCta
          href={`${LAB_RERENDER_MAP_META.path}/playground`}
          kanji="道"
          label="道場"
          subtitle="Playground"
          description="深さ・fanout・memo・prop 種別・state source を自由に組み合わせて試せる実験場。"
          icon={<Compass size={20} weight="duotone" />}
        />
      </section>

      <section className="border-t border-rule-dim pt-12">
        <Prose className="mx-auto">
          <OverviewContent />
        </Prose>
      </section>
    </div>
  )
}
