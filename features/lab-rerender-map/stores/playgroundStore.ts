/**
 * Lab 3 プレイグラウンドの Zustand ストア。
 *
 * 操作対象:
 *   - 木の深さ / fanout（子数）
 *   - memo 化する対象ノード集合
 *   - prop 種別（primitive / object-literal / stable-ref / function）
 *   - state source（local / context / zustand）
 *   - tick: 親の state 更新回数
 */

'use client'

import { create } from 'zustand'

export const PROP_KINDS = ['primitive', 'object-literal', 'stable-ref', 'function'] as const
export type PropKind = (typeof PROP_KINDS)[number]

export const STATE_SOURCES = ['local', 'context', 'zustand'] as const
export type StateSource = (typeof STATE_SOURCES)[number]

export const DEPTH_MIN = 1
export const DEPTH_MAX = 4 // 4 * 4 = 256 ノードまで。これ以上は画面に収まらない
export const FANOUT_MIN = 1
export const FANOUT_MAX = 4
export const DEPTH_DEFAULT = 2
export const FANOUT_DEFAULT = 3

export const PROP_KIND_LABEL: Record<PropKind, string> = {
  primitive: 'primitive (42)',
  'object-literal': '{ id: 1 } (毎回新規)',
  'stable-ref': 'useMemo で安定化',
  function: 'function (毎回新規)',
}

export const STATE_SOURCE_LABEL: Record<StateSource, string> = {
  local: 'useState (local)',
  context: 'Context.Provider',
  zustand: 'Zustand',
}

type RerenderPlaygroundState = {
  depth: number
  fanout: number
  /** memo 化されるノード ID の Set */
  memoIds: ReadonlySet<string>
  propKind: PropKind
  stateSource: StateSource
  /** 「state を更新する」ボタンの累計カウント */
  tick: number
  setDepth: (n: number) => void
  setFanout: (n: number) => void
  toggleMemo: (id: string) => void
  setAllMemo: (on: boolean, ids: readonly string[]) => void
  setPropKind: (k: PropKind) => void
  setStateSource: (s: StateSource) => void
  bumpTick: () => void
  reset: () => void
}

const INITIAL_MEMO_IDS: ReadonlySet<string> = new Set()

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min
  return Math.min(max, Math.max(min, Math.round(n)))
}

export const useRerenderPlaygroundStore = create<RerenderPlaygroundState>((set) => ({
  depth: DEPTH_DEFAULT,
  fanout: FANOUT_DEFAULT,
  memoIds: INITIAL_MEMO_IDS,
  propKind: 'primitive',
  stateSource: 'local',
  tick: 0,

  setDepth: (n) => set({ depth: clamp(n, DEPTH_MIN, DEPTH_MAX) }),
  setFanout: (n) => set({ fanout: clamp(n, FANOUT_MIN, FANOUT_MAX) }),

  toggleMemo: (id) =>
    set((state) => {
      const next = new Set(state.memoIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { memoIds: next }
    }),

  setAllMemo: (on, ids) =>
    set(() => ({
      memoIds: on ? new Set(ids) : new Set(),
    })),

  setPropKind: (propKind) => set({ propKind }),
  setStateSource: (stateSource) => set({ stateSource }),
  bumpTick: () => set((s) => ({ tick: s.tick + 1 })),

  reset: () =>
    set({
      depth: DEPTH_DEFAULT,
      fanout: FANOUT_DEFAULT,
      memoIds: new Set(),
      propKind: 'primitive',
      stateSource: 'local',
      tick: 0,
    }),
}))
