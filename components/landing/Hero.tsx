import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { RuleTicks } from '@/components/instrument/RuleTicks'
import { LAB_RENDER_META } from '@/features/lab-render'
import { HeroScope } from './HeroScope'

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative border-b border-rule-dim">
      {/* 左欄外：章番号マーカー（縦書き） */}
      <div className="pointer-events-none absolute left-5 top-10 hidden flex-col items-start gap-2 text-[10px] uppercase tracking-[0.28em] text-ink-300 md:flex">
        <span className="tnum text-vermilion">§ 01</span>
        <span className="h-12 w-px bg-rule-dim" />
        <span className="[writing-mode:vertical-rl]">PORTAL / 入口</span>
      </div>

      {/* 右欄外：計測用目盛り（装飾） */}
      <div className="pointer-events-none absolute right-3 top-0 hidden h-full w-6 flex-col items-center justify-center gap-3 md:flex">
        <RuleTicks orientation="vertical" count={36} className="h-[70%]" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-5 py-20 md:grid-cols-[1.2fr_1fr] md:gap-16 md:px-20 md:py-28">
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-ink-300">
            <span className="inline-block h-1.5 w-1.5 bg-vermilion" />
            <span>Japanese Interactive Lab · Est. 2026</span>
          </div>

          <h1
            id="hero-heading"
            className="flex flex-col gap-3 font-mincho leading-[1.05] tracking-tight text-ink-900"
          >
            <span className="text-4xl md:text-6xl">ブラウザの中を、</span>
            <span className="text-5xl md:text-[84px]">
              <span className="text-vermilion">触って</span>
              {/* 「触って」と「理解する。」の間だけ折り返し可 */}
              <wbr />
              理解する。
            </span>
            <span className="mt-2 font-serif text-2xl italic leading-tight text-ink-500 md:text-3xl">
              A lab you operate, not a blog you scroll.
            </span>
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-ink-500 md:text-base">
            レンダリングパイプライン、メモリ、イベントループ —
            中級フロントエンドがぶつかる鬼門を、実際の計測値を眺めながら
            <span className="text-ink-900"> 自分の手で動かして</span>
            理解するためのラボです。
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href={`${LAB_RENDER_META.path}/tutorial`}
              className="group relative inline-flex items-center gap-4 border border-vermilion bg-vermilion/10 px-6 py-4 text-sm font-medium uppercase tracking-[0.2em] text-ink-900 transition-all hover:bg-vermilion hover:text-ink-000"
            >
              <span className="tnum text-[10px] text-vermilion group-hover:text-ink-000">RUN</span>
              <span>Lab 01 を試す</span>
              <ArrowRight
                size={16}
                weight="bold"
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="#index"
              className="inline-flex items-center gap-3 border-b border-rule-normal pb-1 text-[11px] uppercase tracking-[0.2em] text-ink-400 transition-colors hover:border-ink-500 hover:text-ink-900"
            >
              <span className="tnum">30 SEC</span>
              このサイトとは
            </Link>
          </div>

          {/* メタ情報帯（Lab 数・公開状況・言語） */}
          <dl className="mt-4 grid grid-cols-3 gap-0 border-t border-rule-dim pt-5 text-[10px] uppercase tracking-[0.2em] text-ink-400">
            <div className="flex flex-col gap-1 border-r border-rule-dim pr-4">
              <dt>No. of Labs</dt>
              <dd className="tnum text-2xl font-medium text-ink-900">
                06<span className="text-sm text-ink-400"> / 06</span>
              </dd>
            </div>
            <div className="flex flex-col gap-1 border-r border-rule-dim px-4">
              <dt>Published</dt>
              <dd className="tnum text-2xl font-medium text-ink-900">
                01<span className="text-sm text-ink-400"> / 06</span>
              </dd>
            </div>
            <div className="flex flex-col gap-1 px-4">
              <dt>Language</dt>
              <dd className="font-mincho text-2xl font-medium text-ink-900">日本語</dd>
            </div>
          </dl>
        </div>

        <div className="md:pt-4">
          <HeroScope />
        </div>
      </div>
    </section>
  )
}
