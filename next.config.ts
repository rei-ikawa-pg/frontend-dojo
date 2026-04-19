import createMDX from '@next/mdx'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import type { NextConfig } from 'next'

const withMDX = createMDX({
  extension: /\.mdx?$/,
})

/**
 * サイト全体に付与するセキュリティヘッダ。
 *
 * - CSP: next/font は self 配信、CF Insights の beacon だけ外部を許可。
 *   Next.js App Router はインラインスクリプト / スタイルを多用するため
 *   `'unsafe-inline'` を許容（将来 nonce 化する場合は middleware 連携が必要）。
 *   React の dev モードは callstack 再構築等で eval() を使うため、
 *   開発時のみ `'unsafe-eval'` を許可する。本番は含めない。
 * - HSTS: Cloudflare 側でも配信可能だが、アプリ層でも明示して防御層を重ねる。
 * - X-Frame-Options / frame-ancestors: クリックジャッキング防止。両者で互換確保。
 * - Referrer-Policy: 既定は strict-origin-when-cross-origin。/admin/* は
 *   URL クエリに管理トークンが乗るため `no-referrer` に強化する。
 */
const IS_DEV = process.env.NODE_ENV !== 'production'

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${IS_DEV ? " 'unsafe-eval'" : ''} https://static.cloudflareinsights.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://cloudflareinsights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join('; ')

const COMMON_SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
]

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  async headers() {
    return [
      {
        // `/` を含む全パスに付与する（`/:path*` だとルートにマッチしない挙動対策で `(.*)`)
        source: '/(.*)',
        headers: COMMON_SECURITY_HEADERS,
      },
      {
        // 管理画面はクエリに token が乗るため Referer を一切送らない
        source: '/admin/:path*',
        headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }],
      },
    ]
  },
}

initOpenNextCloudflareForDev()

export default withMDX(nextConfig)
