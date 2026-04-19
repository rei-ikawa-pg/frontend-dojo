/**
 * `performance.memory` を安全に読み取るためのラッパー。
 *
 * 仕様:
 *   - Chromium 系でのみ提供される非標準 API
 *   - Firefox / Safari では存在しない。そのときは null を返す
 *   - HTTPS + Same-origin + `--enable-precise-memory-info` の条件がないと
 *     「3 分刻み」に丸められた値が返るが、計測の傾向を見る目的には十分
 */

export type PerformanceMemoryLike = {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export function readHeapUsed(): number | null {
  if (typeof performance === 'undefined') return null
  const mem = (performance as unknown as { memory?: PerformanceMemoryLike }).memory
  if (!mem || typeof mem.usedJSHeapSize !== 'number') return null
  return mem.usedJSHeapSize
}

/** 現在の DOM ノード数。自前カウントで代用できない Detached DOM は `attached` 分のみ映る */
export function countAttachedNodes(): number {
  if (typeof document === 'undefined') return 0
  return document.querySelectorAll('*').length
}

/**
 * GC を明示的に要求する試み。
 * `window.gc` は Chrome を `--js-flags=--expose-gc` 付きで起動した時のみ使える。
 * 通常環境では存在しないが、存在するなら呼び出してユーザーに「減ったか」を見せる価値がある。
 */
export function tryForceGc(): boolean {
  if (typeof window === 'undefined') return false
  const maybeGc = (window as unknown as { gc?: () => void }).gc
  if (typeof maybeGc !== 'function') return false
  try {
    maybeGc()
    return true
  } catch {
    return false
  }
}

export function isMemoryApiAvailable(): boolean {
  return readHeapUsed() !== null
}
