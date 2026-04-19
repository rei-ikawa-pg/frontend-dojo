export const LAB_MEMORY_LEAK_META = {
  id: 'memory-leak',
  slug: 'memory-leak',
  title: 'メモリリーク稽古場',
  shortTitle: 'Lab 2: メモリリーク',
  description:
    'Timer / Listener / Detached DOM / Closure の 4 種類のリークを意図的に再現し、performance.memory の階段状の増加を観察する稽古場。',
  status: 'published',
  difficulty: '二段',
  order: 2,
  path: '/lab/memory-leak',
} as const

export type { LeakCounts } from './engine/leakController'
export { LeakController } from './engine/leakController'
export {
  countAttachedNodes,
  isMemoryApiAvailable,
  readHeapUsed,
  tryForceGc,
} from './engine/memoryReader'
export type { HoldSize, LeakType, MemorySample, Mitigation } from './engine/types'
export { useLeakController, useMemoryMetrics } from './hooks'
export {
  CYCLE_COUNT_DEFAULT,
  CYCLE_COUNT_MAX,
  CYCLE_COUNT_MIN,
  HOLD_SIZE_LABEL,
  HOLD_SIZES,
  LEAK_TYPE_LABEL,
  LEAK_TYPES,
  MITIGATION_LABEL,
  MITIGATIONS,
  useMemoryPlaygroundStore,
} from './stores/playgroundStore'
