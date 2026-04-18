/**
 * 自由操作モード (Playground) の状態を持つ Zustand ストア。
 *
 * 設計:
 *   - 高頻度更新（FPS メーター等）は RenderEngine 側が DOM 直接操作で担うため、
 *     ここには「ユーザーの操作意図」だけを載せる（要素数・有効プロパティ・実行フラグ）
 *   - Context API では再レンダリングの最適化が難しいので Zustand を採用
 */

'use client'

import { create } from 'zustand'

/** UI のトグルに並べる順序がそのまま配列の順序になる */
export const PLAYGROUND_PROPS = [
  'transform',
  'opacity',
  'filter',
  'background-color',
  'color',
  'box-shadow',
  'width',
  'height',
  'top',
  'font-size',
] as const

export type PlaygroundProp = (typeof PLAYGROUND_PROPS)[number]

/** 要素数スライダーの範囲。上限 2000 は低スペック端末で 30fps を維持できる経験則の上限 */
export const ELEMENT_COUNT_MIN = 100
export const ELEMENT_COUNT_MAX = 2000
export const ELEMENT_COUNT_DEFAULT = 500

type PlaygroundState = {
  elementCount: number
  enabledProps: ReadonlySet<PlaygroundProp>
  isRunning: boolean
  setElementCount: (n: number) => void
  toggleProp: (prop: PlaygroundProp) => void
  setEnabledProps: (props: Iterable<PlaygroundProp>) => void
  start: () => void
  stop: () => void
  reset: () => void
}

/** 初期状態は「transform のみ有効」— Composite だけで済む軽い例から始める */
const INITIAL_PROPS: ReadonlySet<PlaygroundProp> = new Set(['transform'])

function clampCount(n: number): number {
  if (Number.isNaN(n)) return ELEMENT_COUNT_DEFAULT
  return Math.min(ELEMENT_COUNT_MAX, Math.max(ELEMENT_COUNT_MIN, Math.round(n)))
}

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  elementCount: ELEMENT_COUNT_DEFAULT,
  enabledProps: INITIAL_PROPS,
  isRunning: false,

  setElementCount: (n) => set({ elementCount: clampCount(n) }),

  toggleProp: (prop) =>
    set((state) => {
      const next = new Set(state.enabledProps)
      if (next.has(prop)) next.delete(prop)
      else next.add(prop)
      return { enabledProps: next }
    }),

  setEnabledProps: (props) => set({ enabledProps: new Set(props) }),

  start: () => set({ isRunning: true }),
  stop: () => set({ isRunning: false }),

  reset: () =>
    set({
      elementCount: ELEMENT_COUNT_DEFAULT,
      enabledProps: new Set(INITIAL_PROPS),
      isRunning: false,
    }),
}))
