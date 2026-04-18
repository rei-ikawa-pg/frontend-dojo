/**
 * 稽古場一覧 (/labs)。
 * - 公開中 / 近日公開 の 2 カテゴリに分けて表示（公開予定の細分化は内部管理用で、UI には出さない）
 * - ランディングの CatalogSection がハイライトなのに対し、こちらは全件を密に並べる一覧
 * - デザインはサイト共通の計測器トーン（ink-* / rule-dim / vermilion / font-mincho）
 */

import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionMarker } from '@/components/instrument/SectionMarker'
import { LABS, type LabMeta, type LabStatus } from '@/features/labs'
import { LAB_STATUS_LABEL } from '@/features/labs-status-labels'
import { cn } from '@/lib/utils'
import { toKanjiNum } from '@/lib/utils/kanjiNum'

export const metadata: Metadata = {
  title: '稽古場一覧',
  description:
    'フロントエンド道場で公開中・公開予定の Lab 一覧。レンダリングパイプライン、メモリリーク、スクロールジャンク、React 再レンダー、Canvas/WebGL、イベントループ。',
  alternates: { canonical: '/labs' },
}

/**
 * カテゴリ表示の順序と見出し。将来 Lab 追加時も配列を変えるだけで済むように分離。
 * UI は「公開中 / 近日公開」の 2 カテゴリ固定。LabStatus の細分化 (phase-2 / phase-3 / formal)
 * は内部管理用に残し、公開予定はすべて同じ COMING SOON 群に集約する。
 */
const GROUPS: ReadonlyArray<{
  statuses: ReadonlyArray<LabStatus>
  index: number
  label: string
  caption: string
}> = [
  { statuses: ['published'], index: 1, label: 'PUBLISHED', caption: '公開中' },
  {
    statuses: ['phase-2', 'phase-3', 'formal'],
    index: 2,
    label: 'COMING SOON',
    caption: '近日公開',
  },
]

export default function LabsPage() {
  const totalCount = LABS.length
  const publishedCount = LABS.filter((l) => l.status === 'published').length

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-20 md:py-24">
      <header className="mb-14 flex flex-col gap-8 border-b border-rule-dim pb-12">
        <SectionMarker index={1} label="CATALOG" caption="稽古場一覧" />
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h1 className="font-mincho text-4xl leading-tight tracking-tight text-ink-900 md:text-6xl">
            全 <span className="tnum text-vermilion">{String(totalCount).padStart(2, '0')}</span>{' '}
            稽古場。
          </h1>
          <div className="flex max-w-md flex-col gap-3">
            <p className="text-sm leading-relaxed text-ink-500">
              フロントエンドの鬼門ごとに用意した稽古場の目次です。
              公開済みのものから順に触ってみてください。
            </p>
            <p className="text-[11px] leading-relaxed text-ink-400">
              難易度は <span className="font-mincho text-ink-500">初段</span>(入口) →{' '}
              <span className="font-mincho text-ink-500">二段</span>(標準) →{' '}
              <span className="font-mincho text-ink-500">三段</span>(応用) の順で上がります。
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-0 border-t border-rule-dim pt-6 text-[11px] uppercase tracking-[0.2em] text-ink-400">
          <div className="flex flex-col gap-1 border-r border-rule-dim pr-4">
            <dt>Total</dt>
            <dd className="tnum text-2xl font-medium text-ink-900">
              {String(totalCount).padStart(2, '0')}
              <span className="text-sm text-ink-400"> / {String(totalCount).padStart(2, '0')}</span>
            </dd>
          </div>
          <div className="flex flex-col gap-1 border-r border-rule-dim px-4">
            <dt>Published</dt>
            <dd className="tnum text-2xl font-medium text-ink-900">
              {String(publishedCount).padStart(2, '0')}
              <span className="text-sm text-ink-400"> / {String(totalCount).padStart(2, '0')}</span>
            </dd>
          </div>
          <div className="flex flex-col gap-1 px-4">
            <dt>Language</dt>
            <dd className="font-mincho text-2xl font-medium text-ink-900">日本語</dd>
          </div>
        </dl>
      </header>

      <div className="flex flex-col gap-20">
        {GROUPS.map((group) => {
          const items = LABS.filter((l) => group.statuses.includes(l.status))
          if (items.length === 0) return null
          return (
            <LabGroup
              key={group.label}
              index={group.index}
              label={group.label}
              caption={group.caption}
              items={items}
            />
          )
        })}
      </div>
    </div>
  )
}

