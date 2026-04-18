import type { Metadata } from 'next'
import Link from 'next/link'
import { LABS, type LabStatus } from '@/features/labs'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: '修行ロードマップ',
  description:
    'フロントエンド道場の Phase 構成と今後追加予定の Lab 一覧。',
  alternates: { canonical: '/roadmap' },
}

const PHASES: readonly {
  status: LabStatus
  title: string
  subtitle: string
}[] = [
  { status: 'published', title: 'Phase 1 / 公開中', subtitle: 'レンダリングパイプラインを中心にした初回公開版' },
  { status: 'phase-2', title: 'Phase 2', subtitle: 'メモリリークの稽古場を追加' },
  { status: 'phase-3', title: 'Phase 3', subtitle: 'スクロールジャンクの稽古場を追加' },
  { status: 'formal', title: '正式版以降', subtitle: 'React 再レンダー、Canvas/WebGL、イベントループ' },
]

export default function RoadmapPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 md:px-8 md:py-16">
      <header className="mb-10">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          修行ロードマップ
        </h1>
        <p className="mt-3 text-muted-foreground">
          フェーズごとに Lab を追加していきます。
          「こんな稽古場が欲しい」という意見は
          <a
            href={SITE.feedbackForm}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-primary underline-offset-2 hover:underline"
          >
            フィードバックフォーム
          </a>
          へ。
        </p>
      </header>

      <div className="space-y-10">
        {PHASES.map((phase) => {
          const labs = LABS.filter((lab) => lab.status === phase.status)
          return (
            <section key={phase.status} aria-labelledby={`phase-${phase.status}`}>
              <h2
                id={`phase-${phase.status}`}
                className="mb-1 font-heading text-xl font-semibold tracking-tight"
              >
                {phase.title}
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">{phase.subtitle}</p>
              <ul className="grid gap-3 md:grid-cols-2">
                {labs.map((lab) => (
                  <li
                    key={lab.id}
                    className="rounded-lg border border-border bg-card p-5"
                  >
                    <div className="font-heading text-base">
                      {phase.status === 'published' ? (
                        <Link
                          href={lab.path}
                          className="hover:text-primary transition-colors"
                        >
                          {lab.shortTitle}
                        </Link>
                      ) : (
                        lab.shortTitle
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {lab.description}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
