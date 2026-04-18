/**
 * Lab 1 チュートリアルのステップ定義。
 * - 各ステップは docs/06 §5 の 8 ステップ構成に準拠
 * - preset で RenderEngine の初期状態を強制（観察の前提を揃えるため）
 * - focus: このステップで特に見てほしいメトリクス（MetricsDisplay でハイライト）
 * - comparison: 2 レーンで Before/After を横並びに見せる場合の各側の enabledProps
 * - 本文は MDX を動的 import して当てる
 */

import type { PlaygroundProp } from '../stores/playgroundStore'

/** MetricsDisplay でハイライトするメトリクス種別 */
export type MetricFocus = 'fps' | 'frame_budget' | 'style_layout' | 'rendering' | 'theory_vs_actual'

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
  /** ハイライト対象。空配列 / 未指定ならどれも強調しない */
  focus?: ReadonlyArray<MetricFocus>
  /** 設定されていると、VisualizationView の代わりに ComparisonView（2 レーン）を描画する */
  comparison?: {
    left: { label: string; enabledProps: ReadonlyArray<PlaygroundProp> }
    right: { label: string; enabledProps: ReadonlyArray<PlaygroundProp> }
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
    focus: ['style_layout', 'fps'],
  },
  {
    id: 3,
    slug: 'paint-only',
    title: 'Paint だけで済む例',
    objective: 'background-color は Paint+Composite で済み、Layout が走らないことを確認する。',
    observation: '実測の Style+Layout がほぼ 0ms に張り付くはず。',
    preset: { elementCount: 500, enabledProps: ['background-color'], autoStart: true },
    focus: ['style_layout', 'rendering'],
  },
  {
    id: 4,
    slug: 'composite-only',
    title: '最軽量の例 — transform',
    objective: 'transform は Composite のみで済むため、最も軽量に動く。',
    observation: '実測の Style+Layout / Rendering 両方が小さく、FPS が安定する。',
    preset: { elementCount: 1000, enabledProps: ['transform'], autoStart: true },
    focus: ['fps', 'rendering'],
  },
  {
    id: 5,
    slug: 'theory-vs-actual',
    title: '理論と実測の一致を確認',
    objective: 'CSS Triggers の理論表と LoAF の実測が同じ結論を出すことを確かめる。',
    observation: '下部テーブルの 理論 と 実測 の列が一致することを確認する。',
    preset: { elementCount: 800, enabledProps: ['opacity'], autoStart: true },
    focus: ['theory_vs_actual'],
  },
  {
    id: 6,
    slug: 'compare',
    title: '軽い vs 重い — 並べて観察する',
    objective:
      '同じ条件 (要素数・タイミング) で transform と width を並列に動かし、見た目の滑らかさの差を体感する。',
    observation:
      '左 (transform) は滑らかに流れる / 右 (width) はカクつきが目立つ。両方が同時に動いていても、負荷のかかり方が全く違う。',
    preset: { elementCount: 500, enabledProps: [], autoStart: true },
    comparison: {
      left: { label: 'transform (Composite のみ)', enabledProps: ['transform'] },
      right: { label: 'width (Layout + Paint + Composite)', enabledProps: ['width'] },
    },
  },
  {
    id: 7,
    slug: 'low-spec-sim',
    title: '要素数を増やしたときの挙動',
    objective: '要素数を 2000 まで増やし、低スペック端末を模擬する。',
    observation: '軽いはずの transform でも、要素数が増えれば Composite が支配的になる。',
    preset: { elementCount: 2000, enabledProps: ['transform'], autoStart: true },
    focus: ['fps', 'frame_budget'],
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
