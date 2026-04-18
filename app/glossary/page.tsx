/**
 * 用語集 (/glossary)。
 * - Term コンポーネントからの「詳しく見る」の着地点
 * - 各エントリに anchor (#id) を付与
 * - SSG
 */

import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { GLOSSARY_ORDER, getGlossary } from '@/lib/glossary'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: '用語集',
  description:
    'フロントエンド道場で使う技術用語の一覧。レンダリングパイプライン、LoAF、Core Web Vitals など。',
  alternates: { canonical: '/glossary' },
  openGraph: {
    title: `用語集 | ${SITE.name}`,
    description: 'レンダリングパイプラインや計測 API の用語定義。',
    url: `${SITE.url}/glossary`,
  },
}

export default function GlossaryPage() {
  const entries = GLOSSARY_ORDER.map((id) => getGlossary(id)).filter((e) => e !== null)

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12 md:px-8 md:py-16">
      <header className="mb-12">
        <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-ink-400">§ Glossary</p>
        <h1 className="font-mincho text-3xl tracking-tight text-ink-900 md:text-4xl">用語集</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500">
          フロントエンド道場で使われる語の一覧です。各 Lab の解説文にも同じ用語が登場し、
          下線付きの語にカーソルを合わせると短い定義が出ます。ここはその詳しい版です。
        </p>
      </header>

      <nav aria-label="頭出し" className="mb-10 flex flex-wrap gap-2">
        {entries.map((entry) => (
          <a
            key={entry.id}
            href={`#${entry.id}`}
            className="border border-rule-dim px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-ink-500 transition-colors hover:border-vermilion hover:text-vermilion"
          >
            {entry.term}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-10">
        {entries.map((entry) => (
          <article
            key={entry.id}
            id={entry.id}
            className="scroll-mt-24 border-t border-rule-dim pt-6"
          >
            <header className="flex items-baseline justify-between gap-3">
              <h2 className="font-mincho text-xl tracking-tight text-ink-900 md:text-2xl">
                {entry.term}
              </h2>
              {entry.reading && (
                <span className="text-[10px] uppercase tracking-[0.22em] text-ink-400">
                  {entry.reading}
                </span>
              )}
            </header>
            <p className="mt-3 text-sm leading-relaxed text-ink-500 md:text-base">{entry.long}</p>
            {entry.see && entry.see.length > 0 && (
              <footer className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-ink-400">
                <span className="uppercase tracking-[0.18em]">関連:</span>
                {entry.see.map((ref) => (
                  <Link
                    key={ref}
                    href={`#${ref}`}
                    className="inline-flex items-center gap-1 border border-rule-dim px-2 py-1 transition-colors hover:border-vermilion hover:text-vermilion"
                  >
                    {getGlossary(ref)?.term ?? ref}
                    <ArrowUpRight size={10} weight="bold" />
                  </Link>
                ))}
              </footer>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
