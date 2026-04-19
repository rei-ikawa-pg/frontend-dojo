import { LAB_MEMORY_LEAK_META } from './lab-memory-leak'
import { LAB_RENDER_META } from './lab-render'
import { LAB_RERENDER_MAP_META } from './lab-rerender-map'

export type LabStatus = 'published' | 'phase-2' | 'phase-3' | 'formal'

/**
 * 難易度タグ。docs/requirements/phase2-lab-roadmap.md §2.2 と整合:
 * - 初段: 前提 Lab なし、60-90 分、基礎概念
 * - 二段: 前提 Lab 1 つ程度、90-120 分、実務頻出
 * - 三段: 前提 Lab 2 つ以上 or 高抽象度、120 分〜、多層問題
 */
export type LabDifficulty = '初段' | '二段' | '三段'

export type LabMeta = {
  id: string
  slug: string
  title: string
  shortTitle: string
  description: string
  status: LabStatus
  difficulty: LabDifficulty
  order: number
  path: string
}

export const LABS: readonly LabMeta[] = [
  LAB_RENDER_META,
  LAB_MEMORY_LEAK_META,
  LAB_RERENDER_MAP_META,
  {
    id: 'event-loop',
    slug: 'event-loop',
    title: 'イベントループの内視鏡',
    shortTitle: 'Lab 4: イベントループ',
    description: 'microtask / macrotask / rAF / rIC の実行順序を予想 → 実測で検証する稽古場。',
    status: 'formal',
    difficulty: '二段',
    order: 4,
    path: '/lab/event-loop',
  },
  {
    id: 'stacking-context',
    slug: 'stacking-context',
    title: 'スタッキングコンテキストの森',
    shortTitle: 'Lab 5: スタッキング文脈',
    description:
      'z-index 9999 が効かない現象を、新スタッキング文脈の生成条件トグルで歩いて掴む稽古場。',
    status: 'phase-2',
    difficulty: '初段',
    order: 5,
    path: '/lab/stacking-context',
  },
  {
    id: 'nextjs-cache',
    slug: 'nextjs-cache',
    title: 'Next.js キャッシュ四重奏',
    shortTitle: 'Lab 6: Next.js キャッシュ',
    description:
      'Request Memo / Data / Full Route / Router の 4 層キャッシュを一気通貫で光らせる稽古場。',
    status: 'phase-3',
    difficulty: '三段',
    order: 6,
    path: '/lab/nextjs-cache',
  },
] as const
