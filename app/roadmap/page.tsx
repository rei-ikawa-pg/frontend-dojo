import type { Metadata } from 'next'
import Link from 'next/link'
import { LABS } from '@/features/labs'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: '修行ロードマップ',
  description: 'フロントエンド道場で公開中の Lab と、今後追加予定の Lab 一覧。',
  alternates: { canonical: '/roadmap' },
}

const GROUPS = [
  {
    id: 'published',
    title: '公開中',
    subtitle: 'いま触れる稽古場',
    filter: (status: string) => status === 'published',
  },
  {
    id: 'upcoming',
    title: '近日公開',
    subtitle: '順次追加していきます',
    filter: (status: string) => status !== 'published',
  },
] as const

export default function RoadmapPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 md:px-8 md:py-16">
      <header className="mb-10">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          修行ロードマップ
        </h1>
        <p className="mt-3 text-muted-foreground">
          稽古場は順次追加していきます。 「こんな稽古場が欲しい」という意見は
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
        {GROUPS.map((group) => {
          const labs = LABS.filter((lab) => group.filter(lab.status))
          if (labs.length === 0) return null

          return (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <h2
                id={`group-${group.id}`}
                className="mb-1 font-heading text-xl font-semibold tracking-tight"
              >
                {group.title}
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">{group.subtitle}</p>
              <ul className="grid gap-3 md:grid-cols-2">
                {labs.map((lab) => {
                  const isPublished = lab.status === 'published'
                  return (
                    <li key={lab.id} className="rounded-lg border border-border bg-card p-5">
                      <div className="font-heading text-base">
                        {isPublished ? (
                          <Link href={lab.path} className="hover:text-primary transition-colors">
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
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
