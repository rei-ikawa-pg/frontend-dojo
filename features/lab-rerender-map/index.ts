export const LAB_RERENDER_MAP_META = {
  id: 'rerender-map',
  slug: 'rerender-map',
  title: '再レンダリングの地図',
  shortTitle: 'Lab 3: 再レンダリング',
  description:
    '親の state 更新がコンポーネントツリーをどう伝播するかを可視化し、memo / 参照安定性 / Context / 派生 state の罠を手元で検出する稽古場。',
  status: 'published',
  difficulty: '二段',
  order: 3,
  path: '/lab/rerender-map',
} as const

export type { RenderStats, TreeNode, TreeSpec } from './engine'
export { buildTree, collectIds, renderTracker } from './engine'
export { useRenderStats } from './hooks'
export {
  DEPTH_DEFAULT,
  DEPTH_MAX,
  DEPTH_MIN,
  FANOUT_DEFAULT,
  FANOUT_MAX,
  FANOUT_MIN,
  PROP_KIND_LABEL,
  PROP_KINDS,
  type PropKind,
  STATE_SOURCE_LABEL,
  STATE_SOURCES,
  type StateSource,
  useRerenderPlaygroundStore,
} from './stores/playgroundStore'
