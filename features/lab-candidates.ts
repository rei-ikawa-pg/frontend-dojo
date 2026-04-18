/**
 * 検討中の鬼門一覧。Lab 化の構想段階にあるトピック。
 * - 用途: /roadmap ページで「検討中」セクションに分野別表示する
 * - 各候補は 1 行説明まで。Lab 昇格が決まったら `features/labs.ts` に移す
 * - 分野タグ(domain)は docs/08-lab-roadmap-phase2.md §2.1 副軸と整合
 * - 難易度タグ(difficulty)は候補段階では暫定値。Lab 化時に実装を経て再確定する
 */

import type { LabDifficulty } from './labs'

export type LabDomain =
  | 'browser-runtime'
  | 'react-nextjs'
  | 'css'
  | 'performance'
  | 'network'
  | 'security'
  | 'accessibility'

export const DOMAIN_LABEL: Record<LabDomain, string> = {
  'browser-runtime': 'ブラウザランタイム',
  'react-nextjs': 'React・Next.js',
  css: 'CSS',
  performance: 'パフォーマンス',
  network: 'ネットワーク',
  security: 'セキュリティ',
  accessibility: 'アクセシビリティ',
}

export type LabCandidate = {
  id: string
  title: string
  domain: LabDomain
  difficulty: LabDifficulty
  description: string
}

export const LAB_CANDIDATES: readonly LabCandidate[] = [
  // ブラウザランタイム
  {
    id: 'stale-closure',
    title: 'Stale Closure の罠',
    domain: 'browser-runtime',
    difficulty: '二段',
    description: 'useEffect 依存配列が古い値を見てしまう仕組みを分解する。',
  },
  {
    id: 'layout-thrashing',
    title: 'Layout Thrashing の原理',
    domain: 'browser-runtime',
    difficulty: '二段',
    description: 'read / write の順序崩れが起きる瞬間を LoAF で捉える。',
  },
  // React・Next.js
  {
    id: 'nextjs-cache',
    title: 'Next.js キャッシュ四重奏',
    domain: 'react-nextjs',
    difficulty: '三段',
    description: 'Request Memo / Data / Full Route / Router を一気通貫で光らせる。',
  },
  {
    id: 'hydration-detective',
    title: 'Hydration の探偵',
    domain: 'react-nextjs',
    difficulty: '三段',
    description: 'SSR の影と CSR の実体が、どこでズレたのかを diff で追う。',
  },
  {
    id: 'rsc-boundary',
    title: "RSC 境界 / 'use client'",
    domain: 'react-nextjs',
    difficulty: '三段',
    description: 'サーバ・クライアントの境界とシリアライズの制約を触って掴む。',
  },
  // CSS
  {
    id: 'stacking-context',
    title: 'スタッキングコンテキストの森',
    domain: 'css',
    difficulty: '初段',
    description: 'z-index 9999 が効かない理由を、文脈の木を歩いて掴む。',
  },
  {
    id: 'flex-grid-sizing',
    title: 'Flexbox・Grid の intrinsic sizing',
    domain: 'css',
    difficulty: '二段',
    description: 'min-content / max-content の解決順を実測で追う。',
  },
  {
    id: 'cascade-layer',
    title: 'カスケードと @layer',
    domain: 'css',
    difficulty: '二段',
    description: '現代的な詳細度の優先順位と @layer の効き所を可視化する。',
  },
  // パフォーマンス
  {
    id: 'inp-autopsy',
    title: 'INP の解剖室',
    domain: 'performance',
    difficulty: '三段',
    description: '1 クリックを input delay / processing / presentation に切る。',
  },
  // ネットワーク
  {
    id: 'http-cache',
    title: 'HTTP キャッシュの読み解き',
    domain: 'network',
    difficulty: '二段',
    description: 'Cache-Control / ETag / stale-while-revalidate の相互作用を触る。',
  },
  {
    id: 'cookie-attributes',
    title: 'Cookie 属性の実習',
    domain: 'network',
    difficulty: '二段',
    description: 'SameSite / Secure / HttpOnly の挙動差分を別オリジンで試す。',
  },
  // セキュリティ
  {
    id: 'xss-entry',
    title: 'XSS の入口',
    domain: 'security',
    difficulty: '二段',
    description: 'DOM-based と framework bypass の現実を、隔離 iframe で見る。',
  },
  // アクセシビリティ
  {
    id: 'focus-management',
    title: 'フォーカス管理',
    domain: 'accessibility',
    difficulty: '二段',
    description: 'Modal / Skip link / aria-live の実挙動をキーボードで試す。',
  },
] as const

/** /roadmap での分野表示順 */
export const DOMAIN_ORDER: ReadonlyArray<LabDomain> = [
  'browser-runtime',
  'react-nextjs',
  'css',
  'performance',
  'network',
  'security',
  'accessibility',
]
