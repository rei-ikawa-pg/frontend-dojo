/**
 * 管理画面共通のナビゲーション。
 *
 * - TOP / RUM / フィードバック の 3 タブ
 * - クエリ `?token=XXX` は明示的にリンク先へ伝搬する
 *   （layout は searchParams を受けない仕様のため Client Component でハンドリング）
 */

'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: '/admin', label: 'TOP' },
  { href: '/admin/rum', label: 'RUM' },
  { href: '/admin/feedback', label: 'フィードバック' },
]

export function AdminNav() {
  const pathname = usePathname()
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  return (
    <nav aria-label="管理画面ナビ" className="border-b border-rule-dim bg-card/40">
      <ul className="mx-auto flex w-full max-w-7xl items-center gap-4 px-5 md:gap-8 md:px-8">
        {NAV_ITEMS.map((item) => {
          const href = token ? `${item.href}?token=${encodeURIComponent(token)}` : item.href
          // `/admin/rum?xxx` 内で `/admin` も active 判定されないよう完全一致で比較
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`block border-b-2 py-3 text-[11px] uppercase tracking-[0.24em] transition-colors ${
                  active
                    ? 'border-ink-900 text-ink-900'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
