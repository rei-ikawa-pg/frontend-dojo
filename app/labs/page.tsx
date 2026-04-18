import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { LABS } from '@/features/labs'
import { LAB_STATUS_LABEL } from '@/features/labs-status-labels'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: '稽古場一覧',
  description:
    'フロントエンド道場で公開中・予定の Lab 一覧。レンダリングパイプライン、メモリリーク、スクロールジャンクなど。',
  alternates: { canonical: '/labs' },
}

export default function LabsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8 md:py-16">
      <header className="mb-10">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          稽古場一覧
        </h1>
        <p className="mt-3 text-muted-foreground">
          フロントエンドの鬼門ごとに用意した Lab。公開済みのものから順に触ってみてください。
        </p>
      </header>

      <ul className="grid gap-4 md:grid-cols-2">
        {LABS.map((lab) => {
          const isPublished = lab.status === 'published'
          const content = (
            <article
              className={cn(
                'flex h-full flex-col gap-3 rounded-xl border p-6 transition-colors',
                isPublished
                  ? 'border-border bg-card group-hover:border-primary group-hover:bg-accent/30'
                  : 'border-dashed border-border bg-card/40 opacity-75',
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-heading text-lg font-medium">{lab.shortTitle}</h2>
                <span
                  className={cn(
                    'shrink-0 text-xs font-medium',
                    isPublished ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {LAB_STATUS_LABEL[lab.status]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{lab.description}</p>
              {isPublished && (
                <span className="mt-2 inline-flex items-center gap-1 text-sm text-primary">
                  開く
                  <ArrowRight size={14} weight="bold" />
                </span>
              )}
            </article>
          )

          return (
            <li key={lab.id}>
              {isPublished ? (
                <Link href={lab.path} className="group block h-full">
                  {content}
                </Link>
              ) : (
                <div aria-disabled className="block h-full cursor-not-allowed">
                  {content}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
