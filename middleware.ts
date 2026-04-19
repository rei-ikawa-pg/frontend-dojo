/**
 * /admin/* の認可ゲート。
 *
 * - Cookie `fd_admin` が存在し、HMAC 署名が ADMIN_TOKEN と一致し、期限内のときだけ通す
 * - 認可失敗時は /admin/login にリダイレクト
 * - /admin/login 自身は除外（ログイン前に唯一開けるページ）
 *
 * 認可の責務はここ 1 箇所に集約。各 page.tsx は Cookie 検証済みを前提にデータ取得に専念する。
 */

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { type NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE_NAME, verifyAdminCookieValue } from '@/lib/admin/cookie'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ログイン画面は未認証でも開ける必要がある
  if (pathname === '/admin/login') return NextResponse.next()

  const { env } = await getCloudflareContext({ async: true })
  const cookieValue = request.cookies.get(ADMIN_COOKIE_NAME)?.value

  const valid =
    !!env.ADMIN_TOKEN &&
    !!cookieValue &&
    (await verifyAdminCookieValue(cookieValue, env.ADMIN_TOKEN))

  if (!valid) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    loginUrl.search = ''
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // `/admin` 直下と `/admin/*` 全てをゲート対象にする
  matcher: ['/admin', '/admin/:path*'],
}
