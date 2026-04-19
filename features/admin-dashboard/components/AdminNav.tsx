/**
 * 管理画面共通のナビゲーション。
 *
 * - TOP / RUM / フィードバック の 3 タブ + 右端にログアウトボタン
 * - `/admin/login` ではナビ自体を描画しない（ログイン前なので）
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/admin/login/actions'

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: '/admin', label: 'TOP' },
  { href: '/admin/rum', label: 'RUM' },
  { href: '/admin/feedback', label: 'フィードバック' },
]

export function AdminNav() {
  const pathname = usePathname()

  // ログイン画面ではナビを出さない（未認証でも表示される唯一の /admin 配下）
  if (pathname === '/admin/login') return null

  return (
    <nav aria-label="管理画面ナビ" className="border-b border-rule-dim bg-card/40">
      <ul className="mx-auto flex w-full max-w-7xl items-center gap-4 px-5 md:gap-8 md:px-8">
        {NAV_ITEMS.map((item) => {
          // `/admin/rum?xxx` 内で `/admin` も active 判定されないよう完全一致で比較
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
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
        <li className="ml-auto">
          <form action={logoutAction}>
            <button
              type="submit"
              className="block cursor-pointer border-b-2 border-transparent py-3 text-[11px] uppercase tracking-[0.24em] text-ink-500 transition-colors hover:text-ink-900"
            >
              ログアウト
            </button>
          </form>
        </li>
      </ul>
    </nav>
  )
}
