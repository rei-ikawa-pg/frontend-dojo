/**
 * ブラウザ・デバイス種別の共通定数と型。
 * RUM のラベル集計を限られた値に絞るため、早い段階で正規化する。
 */

export const BROWSERS = ['chromium', 'safari', 'firefox', 'other'] as const
export const DEVICE_TYPES = ['desktop', 'tablet', 'mobile'] as const

export type Browser = (typeof BROWSERS)[number]
export type DeviceType = (typeof DEVICE_TYPES)[number]
