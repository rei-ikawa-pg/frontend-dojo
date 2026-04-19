/**
 * Lab 2 概要ページ (/lab/memory-leak)。
 * Lab 1 と同じ「概要 + 2 モード CTA + overview MDX」の構造。
 */

import { ArrowRight, BookOpen, Compass } from '@phosphor-icons/react/dist/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/seo/JsonLd'
import { Prose } from '@/components/typography/Prose'
import { LAB_MEMORY_LEAK_META } from '@/features/lab-memory-leak'
import OverviewContent from '@/features/lab-memory-leak/content/overview.mdx'
import { buildTechArticle } from '@/lib/seo'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: LAB_MEMORY_LEAK_META.title,
  description: LAB_MEMORY_LEAK_META.description,
  alternates: { canonical: LAB_MEMORY_LEAK_META.path },
  openGraph: {
    title: `${LAB_MEMORY_LEAK_META.title} | ${SITE.name}`,
    description: LAB_MEMORY_LEAK_META.description,
    url: `${SITE.url}${LAB_MEMORY_LEAK_META.path}`,
  },
}

const JSON_LD = buildTechArticle({
  title: LAB_MEMORY_LEAK_META.title,
  description: LAB_MEMORY_LEAK_META.description,
  path: LAB_MEMORY_LEAK_META.path,
  datePublished: '2026-04-19',
  keywords: [
    'メモリリーク',
    'performance.memory',
    'setInterval',
    'AbortController',
    'Detached DOM',
    'Closure',
    'WeakRef',
  ],
})

export default function LabMemoryLeakOverviewPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <JsonLd data={JSON_LD} />
      <header className="mb-10">
        <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-ink-400">§ 02 — Lab</p>
        <h1 className="font-mincho text-3xl leading-tight tracking-tight text-ink-900 md:text-5xl">
          {LAB_MEMORY_LEAK_META.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-ink-500 leading-relaxed">
          SPA で避けて通れない 4 種類のメモリリーク (Timer / Listener / Detached DOM / Closure) を
          意図的に再現し、`performance.memory` の階段状の増加で観察します。
          対策の切替で「直したときに本当に直るか」も手元で確認できる稽古場です。
        </p>
      </header>

      <section aria-label="モード選択" className="mb-16 grid gap-5 md:grid-cols-2">
        <ModeCta
          href={`${LAB_MEMORY_LEAK_META.path}/tutorial`}
          kanji="稽"
          label="稽古"
          subtitle="Tutorial"
          description="5 ステップのガイド付き。リーク 1 種類ずつ作って直す。初見ならこちらから。"
          icon={<BookOpen size={20} weight="duotone" />}
          primary
        />
        <ModeCta
          href={`${LAB_MEMORY_LEAK_META.path}/playground`}
          kanji="道"
          label="道場"
          subtitle="Playground"
          description="リーク種別・対策・保持サイズ・サイクル数を自由に組み合わせて実験できます。"
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

type ModeCtaProps = {
  href: string
  kanji: string
  label: string
  subtitle: string
  description: string
  icon: React.ReactNode
  primary?: boolean
}

function ModeCta({ href, kanji, label, subtitle, description, icon, primary }: ModeCtaProps) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col gap-5 overflow-hidden border p-8 transition-colors ${
        primary
          ? 'border-vermilion/50 bg-vermilion/5 hover:bg-vermilion/10'
          : 'border-rule-dim bg-card hover:border-ink-500'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className={`flex h-14 w-14 items-center justify-center border font-mincho text-3xl leading-none ${
              primary ? 'border-vermilion/60 text-vermilion' : 'border-rule-normal text-ink-900'
            }`}
          >
            {kanji}
          </span>
          <div>
            <div
              className={`font-mincho text-xl leading-none ${primary ? 'text-vermilion' : 'text-ink-900'}`}
            >
              {label}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-ink-400">
              {subtitle}
            </div>
          </div>
        </div>
        <div
          className={`${primary ? 'text-vermilion' : 'text-ink-500'} transition-transform group-hover:translate-x-1`}
        >
          {icon}
        </div>
      </div>
      <p className="text-sm leading-relaxed text-ink-500">{description}</p>
      <span
        className={`mt-auto inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] ${
          primary ? 'text-vermilion' : 'text-ink-500 group-hover:text-ink-900'
        }`}
      >
        開く
        <ArrowRight
          size={12}
          weight="bold"
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
    </Link>
  )
}
