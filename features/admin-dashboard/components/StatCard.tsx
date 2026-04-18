/**
 * ダッシュボードの指標カード。
 * Recharts の周辺で使う、数値と簡単な文脈（期間・説明）を表示するだけの小さなコンポーネント。
 */

import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: ReactNode
  sub?: ReactNode
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="border border-rule-dim bg-card p-4">
      <div className="text-[10px] uppercase tracking-[0.24em] text-ink-400">{label}</div>
      <div className="mt-2 tnum font-mincho text-2xl leading-none text-ink-900">{value}</div>
      {sub && <div className="mt-2 text-xs text-ink-500">{sub}</div>}
    </div>
  )
}
