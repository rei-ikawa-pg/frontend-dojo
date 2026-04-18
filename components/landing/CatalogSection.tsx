import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { SectionMarker } from '@/components/instrument/SectionMarker'
import { LABS } from '@/features/labs'
import { LAB_STATUS_LABEL } from '@/features/labs-status-labels'
import { toKanjiNum } from '@/lib/utils/kanjiNum'

export function CatalogSection() {
  return (
    <section id="catalog" aria-labelledby="catalog-heading" className="border-b border-rule-dim">
      <div className="mx-auto w-full max-w-7xl px-5 py-24 md:px-20 md:py-32">
        <SectionMarker index={4} label="CATALOG" caption="稽古場一覧" className="mb-10 md:mb-14" />

        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2
            id="catalog-heading"
            className="font-mincho text-3xl leading-tight tracking-tight text-ink-900 md:text-5xl"
          >
            全 <span className="tnum text-vermilion">06</span> 稽古場。
          </h2>
          <Link
            href="/labs"
            className="inline-flex items-center gap-3 border-b border-rule-normal pb-1 text-[11px] uppercase tracking-[0.2em] text-ink-400 transition-colors hover:border-ink-500 hover:text-ink-900"
          >
            全リストを見る
            <ArrowRight size={12} weight="bold" />
          </Link>
        </div>

        <ol className="flex flex-col border-t border-rule-dim">
          {LABS.map((lab) => {
            const isPublished = lab.status === 'published'
            const kanji = toKanjiNum(lab.order)
            const paddedNum = String(lab.order).padStart(2, '0')
            const statusLabel = LAB_STATUS_LABEL[lab.status]

            const Inner = (
              <div
                className={`relative grid grid-cols-[auto_1fr_auto] items-center gap-6 px-0 py-8 transition-colors md:grid-cols-[100px_1fr_auto_auto] md:gap-10 md:py-10 ${
                  isPublished ? 'hover:bg-ink-050/40' : 'opacity-60'
                }`}
              >
                {/* 番号ブロック */}
                <div className="flex flex-col items-center gap-1 border-r border-rule-dim pr-6 md:pr-0">
                  <span
                    aria-hidden
                    className="font-mincho text-5xl leading-none text-ink-900 md:text-6xl"
                  >
                    {kanji}
                  </span>
                  <span className="tnum text-[11px] uppercase tracking-[0.24em] text-ink-300">
                    LAB {paddedNum}
                  </span>
                </div>

                {/* タイトルと説明 */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-mincho text-2xl leading-tight text-ink-900 md:text-3xl">
                      {lab.title}
                    </h3>
                    <span className="inline-flex shrink-0 items-center border border-rule-dim bg-ink-000 px-2 py-0.5 font-mincho text-xs text-ink-500">
                      {lab.difficulty}
                    </span>
                  </div>
                  <p className="max-w-2xl text-sm leading-relaxed text-ink-500">
                    {lab.description}
                  </p>
                </div>

                {/* ステータス（公開中／予定） */}
                <div className="hidden md:block">
                  <span
                    className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] ${
                      isPublished
                        ? 'border-vermilion/60 bg-vermilion/10 text-vermilion'
                        : 'border-rule-dim bg-ink-000 text-ink-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-1.5 w-1.5 ${
                        isPublished ? 'animate-pulse bg-vermilion' : 'bg-ink-400'
                      }`}
                    />
                    {statusLabel}
                  </span>
                </div>

                {/* CTA（公開中のみ）*/}
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
                {/* モバイル時のステータス表示 */}
                <div className="col-span-3 mt-2 md:hidden">
                  <span
                    className={`inline-flex items-center gap-2 border px-2 py-1 text-[11px] uppercase tracking-[0.18em] ${
                      isPublished
                        ? 'border-vermilion/60 text-vermilion'
                        : 'border-rule-dim text-ink-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-1.5 w-1.5 ${
                        isPublished ? 'bg-vermilion' : 'bg-ink-400'
                      }`}
                    />
                    {statusLabel}
                  </span>
                </div>
              </div>
            )

            return (
              <li key={lab.id} className="group border-b border-rule-dim">
                {isPublished ? (
                  <Link href={lab.path} className="block" aria-label={`${lab.title} (公開中)`}>
                    {Inner}
                  </Link>
                ) : (
                  <div>{Inner}</div>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
