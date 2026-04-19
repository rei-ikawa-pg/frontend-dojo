/**
 * User-Agent からブラウザ・デバイス種別・OS を判定するユーティリティ。
 *
 * 方針:
 * - UA は生のまま保存せず、限られたラベル (chromium/safari/firefox/other) に落とす
 * - サーバ側でも呼べるよう、引数で UA を受け取る形を用意する
 *   （navigator 未定義環境では空文字として扱う）
 */

import type { Browser, DeviceType, OsType } from './types'

export function detectBrowser(userAgent?: string): Browser {
  const ua = (
    userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  ).toLowerCase()
  if (!ua) return 'other'
  // Firefox は Chromium 判定より先に（FxiOS は Chrome でも Safari でもないため）
  if (/firefox|fxios/.test(ua)) return 'firefox'
  // Chromium 系は Edge / Chrome / Opera / Brave / iOS Chrome(CriOS) を全て含む
  if (/edg|chrome|crios|opr|opera|chromium|brave/.test(ua)) return 'chromium'
  // Safari は Chromium 系を除いた上で最後に判定する（Chrome の UA にも Safari が含まれるため）
  if (/safari/.test(ua) && !/chrome|crios|chromium/.test(ua)) return 'safari'
  return 'other'
}

export function detectDeviceType(userAgent?: string): DeviceType {
  const ua = (
    userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  ).toLowerCase()
  if (!ua) return 'desktop'
  // Android の場合、Mobile 指定がなければタブレット扱い（Chromium の慣例に準拠）
  const isTablet =
    /tablet|ipad|playbook|silk/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua))
  if (isTablet) return 'tablet'
  const isMobile =
    /mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|windows phone|palm|iemobile|symbian/.test(
      ua,
    )
  if (isMobile) return 'mobile'
  return 'desktop'
}

/** Lab の互換性警告バナーで用いる: Chromium 系のみ「フル機能動作」と見做す */
export function isChromium(userAgent?: string): boolean {
  return detectBrowser(userAgent) === 'chromium'
}

export function detectOs(userAgent?: string): OsType {
  const ua = (
    userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  ).toLowerCase()
  if (!ua) return 'other'
  // iOS / iPadOS は macOS より先に判定する（iPadOS の UA には "mac os x" が含まれることがある）
  if (/iphone|ipad|ipod|ios/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  if (/windows/.test(ua)) return 'windows'
  if (/mac os x|macintosh/.test(ua)) return 'macos'
  if (/linux|x11|cros|ubuntu|fedora|debian/.test(ua)) return 'linux'
  return 'other'
}

/**
 * フィードバック / お問い合わせの保存用。UA 生文字列を破棄し、
 * 限定ラベル (browser, os, device_type) のみを返す。
 */
export function classifyUserAgent(userAgent: string | null | undefined): {
  browser: Browser
  os: OsType
  device_type: DeviceType
} {
  const ua = userAgent ?? ''
  return {
    browser: detectBrowser(ua),
    os: detectOs(ua),
    device_type: detectDeviceType(ua),
  }
}
