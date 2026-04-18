import { GithubLogo } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { Nav } from './Nav'
import { MobileMenu } from './MobileMenu'
import { SITE } from '@/lib/site'

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-base hover:opacity-80 transition-opacity"
        >
          <span aria-hidden className="text-primary">⛩</span>
          <span>{SITE.name}</span>
        </Link>

        <div className="flex items-center gap-4">
          <Nav />
          <div className="hidden md:flex items-center gap-3">
            <a
              href={SITE.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <GithubLogo size={20} weight="regular" />
            </a>
            <a
              href={SITE.zenn}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Zenn
            </a>
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
