/**
 * /admin — 管理画面 TOP。
 *
 * 各機能（RUM / フィードバック）への導線だけを並べるシンプルなページ。
 * 各リンクには現在の `?token=XXX` を伝搬させる。
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdminContext } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'TOP',
}

type PageProps = {
  searchParams: Promise<{ token?: string }>
}

const FEATURES: { href: string; label: string; description: string }[] = [
  {
    href: '/admin/rum',
    label: 'RUM ダッシュボード',
    description: 'Web Vitals / Lab メトリクス / アクセス数',
  },
  {
    href: '/admin/feedback',
    label: 'フィードバック',
    description: 'ユーザーからの Good / Bad とコメント',
  },
]

export default async function AdminTopPage({ searchParams }: PageProps) {
  const { token } = await searchParams
  await requireAdminContext(token)

  const tokenQs = `?token=${encodeURIComponent(token ?? '')}`

  return (
    <>
      <header className="mb-10">
        <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-ink-400">§ Admin</p>
        <h1 className="font-mincho text-3xl tracking-tight text-ink-900 md:text-4xl">管理画面</h1>
        <p className="mt-2 text-sm text-ink-500">閲覧したい機能を選んでください。</p>
      </header>

      <nav aria-label="機能一覧">
        <ul className="grid gap-4 md:grid-cols-2">
          {FEATURES.map((item, idx) => (
            <li key={item.href}>
              <Link
                href={`${item.href}${tokenQs}`}
                className="group block h-full border border-rule-dim bg-card p-5 transition-colors hover:border-ink-900"
              >
                <div className="text-[11px] uppercase tracking-[0.24em] text-ink-400 group-hover:text-ink-700">
                  {`§ 0${idx + 1}`}
                </div>
                <div className="mt-2 font-mincho text-xl text-ink-900">{item.label}</div>
                <div className="mt-1 text-xs text-ink-500">{item.description}</div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
