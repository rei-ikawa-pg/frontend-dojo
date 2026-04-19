/**
 * Lab 2 チュートリアルのステップ定義。
 * docs/08-lab-roadmap-phase2.md §8.1 の 5 ステップ構成に準拠。
 * 各 preset で playgroundStore の初期値を強制し「比較の前提」を揃える。
 */

import type { HoldSize, LeakType, Mitigation } from '../engine/types'

export type MetricFocus = 'heap' | 'dom_nodes' | 'retained' | 'chart'

export type TutorialStep = {
  id: number
  slug: string
  title: string
  objective: string
  observation: string
  preset: {
    leakType: LeakType
    mitigation: Mitigation
    holdSize: HoldSize
    cycleCount: number
    autoStart: boolean
  }
  focus?: ReadonlyArray<MetricFocus>
}

export const TUTORIAL_STEPS: readonly TutorialStep[] = [
  {
    id: 1,
    slug: 'read-memory',
    title: 'performance.memory を読む',
    objective:
      'ヒープ使用量を常時観察できるようにする。何もしていない状態でのベースラインを把握する。',
    observation:
      '上部チャートは横ばい。DevTools の「Memory」パネルを GC ボタンで叩くと一時的に下がることも。',
    preset: {
      leakType: 'timer',
      mitigation: 'cleanup',
      holdSize: 'small',
      cycleCount: 1,
      autoStart: false,
    },
    focus: ['heap'],
  },
  {
    id: 2,
    slug: 'timer-leak',
    title: 'Timer リーク — cleanup 有無の比較',
    objective:
      'setInterval を cleanup せずに 10 サイクル回すと、Timer カウンタとヒープが階段状に増えることを確認する。',
    observation:
      '「対策なし」で 1 サイクル実行ボタンを数回押す → Timer カウントが積み上がる。 cleanup に切り替えると増えない。',
    preset: {
      leakType: 'timer',
      mitigation: 'none',
      holdSize: 'small',
      cycleCount: 10,
      autoStart: false,
    },
    focus: ['retained', 'heap'],
  },
  {
    id: 3,
    slug: 'listener-leak',
    title: 'Listener リーク — AbortController で直す',
    objective:
      'addEventListener だけ書いて removeEventListener を書かない状態を観察し、AbortController による一括解放を試す。',
    observation:
      '「対策なし」ではサイクルを回すたびに Listener カウントが増える。AbortController に切り替えると unmount で一気に 0 へ戻る。',
    preset: {
      leakType: 'listener',
      mitigation: 'none',
      holdSize: 'small',
      cycleCount: 10,
      autoStart: false,
    },
    focus: ['retained'],
  },
  {
    id: 4,
    slug: 'detached-dom',
    title: 'Detached DOM — 削除ノードを握り続ける',
    objective:
      '削除した DOM を変数で抱えたままにすると、画面には居ないのにヒープには残ることを確かめる。',
    observation:
      'Detached カウントが増え、ヒープも増え続ける。WeakRef に切り替えると GC 実行後に数が減りうる。',
    preset: {
      leakType: 'detached-dom',
      mitigation: 'none',
      holdSize: 'medium',
      cycleCount: 5,
      autoStart: false,
    },
    focus: ['heap', 'retained'],
  },
  {
    id: 5,
    slug: 'closure-leak',
    title: 'Closure リーク — 大きな配列を抱える関数',
    objective:
      '関数が外側の大きな配列をキャプチャしたまま生き続けると、その配列も解放されない現象を観察する。',
    observation:
      '「大 (500K)」+「対策なし」で 5 サイクル回すと、数秒で数十 MB の増加が読み取れる。 cleanup でゼロになる。',
    preset: {
      leakType: 'closure',
      mitigation: 'none',
      holdSize: 'large',
      cycleCount: 5,
      autoStart: false,
    },
    focus: ['heap', 'chart'],
  },
] as const

export const TUTORIAL_STEP_COUNT = TUTORIAL_STEPS.length

export function getStep(id: number): TutorialStep | null {
  return TUTORIAL_STEPS.find((s) => s.id === id) ?? null
}
