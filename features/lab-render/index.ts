export const LAB_RENDER_META = {
  id: 'render',
  slug: 'render',
  title: 'レンダリングパイプライン可視化',
  shortTitle: 'Lab 1: レンダリング',
  description:
    'ブラウザが1フレームをどう描くかを、実DOMを操作しながら体験する。Layout / Paint / Composite の差を触って理解する。',
  status: 'published',
  difficulty: '初段',
  order: 1,
  path: '/lab/render',
} as const

export type { FrameMetricsSnapshot, FrameSample, PhaseImpact } from './engine'
export {
  aggregateImpact,
  cssTriggersMap,
  FpsMeter,
  FrameObserver,
  getPhaseImpact,
  RenderEngine,
} from './engine'
export { useFrameMetrics, useRenderEngine } from './hooks'
export {
  ELEMENT_COUNT_DEFAULT,
  ELEMENT_COUNT_MAX,
  ELEMENT_COUNT_MIN,
  PLAYGROUND_PROPS,
  type PlaygroundProp,
  usePlaygroundStore,
} from './stores/playgroundStore'
