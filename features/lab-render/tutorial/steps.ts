/**
 * Lab 1 チュートリアルのステップ定義。
 * - 各ステップは docs/06 §5 の 8 ステップ構成に準拠
 * - presetConfig で RenderEngine の初期状態を強制（観察の前提を揃えるため）
 * - 本文は MDX を動的 import して当てる
 */

import type { PlaygroundProp } from '../stores/playgroundStore'

export type TutorialStep = {
  id: number
  slug: string
  title: string
  objective: string
  observation: string
  preset: {
    elementCount: number
    enabledProps: ReadonlyArray<PlaygroundProp>
    autoStart: boolean
  }
}

export const TUTORIAL_STEPS: readonly TutorialStep[] = [
  {
    id: 1,
    slug: 'intro',
    title: '導入 — ブラウザの 1 フレーム',
    objective: 'ブラウザが 1 枚の絵を描くまでにどんな工程があるかを把握する。',
    observation: 'まずは実行せず、Style → Layout → Paint → Composite の並びを意識する。',
    preset: { elementCount: 300, enabledProps: [], autoStart: false },
  },
  {
    id: 2,
    slug: 'layout-triggered',
    title: 'Layout が走る例',
    objective: 'width を変えたときに Style+Layout のコストが乗ることを実測する。',
    observation: 'FPS が落ちる / Style+Layout の時間が 0ms でなくなる、この 2 点を見る。',
    preset: { elementCount: 500, enabledProps: ['width'], autoStart: true },
  },
  {
    id: 3,
    slug: 'paint-only',
    title: 'Paint だけで済む例',
    objective: 'background-color は Paint+Composite で済み、Layout が走らないことを確認する。',
    observation: '実測の Style+Layout がほぼ 0ms に張り付くはず。',
    preset: { elementCount: 500, enabledProps: ['background-color'], autoStart: true },
  },
  {
    id: 4,
    slug: 'composite-only',
    title: '最軽量の例 — transform',
    observation: '実測の Style+Layout / Rendering 両方が小さく、FPS が安定する。',
    objective: 'transform は Composite のみで済むため、最も軽量に動く。',
    preset: { elementCount: 1000, enabledProps: ['transform'], autoStart: true },
  },
  {
    id: 5,
    slug: 'theory-vs-actual',
    title: '理論と実測の一致を確認',
    objective: 'CSS Triggers の理論表と LoAF の実測が同じ結論を出すことを確かめる。',
    observation: '下部テーブルの 理論 と 実測 の列が一致することを確認する。',
    preset: { elementCount: 800, enabledProps: ['opacity'], autoStart: true },
  },
  {
    id: 6,
    slug: 'combined',
    title: '軽いプロパティと重いプロパティの組み合わせ',
    objective:
      'transform と width を両方有効にすると、重い側のコストに引きずられることを観察する。',
    observation: 'Layout が走る時点で、transform の軽さは相殺される。',
    preset: { elementCount: 800, enabledProps: ['transform', 'width'], autoStart: true },
  },
  {
    id: 7,
    slug: 'low-spec-sim',
    title: '要素数を増やしたときの挙動',
    objective: '要素数を 2000 まで増やし、低スペック端末を模擬する。',
    observation: '軽いはずの transform でも、要素数が増えれば Composite が支配的になる。',
    preset: { elementCount: 2000, enabledProps: ['transform'], autoStart: true },
  },
  {
    id: 8,
    slug: 'devtools',
    title: 'DevTools で同じ現象を見る',
    objective: 'Chrome DevTools の Performance パネルで同じ計測を再現する手順を踏む。',
    observation:
      'サイト内の計測と DevTools の「Rendering」「Layout」が対応していることを確認する。',
    preset: { elementCount: 800, enabledProps: ['transform'], autoStart: false },
  },
] as const

export const TUTORIAL_STEP_COUNT = TUTORIAL_STEPS.length

export function getStep(id: number): TutorialStep | null {
  return TUTORIAL_STEPS.find((s) => s.id === id) ?? null
}
