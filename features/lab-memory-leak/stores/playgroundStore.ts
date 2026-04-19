/**
 * Lab 2 (メモリリーク) プレイグラウンドの Zustand ストア。
 *
 * 設計:
 *   - UI 操作の意図（リーク種別・対策・サイクル数・保持サイズ）のみを載せる
 *   - 実際のヒープ変動や Timer/Listener 数は LeakController / memoryReader 側で観測する
 *   - isRunning は「連続サイクルを自動で回すか」のフラグ。オフの時は手動で「1 サイクル実行」
 */

'use client'

import { create } from 'zustand'
import type { HoldSize, LeakType, Mitigation } from '../engine/types'

export const LEAK_TYPES: readonly LeakType[] = ['timer', 'listener', 'detached-dom', 'closure']
export const MITIGATIONS: readonly Mitigation[] = [
  'none',
  'cleanup',
  'abort-controller',
  'weak-ref',
]
export const HOLD_SIZES: readonly HoldSize[] = ['small', 'medium', 'large']

export const CYCLE_COUNT_MIN = 1
export const CYCLE_COUNT_MAX = 100
export const CYCLE_COUNT_DEFAULT = 10

export const LEAK_TYPE_LABEL: Record<LeakType, string> = {
  timer: 'setInterval',
  listener: 'EventListener',
  'detached-dom': 'Detached DOM',
  closure: 'Closure',
}

export const MITIGATION_LABEL: Record<Mitigation, string> = {
  none: '対策なし',
  cleanup: 'cleanup あり',
  'abort-controller': 'AbortController',
  'weak-ref': 'WeakRef',
}

export const HOLD_SIZE_LABEL: Record<HoldSize, string> = {
  small: '小 (10K)',
  medium: '中 (100K)',
  large: '大 (500K)',
}

type MemoryPlaygroundState = {
  leakType: LeakType
  mitigation: Mitigation
  holdSize: HoldSize
  cycleCount: number
  isRunning: boolean
  setLeakType: (t: LeakType) => void
  setMitigation: (m: Mitigation) => void
  setHoldSize: (s: HoldSize) => void
  setCycleCount: (n: number) => void
  start: () => void
  stop: () => void
  reset: () => void
}

const INITIAL: Pick<
  MemoryPlaygroundState,
  'leakType' | 'mitigation' | 'holdSize' | 'cycleCount' | 'isRunning'
> = {
  leakType: 'timer',
  mitigation: 'none',
  holdSize: 'medium',
  cycleCount: CYCLE_COUNT_DEFAULT,
  isRunning: false,
}

function clampCount(n: number): number {
  if (Number.isNaN(n)) return CYCLE_COUNT_DEFAULT
  return Math.min(CYCLE_COUNT_MAX, Math.max(CYCLE_COUNT_MIN, Math.round(n)))
}

export const useMemoryPlaygroundStore = create<MemoryPlaygroundState>((set) => ({
  ...INITIAL,

  setLeakType: (leakType) => set({ leakType }),
  setMitigation: (mitigation) => set({ mitigation }),
  setHoldSize: (holdSize) => set({ holdSize }),
  setCycleCount: (n) => set({ cycleCount: clampCount(n) }),

  start: () => set({ isRunning: true }),
  stop: () => set({ isRunning: false }),

  reset: () => set({ ...INITIAL }),
}))
