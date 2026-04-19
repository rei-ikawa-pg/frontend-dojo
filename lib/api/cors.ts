/**
 * Edge / Workers の API Route 共通の CORS ヘルパ。
 *
 * 方針:
 *   - 本番では `ALLOWED_ORIGIN` のみを許可する（環境変数で渡す）
 *   - 開発時のみ（`allowLocal: true`）localhost / 127.0.0.1 を任意ポートで許可する。
 *     本番で true にしないこと（攻撃者が自 PC の localhost から書き込み可能になるため）
 *   - 上記いずれにもマッチしない origin は `allowed` を返し、ブラウザ側で弾かれるようにする
 *   - `OPTIONS` プリフライト用のヘルパも同居させ、route 側のボイラープレートを減らす
 */

const LOCALHOST_RE = /^https?:\/\/localhost(?::\d+)?$/
const LOOPBACK_RE = /^https?:\/\/127\.0\.0\.1(?::\d+)?$/

export type CorsOptions = {
  /** 開発環境のときだけ true にする。本番では必ず false。 */
  allowLocal: boolean
}

export function isOriginAllowed(origin: string, allowed: string, options: CorsOptions): boolean {
  if (origin === allowed) return true
  if (options.allowLocal) {
    if (LOCALHOST_RE.test(origin)) return true
    if (LOOPBACK_RE.test(origin)) return true
  }
  return false
}

export function corsHeaders(
  origin: string | null,
  allowed: string,
  options: CorsOptions,
): Record<string, string> {
  const allowOrigin = origin && isOriginAllowed(origin, allowed, options) ? origin : allowed
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

/** `OPTIONS` プリフライトのレスポンスを生成する */
export function preflightResponse(
  origin: string | null,
  allowed: string,
  options: CorsOptions,
): Response {
  return new Response(null, { status: 204, headers: corsHeaders(origin, allowed, options) })
}

/**
 * 環境判定ヘルパ。
 * `process.env.NODE_ENV` はビルド時に Next.js / OpenNext によって埋め込まれる。
 * 本番ビルド時は必ず `'production'` になる。
 */
export function isDevEnvironment(): boolean {
  return process.env.NODE_ENV !== 'production'
}
