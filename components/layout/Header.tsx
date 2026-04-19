import { SITE } from '@/lib/site'
import { HeaderBar } from './HeaderBar'
import { MobileMenu } from './MobileMenu'
import { Nav } from './Nav'

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <HeaderBar
        contained
        right={
          <div className="flex items-center gap-6">
            <Nav />
            <div className="hidden items-center gap-4 border-l border-rule-dim pl-6 md:flex">
              <a
                href={SITE.zenn}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-medium uppercase tracking-[0.18em] text-ink-500 transition-colors hover:text-vermilion"
              >
                Zenn ↗
              </a>
              <a
                href={SITE.x}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-medium uppercase tracking-[0.18em] text-ink-500 transition-colors hover:text-vermilion"
              >
                X ↗
              </a>
            </div>
            <MobileMenu />
          </div>
        }
      />
    </header>
  )
}
