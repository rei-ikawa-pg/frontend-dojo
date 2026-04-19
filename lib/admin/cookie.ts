/**
 * 管理画面の認可 Cookie（署名付き）。
 *
 * 構造:
 *   Cookie 名: `fd_admin`
 *   値: `<expiryMs>.<hex HMAC-SHA256>`
 *   署名鍵: `ADMIN_TOKEN`（環境変数）
 *
 * 流れ:
 *   1. `/admin/login` の Server Action で ADMIN_TOKEN と照合
 *   2. 一致したら `issueAdminCookieValue()` で署名付き値を生成し
 *      HttpOnly / Secure / SameSite=Strict Cookie として払い出す
 *   3. middleware.ts が `/admin/*` の入口で `verifyAdminCookieValue()` を呼んで検証
 *
 * セキュリティ:
 *   - Cookie は HttpOnly のため JavaScript からアクセス不可（XSS 耐性）
 *   - SameSite=Strict で CSRF 不可
 *   - 値は期限付きで改ざん不可（HMAC）
 *   - ADMIN_TOKEN を Cookie に平文で載せないため、漏洩しても TTL 経過で自動失効
 *   - ADMIN_TOKEN を書き換えて再デプロイすれば既存 Cookie は全て無効化（強制ログアウト）
 */

export const ADMIN_COOKIE_NAME = 'fd_admin'

/** Cookie の有効期間（秒）。sliding expiration は行わない（延長したい場合は再ログイン） */
export const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

const encoder = new TextEncoder()

async function hmacSha256Hex(key: string, data: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data))
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, '0')).join('')
}

/** 定数時間の文字列比較（タイミング攻撃対策） */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export type IssuedCookie = {
  value: string
  maxAgeSeconds: number
  expiresAtMs: number
}

export async function issueAdminCookieValue(
  adminToken: string,
  ttlSeconds: number = ADMIN_COOKIE_MAX_AGE_SECONDS,
  now: number = Date.now(),
): Promise<IssuedCookie> {
  const expiresAtMs = now + ttlSeconds * 1000
  const signature = await hmacSha256Hex(adminToken, `admin:${expiresAtMs}`)
  return {
    value: `${expiresAtMs}.${signature}`,
    maxAgeSeconds: ttlSeconds,
    expiresAtMs,
  }
}

export async function verifyAdminCookieValue(
  value: string,
  adminToken: string,
  now: number = Date.now(),
): Promise<boolean> {
  // 期待形式: "<number>.<hex>"。dot が最初にくる位置を基準に split
  const dot = value.indexOf('.')
  if (dot <= 0 || dot === value.length - 1) return false
  const expiresAtMs = Number(value.slice(0, dot))
  const signature = value.slice(dot + 1)
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= now) return false
  const expected = await hmacSha256Hex(adminToken, `admin:${expiresAtMs}`)
  return timingSafeEqual(signature, expected)
}
