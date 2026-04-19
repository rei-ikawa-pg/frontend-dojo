/**
 * Lab 2 (メモリリーク) で共通して使う型。
 */

/** リーク種別。各シナリオごとに「作り方・直し方」が異なる */
export type LeakType = 'timer' | 'listener' | 'detached-dom' | 'closure'

/** 対策手段。none は「対策なし（リーク状態）」を明示するための値 */
export type Mitigation = 'none' | 'cleanup' | 'abort-controller' | 'weak-ref'

/** 1 サイクル分の割り当て量（大きな配列を持たせるためのサイズ）。KB 単位 */
export type HoldSize = 'small' | 'medium' | 'large'

export const HOLD_SIZE_BYTES: Record<HoldSize, number> = {
  // Array(n) の n に対応。数値 1 つ ≒ 8 byte で概算
  small: 10_000,
  medium: 100_000,
  large: 500_000,
}

/** メモリ計測のスナップショット。Chromium 以外では null 要素を含むことがある */
export type MemorySample = {
  /** ms since timeOrigin */
  t: number
  /** usedJSHeapSize (bytes)。performance.memory 非対応環境では null */
  used: number | null
  /** 生存中の DOM ノード数 (document.querySelectorAll('*').length) */
  domNodes: number
  /** 自前で数えた listener / timer の合計 */
  retained: number
}