type LabGroupProps = {
  index: number
  label: string
  caption: string
  items: ReadonlyArray<LabMeta>
}

function LabGroup({ index, label, caption, items }: LabGroupProps) {
  return (
    <section aria-labelledby={`group-${label}`}>
      <SectionMarker index={index} label={label} caption={caption} className="mb-6" />
      <h2 id={`group-${label}`} className="sr-only">
        {caption}
      </h2>
      <ol className="flex flex-col border-t border-rule-dim">
        {items.map((lab) => (
          <LabRow key={lab.id} lab={lab} />
        ))}
      </ol>
    </section>
  )
}

function LabRow({ lab }: { lab: LabMeta }) {
  const isPublished = lab.status === 'published'
  const kanji = toKanjiNum(lab.order)
  const paddedNum = String(lab.order).padStart(2, '0')
  const statusLabel = LAB_STATUS_LABEL[lab.status]

  const inner = (
    <div
      className={cn(
        'relative grid grid-cols-[auto_1fr] items-center gap-6 py-8 transition-colors md:grid-cols-[120px_1fr_auto_auto] md:gap-10 md:py-10',
        isPublished ? 'hover:bg-ink-050/40' : 'opacity-60',
      )}
    >
      <div className="flex flex-col items-center gap-1 border-r border-rule-dim pr-6 md:pr-0">
        <span aria-hidden className="font-mincho text-5xl leading-none text-ink-900 md:text-6xl">
          {kanji}
        </span>
        <span className="tnum text-[11px] uppercase tracking-[0.24em] text-ink-300">
          LAB {paddedNum}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-mincho text-2xl leading-tight text-ink-900 md:text-3xl">
            {lab.title}
          </h3>
          <span className="inline-flex shrink-0 items-center border border-rule-dim bg-ink-000 px-2 py-0.5 font-mincho text-xs text-ink-500">
            {lab.difficulty}
          </span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-500">{lab.description}</p>
      </div>

      <div className="hidden md:block">
        <span
          className={cn(
            'inline-flex items-center gap-2 border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em]',
            isPublished
              ? 'border-vermilion/60 bg-vermilion/10 text-vermilion'
              : 'border-rule-dim bg-ink-000 text-ink-400',
          )}
        >
          <span
            className={cn(
              'inline-block h-1.5 w-1.5',
              isPublished ? 'animate-pulse bg-vermilion' : 'bg-ink-400',
            )}
          />
          {statusLabel}
        </span>
      </div>

      <div className="hidden md:flex">
        {isPublished ? (
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-ink-900 transition-transform group-hover:translate-x-1">
            <span className="tnum text-vermilion">RUN</span>
            <ArrowRight size={14} weight="bold" className="text-vermilion" />
          </span>
        ) : (
          <span className="text-[11px] uppercase tracking-[0.22em] text-ink-300">—</span>
        )}
      </div>

      <div className="col-span-2 mt-2 md:hidden">
        <span
          className={cn(
            'inline-flex items-center gap-2 border px-2 py-1 text-[11px] uppercase tracking-[0.18em]',
            isPublished ? 'border-vermilion/60 text-vermilion' : 'border-rule-dim text-ink-400',
          )}
        >
          <span
            className={cn('inline-block h-1.5 w-1.5', isPublished ? 'bg-vermilion' : 'bg-ink-400')}
          />
          {statusLabel}
        </span>
      </div>
    </div>
  )

  return (
    <li className="group border-b border-rule-dim">
      {isPublished ? (
        <Link href={lab.path} className="block" aria-label={`${lab.shortTitle} — 公開中`}>
          {inner}
        </Link>
      ) : (
        <div aria-disabled>{inner}</div>
      )}
    </li>
  )
}
