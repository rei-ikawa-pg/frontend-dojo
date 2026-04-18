import { ArrowRight, Code, Eye, Lightning } from '@phosphor-icons/react/dist/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LAB_RENDER_META } from '@/features/lab-render'
import { LABS } from '@/features/labs'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: {
    absolute: `${SITE.name} — ${SITE.tagline}`,
  },
  description: SITE.description,
  alternates: { canonical: '/' },
}

const PILLARS = [
  {
    icon: Eye,
    title: '読むのではなく触る',
    body: '解説を読むだけでは掴みにくい「フレーム内で何が起きているか」を、実際に DOM を操作して可視化します。',
  },
  {
    icon: Lightning,
    title: '観測と判定のハイブリッド',
    body: 'LoAF API でフレーム時間を実測し、CSS Triggers データで理論上の影響を並置します。',
  },
  {
    icon: Code,
    title: 'DevTools への入口',
    body: 'サイト内で概念を掴んだら、実際の Performance パネルでどう見えるかまで地続きで案内します。',
  },
] as const

export default function Home() {
  const upcomingLabs = LABS.filter((lab) => lab.status !== 'published').slice(0, 3)

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-20 md:px-8 md:py-28">
          <div className="flex flex-col gap-6 max-w-3xl">
            <p className="text-sm font-medium tracking-wider text-primary uppercase">
              Frontend Dojo — Phase 1 MVP
            </p>
            <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              フロントエンドの鬼門を、
              <br />
              読むのではなく
              <span className="text-primary">触って</span>
              理解する。
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              日本語のインタラクティブラボ。レンダリング、メモリ、スクロール、再レンダー —
              中級フロントエンドがぶつかる鬼門を、実際に動かしながら身につける場所です。
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={`${LAB_RENDER_META.path}/tutorial`}>
                Lab 1 を試す
                <ArrowRight size={18} weight="bold" className="ml-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/labs">稽古場一覧を見る</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8">
          <h2 className="mb-8 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            この道場で学べること
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {PILLARS.map((pillar) => (
              <article
                key={pillar.title}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6"
              >
                <pillar.icon size={24} weight="duotone" className="text-primary" />
                <h3 className="font-heading text-lg font-medium">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8">
          <div className="mb-8 flex flex-col items-start gap-2 md:flex-row md:items-end md:justify-between">
            <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              公開中の Lab
            </h2>
            <Link
              href="/labs"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              すべての稽古場を見る
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>

          <Link
            href={LAB_RENDER_META.path}
            className="group block rounded-xl border border-border bg-card p-8 transition-colors hover:border-primary hover:bg-accent/30"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
              <h3 className="font-heading text-xl font-medium">{LAB_RENDER_META.shortTitle}</h3>
              <span className="text-xs font-medium text-primary">公開中</span>
            </div>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {LAB_RENDER_META.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
              試してみる
              <ArrowRight size={14} weight="bold" />
            </span>
          </Link>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8">
          <h2 className="mb-2 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            今後の予定
          </h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Phase ごとに Lab を追加していきます。
            <Link
              href="/roadmap"
              className="ml-1 underline-offset-2 hover:underline text-foreground"
            >
              ロードマップ全体を見る
            </Link>
          </p>
          <ul className="grid gap-3 md:grid-cols-3">
            {upcomingLabs.map((lab) => (
              <li
                key={lab.id}
                className="rounded-lg border border-dashed border-border p-5 opacity-70"
              >
                <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                  {lab.status === 'phase-2' && 'Phase 2'}
                  {lab.status === 'phase-3' && 'Phase 3'}
                  {lab.status === 'formal' && '正式版'}
                </div>
                <div className="font-heading text-base">{lab.shortTitle}</div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {lab.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8">
          <h2 className="mb-4 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            誰向けか
          </h2>
          <div className="grid gap-6 text-muted-foreground md:grid-cols-2">
            <p>
              英語の技術記事を追いかけ続けるのがつらいけれど、フロントエンドの深い部分は掴みたい
              — そんな<strong className="text-foreground">中級フロントエンドエンジニア</strong>
              を第一に想定しています。
            </p>
            <p>
              ブラウザの内部や最適化の判断基準は、手を動かすと一気に腑に落ちます。
              このサイトは「手を動かす場」を提供することで、読むだけでは届かなかった層を
              自分のものにする手助けを目指しています。
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
