/**
 * /admin/login — 管理画面ログインフォーム。
 *
 * - トークンを入力して送信 → Server Action (`loginAction`) で検証 → Cookie 発行
 * - 失敗時は `?error=invalid` を付与してリダイレクトしてくる
 * - middleware.ts の matcher では除外（未ログインでも開ける唯一のページ）
 */

import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginAction } from './actions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ログイン',
}

type PageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-12">
      <header className="mb-2">
        <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-ink-400">
          § Admin / Login
        </p>
        <h1 className="font-mincho text-3xl tracking-tight text-ink-900 md:text-4xl">
          管理画面ログイン
        </h1>
        <p className="mt-2 text-sm text-ink-500">管理トークンを入力してください。</p>
      </header>

      <form action={loginAction} className="flex flex-col gap-4 border border-rule-dim bg-card p-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="admin-token"
            className="text-[11px] uppercase tracking-[0.24em] text-ink-400"
          >
            § Token
          </label>
          <Input
            id="admin-token"
            name="token"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            className="h-10 font-mono text-sm"
          />
        </div>

        {error === 'invalid' && (
          <p className="text-xs text-[color:rgb(221_75_57)]">
            トークンが正しくありません。再度ご確認ください。
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            ログイン
          </Button>
        </div>
      </form>
    </div>
  )
}
