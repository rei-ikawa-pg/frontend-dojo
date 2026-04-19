/**
 * ダッシュボードの指標カード。
 *
 * Lab の MetricCard と完全に同じ責務（label + value + 補足）なので
 * `MetricCard` への薄いラッパとして実装している。
 *
 * 後方互換のため `sub` プロップ名を維持している。
 */

import type { ReactNode } from 'react'
import { MetricCard } from '@/components/lab/MetricCard'

type StatCardProps = {
  label: string
  value: ReactNode
  sub?: ReactNode
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return <MetricCard label={label} value={value} note={sub} />
}
