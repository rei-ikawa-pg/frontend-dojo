/**
 * サイト全体のデフォルト OGP 画像 (/, /about, /roadmap, /labs などで使用)。
 * 各 Lab は app/lab/*\/opengraph-image.tsx で上書きする。
 */

import { generateOgImage, ogContentType, ogSize } from '@/lib/og/template'
import { SITE } from '@/lib/site'

export const alt = `${SITE.name} — ${SITE.tagline}`
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return generateOgImage({
    title: SITE.tagline,
    description: '日本語のインタラクティブラボ',
  })
}
