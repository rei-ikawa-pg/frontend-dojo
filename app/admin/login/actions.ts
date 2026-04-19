/**
 * 管理画面のログイン / ログアウト用 Server Action。
 *
 * - loginAction: トークン入力を受け取り、ADMIN_TOKEN と定数時間比較。一致したら
 *   HttpOnly/Secure/SameSite=Strict の署名付き Cookie を発行して `/admin` に遷移。
 * - logoutAction: Cookie を削除して `/admin/login` に戻す。
 */

'use server'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE_NAME, issueAdminCookieValue } from '@/lib/admin/cookie'

/** 定数時間の文字列比較（タイミング攻撃対策） */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function loginAction(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '')
  const { env } = await getCloudflareContext({ async: true })

  if (!token || !env.ADMIN_TOKEN || !timingSafeEqual(token, env.ADMIN_TOKEN)) {
    redirect('/admin/login?error=invalid')
  }

  const issued = await issueAdminCookieValue(env.ADMIN_TOKEN)
  const cookieStore = await cookies()
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: issued.value,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: issued.maxAgeSeconds,
  })

  redirect('/admin')
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
  redirect('/admin/login')
}
