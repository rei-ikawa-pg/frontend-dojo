/**
 * 管理画面共通レイアウト。
 *
 * - `<AdminNav>` を全ページ上部に表示（TOP / RUM / フィードバック）
 * - 認可は searchParams が必要なため各 page.tsx の冒頭で `requireAdminContext` を呼ぶ
 * - `robots: noindex` も同時に設定
 */

import type { Metadata } from 'next'
import { AdminNav } from '@/features/admin-dashboard'

export const metadata: Metadata = {
  title: { default: '管理画面', template: '%s | 管理画面' },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav />
      <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 md:px-8 md:py-16">{children}</div>
    </div>
  )
}
