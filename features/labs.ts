import { LAB_RENDER_META } from './lab-render'

export type LabStatus = 'published' | 'phase-2' | 'phase-3' | 'formal'

export type LabMeta = {
  id: string
  slug: string
  title: string
  shortTitle: string
  description: string
  status: LabStatus
  order: number
  path: string
}

export const LABS: readonly LabMeta[] = [
  LAB_RENDER_META,
  {
    id: 'memory',
    slug: 'memory',
    title: 'メモリリーク稽古場',
    shortTitle: 'Lab 2: メモリリーク',
    description:
      'SPA でよくあるメモリリークの原因を、意図的に作って・観測して・直す。heap snapshot の読み方も学ぶ。',
    status: 'phase-2',
    order: 2,
    path: '/lab/memory',
  },
  {
    id: 'jank',
    slug: 'jank',
    title: 'スクロールジャンク稽古場',
    shortTitle: 'Lab 3: スクロールジャンク',
    description:
      '「なぜスクロールが引っかかるのか」を passive listener / rAF / will-change の観点で体験する。',
    status: 'phase-3',
    order: 3,
    path: '/lab/jank',
  },
  {
    id: 'react-rerender',
    slug: 'react-rerender',
    title: 'React 再レンダー稽古場',
    shortTitle: 'Lab 4: React再レンダー',
    description: 'memo / useMemo / Context の再レンダー挙動を、実際のツリーで可視化する。',
    status: 'formal',
    order: 4,
    path: '/lab/react-rerender',
  },
  {
    id: 'canvas',
    slug: 'canvas',
    title: 'Canvas / WebGL 稽古場',
    shortTitle: 'Lab 5: Canvas/WebGL',
    description: '2D / WebGL の描画パイプラインと DOM との違いを体感する。',
    status: 'formal',
    order: 5,
    path: '/lab/canvas',
  },
  {
    id: 'event-loop',
    slug: 'event-loop',
    title: 'イベントループ稽古場',
    shortTitle: 'Lab 6: イベントループ',
    description: 'microtask / macrotask / requestIdleCallback の優先順位を可視化する。',
    status: 'formal',
    order: 6,
    path: '/lab/event-loop',
  },
] as const
