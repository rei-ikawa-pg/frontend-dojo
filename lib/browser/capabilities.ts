/**
 * ブラウザのパフォーマンス計測系 API がサポートされているかの判定。
 * - LoAF は Chromium 123+ のみ、他ブラウザでは longtask にフォールバックする判断材料として使う
 * - performance.memory は Chromium 限定の非標準 API
 */

export function supportsLoaf(): boolean {
  if (typeof PerformanceObserver === 'undefined') return false
  const types = (PerformanceObserver as unknown as { supportedEntryTypes?: readonly string[] })
    .supportedEntryTypes
  return Array.isArray(types) && types.includes('long-animation-frame')
}

export function supportsLongTask(): boolean {
  if (typeof PerformanceObserver === 'undefined') return false
  const types = (PerformanceObserver as unknown as { supportedEntryTypes?: readonly string[] })
    .supportedEntryTypes
  return Array.isArray(types) && types.includes('longtask')
}

/** RUM 送信時に sendBeacon を優先するかの判定 */
export function supportsSendBeacon(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function'
}

export function supportsPerformanceMemory(): boolean {
  return (
    typeof performance !== 'undefined' &&
    'memory' in performance &&
    performance.memory !== undefined
  )
}
