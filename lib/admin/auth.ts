/**
 * 管理画面共通の認可ヘルパー。
 *
 * - `?token=XXX` を Cloudflare 環境変数 `ADMIN_TOKEN` と照合する
 * - 不一致・未設定時は `notFound()`（認可失敗を明示せずに 404 相当）
 * - Cloudflare の env も返すので、呼び出し元は D1 などの binding をそのまま使える
 *
 * 将来: Cloudflare Access に移行する予定（docs/05 §5.1）
 */

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { notFound } from 'next/navigation'

export async function requireAdminContext(token: string | undefined) {
  const { env } = await getCloudflareContext({ async: true })
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    notFound()
  }
  return { env }
}
