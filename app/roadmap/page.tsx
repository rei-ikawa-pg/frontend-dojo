import type { Metadata } from 'next'
import Link from 'next/link'
import { DOMAIN_LABEL, DOMAIN_ORDER, LAB_CANDIDATES } from '@/features/lab-candidates'
import { LABS } from '@/features/labs'

export const metadata: Metadata = {
  title: '修行ロードマップ',
  description:
    'フロントエンド道場の全景。公開中の稽古場、近日公開の稽古場、そして Lab 化を検討している鬼門の一覧。',
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
          <Link href="/contact" className="ml-1 text-primary underline-offset-2 hover:underline">
            お問い合わせフォーム
          </Link>
          へ。
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          難易度は <span className="font-heading">初段</span>(入口) →{' '}
          <span className="font-heading">二段</span>(標準) →{' '}
          <span className="font-heading">三段</span>(応用) の順で上がります。
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
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-heading text-base">
                          {isPublished ? (
                            <Link href={lab.path} className="hover:text-primary transition-colors">
                              {lab.shortTitle}
                            </Link>
                          ) : (
                            lab.shortTitle
                          )}
                        </div>
                        <span className="shrink-0 rounded border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {lab.difficulty}
                        </span>
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

        {/* 検討中の鬼門: Lab 化構想段階のトピックを分野別に提示する。データは features/lab-candidates.ts */}
        <section aria-labelledby="group-candidates">
          <h2
            id="group-candidates"
            className="mb-1 font-heading text-xl font-semibold tracking-tight"
          >
            検討中の鬼門
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Lab 化を構想している鬼門。順次、稽古場として整えていきます。
          </p>
          <div className="space-y-6">
            {DOMAIN_ORDER.map((domain) => {
              const items = LAB_CANDIDATES.filter((c) => c.domain === domain)
              if (items.length === 0) return null
              return (
                <div key={domain}>
                  <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {DOMAIN_LABEL[domain]}
                  </h3>
                  <ul className="grid gap-3 md:grid-cols-2">
                    {items.map((candidate) => (
                      <li
                        key={candidate.id}
                        className="rounded-lg border border-dashed border-border/70 bg-card/50 p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-heading text-sm">{candidate.title}</div>
                          <span className="shrink-0 rounded border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {candidate.difficulty}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                          {candidate.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
