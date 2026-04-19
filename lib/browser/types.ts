/**
 * ブラウザ・デバイス種別の共通定数と型。
 * RUM のラベル集計を限られた値に絞るため、早い段階で正規化する。
 *
 * フィードバック / お問い合わせでも UA 生文字列を保存せず、
 * ここで定義した限定ラベルだけ記録する（個人特定性の低減）。
 */

export const BROWSERS = ['chromium', 'safari', 'firefox', 'other'] as const
export const DEVICE_TYPES = ['desktop', 'tablet', 'mobile'] as const
export const OS_TYPES = ['windows', 'macos', 'ios', 'android', 'linux', 'other'] as const

export type Browser = (typeof BROWSERS)[number]
export type DeviceType = (typeof DEVICE_TYPES)[number]
export type OsType = (typeof OS_TYPES)[number]
