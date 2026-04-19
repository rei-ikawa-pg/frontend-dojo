/**
 * Edge / Workers の API Route 共通の CORS ヘルパ。
 *
 * 方針:
 *   - 本番では `ALLOWED_ORIGIN` のみを許可する（環境変数で渡す）
 *   - 開発時のみ localhost / 127.0.0.1 を任意ポートで許可
 *   - 上記いずれにもマッチしない origin は `allowed` を返し、ブラウザ側で弾かれるようにする
 *   - `OPTIONS` プリフライト用のヘルパも同居させ、route 側のボイラープレートを減らす
 */

const LOCALHOST_RE = /^https?:\/\/localhost(?::\d+)?$/
const LOOPBACK_RE = /^https?:\/\/127\.0\.0\.1(?::\d+)?$/

export function isOriginAllowed(origin: string, allowed: string): boolean {
  if (origin === allowed) return true
  if (LOCALHOST_RE.test(origin)) return true
  if (LOOPBACK_RE.test(origin)) return true
  return false
}

export function corsHeaders(origin: string | null, allowed: string): Record<string, string> {
  const allowOrigin = origin && isOriginAllowed(origin, allowed) ? origin : allowed
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

/** `OPTIONS` プリフライトのレスポンスを生成する */
export function preflightResponse(origin: string | null, allowed: string): Response {
  return new Response(null, { status: 204, headers: corsHeaders(origin, allowed) })
}
