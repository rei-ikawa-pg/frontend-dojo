import Link from 'next/link'
import { NAV_ITEMS } from '@/lib/site'

export function Nav() {
  return (
    <nav aria-label="グローバルナビゲーション" className="hidden md:flex items-center gap-6">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
