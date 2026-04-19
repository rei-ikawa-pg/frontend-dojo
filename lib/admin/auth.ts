/**
 * 管理画面共通の認可ヘルパー（page.tsx 用）。
 *
 * 一次ゲートは `middleware.ts`（HttpOnly Cookie `fd_admin` を検証）。
 * この関数はそのあとの二重防御として、各 page.tsx の冒頭で Cookie を再検証する。
 * middleware が何らかの事情で通らなかった場合でも、page が描画される前に 404 相当で弾く。
 *
 * 将来: Cloudflare Access に移行する予定（docs/05 §5.1）
 */

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ADMIN_COOKIE_NAME, verifyAdminCookieValue } from './cookie'

export async function requireAdminContext() {
  const { env } = await getCloudflareContext({ async: true })
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value

  const valid =
    !!env.ADMIN_TOKEN &&
    !!cookieValue &&
    (await verifyAdminCookieValue(cookieValue, env.ADMIN_TOKEN))

  if (!valid) {
    notFound()
  }
  return { env }
}
