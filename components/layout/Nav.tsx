import Link from 'next/link'
import { NAV_ITEMS } from '@/lib/site'

export function Nav() {
  return (
    <nav aria-label="グローバルナビゲーション" className="hidden items-center gap-7 md:flex">
      {NAV_ITEMS.map((item, index) => (
        <Link
          key={item.href}
          href={item.href}
          className="group relative flex items-baseline gap-2 py-2 transition-colors"
        >
          <span className="tnum text-[10px] font-medium tracking-[0.22em] text-ink-300 group-hover:text-vermilion">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="font-mincho text-[15px] leading-none text-ink-500 group-hover:text-ink-900">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  )
}
