/**
 * Lab 3 チュートリアルステップ。
 * docs/08 §8.2 の 6 段に準拠。
 */

import type { PropKind, StateSource } from '../stores/playgroundStore'

export type MetricFocus = 'total_renders' | 'flash' | 'table' | 'commit_vs_render'

export type TutorialStep = {
  id: number
  slug: string
  title: string
  objective: string
  observation: string
  preset: {
    depth: number
    fanout: number
    /** memo を付けるノード ID のリスト。未指定なら空 */
    memoIds?: readonly string[]
    propKind: PropKind
    stateSource: StateSource
  }
  focus?: ReadonlyArray<MetricFocus>
}

export const TUTORIAL_STEPS: readonly TutorialStep[] = [
  {
    id: 1,
    slug: 'basic-propagation',
    title: '最小ツリー — 親の state 更新が子に伝わる',
    objective:
      '親 (Root) の state を更新したとき、A → B と伝播して両方が再 render されることを可視化する。',
    observation:
      '「state を更新」ボタンを押すと、ツリー全体が 1 度 flash する。下部カウンタが 0 → 1 → 2 と増える。',
    preset: { depth: 1, fanout: 1, propKind: 'primitive', stateSource: 'local' },
    focus: ['flash', 'total_renders'],
  },
  {
    id: 2,
    slug: 'memo-stops',
    title: 'memo を付けると止まる',
    objective: '子 B を memo 化し、同じ primitive props では子が止まることを確認する。',
    observation:
      '子に memo を付けた後、更新ボタンを押しても B は flash しない。A だけが flash する。',
    preset: {
      depth: 1,
      fanout: 1,
      memoIds: ['A'],
      propKind: 'primitive',
      stateSource: 'local',
    },
    focus: ['flash'],
  },
  {
    id: 3,
    slug: 'object-literal-breaks-memo',
    title: 'object literal prop で memo が失効する',
    objective:
      'memo 化された子に object literal (`{ id: 1 }`) を渡すと、参照が毎回変わり memo が効かないことを実演する。',
    observation:
      'ステップ 2 と同じ構成で prop 種別を object-literal に切り替える → memo があっても子が flash するようになる。',
    preset: {
      depth: 1,
      fanout: 1,
      memoIds: ['A'],
      propKind: 'object-literal',
      stateSource: 'local',
    },
    focus: ['flash', 'total_renders'],
  },
  {
    id: 4,
    slug: 'context-spreads',
    title: 'Context の伝播範囲 — Zustand との対比',
    objective:
      'Context.Provider 配下の全 consumer が再 render されること、Zustand には selector で絞る仕組みがあることを、実演と解説で理解する。',
    observation:
      'stateSource を context に切り替えると木全体が flash する。zustand については本 Lab では操作差は出ず、概念解説（selector の効用）をサイドパネルで読む。',
    preset: {
      depth: 2,
      fanout: 2,
      memoIds: [],
      propKind: 'primitive',
      stateSource: 'context',
    },
    focus: ['flash', 'table'],
  },
  {
    id: 5,
    slug: 'derived-state-trap',
    title: '派生 state の罠 — 再計算 vs 再保持',
    objective:
      'state から計算した値をまた state に保持する構造がループや sync issue を生む仕組みを、コード例と解説で理解する。',
    observation:
      '本ステップはラボ上の操作で再現する挙動ではない。サイドパネルの Before/After コードと「state にすべきかの判断基準」に目を通す。',
    preset: {
      depth: 1,
      fanout: 2,
      memoIds: [],
      propKind: 'stable-ref',
      stateSource: 'local',
    },
    focus: ['total_renders', 'commit_vs_render'],
  },
  {
    id: 6,
    slug: 'render-is-not-evil',
    title: '「再 render = 悪」ではない',
    objective:
      'render phase と commit phase を区別する。DOM mutation を伴わない再 render は commit が軽く、過剰な memo は不要という結論に至る。',
    observation:
      '更新ボタンを何度か押すと total renders は増えるが、DOM mutation 件数は 0 に留まることを確認する。',
    preset: {
      depth: 2,
      fanout: 3,
      memoIds: [],
      propKind: 'primitive',
      stateSource: 'local',
    },
    focus: ['commit_vs_render'],
  },
] as const

export const TUTORIAL_STEP_COUNT = TUTORIAL_STEPS.length

export function getStep(id: number): TutorialStep | null {
  return TUTORIAL_STEPS.find((s) => s.id === id) ?? null
}
