/**
 * Cloudflare Web Analytics の beacon を条件付きで読み込む Client Component。
 *
 * 管理画面 (`/admin/*`) ではロードしない。
 * 理由: 管理画面の URL クエリには `?token=ADMIN_TOKEN` が載るため、
 * beacon のサブリクエストで Referer として `static.cloudflareinsights.com`
 * 等へトークンが漏洩する経路を塞ぐ。
 */

'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

type Props = { token: string }

export function CfAnalyticsBeacon({ token }: Props) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
      strategy="afterInteractive"
    />
  )
}
