import { GithubLogo } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { SITE } from '@/lib/site'
import { MobileMenu } from './MobileMenu'
import { Nav } from './Nav'

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-rule-dim bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      {/* ヘッダ上端の朱色アクセント帯 */}
      <div className="relative h-[2px] bg-ink-050">
        <div className="absolute inset-y-0 left-0 w-1/12 bg-vermilion" aria-hidden />
      </div>

      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <Link
          href="/"
          className="group flex items-center gap-4 transition-opacity hover:opacity-90"
        >
          <span
            aria-hidden
            className="relative flex h-11 w-11 items-center justify-center border border-vermilion/70 font-mincho text-[26px] leading-none text-vermilion transition-colors group-hover:bg-vermilion/10"
          >
            道
            <span
              aria-hidden
              className="pointer-events-none absolute -right-[1px] -top-[1px] h-1.5 w-1.5 border-t border-r border-vermilion"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-[1px] -left-[1px] h-1.5 w-1.5 border-b border-l border-vermilion"
            />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-[22px] italic leading-none text-ink-900">
              {SITE.nameEn}
            </span>
            <span className="mt-1 font-mincho text-[13px] text-ink-500">{SITE.name}</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Nav />
          <div className="hidden items-center gap-4 border-l border-rule-dim pl-6 md:flex">
            <a
              href={SITE.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-ink-500 transition-colors hover:text-ink-900"
            >
              <GithubLogo size={17} weight="regular" />
            </a>
            <a
              href={SITE.zenn}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-medium uppercase tracking-[0.18em] text-ink-500 transition-colors hover:text-ink-900"
            >
              Zenn ↗
            </a>
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
