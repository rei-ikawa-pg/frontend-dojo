/**
 * 計測値の小さなカード（label + value + 補足）。
 *
 * 各 Lab の MetricsDisplay と admin ダッシュボードで重複していた
 * `Metric` / `Stat` / `StatCard` の構造を 1 箇所に集約した。
 *
 * variants:
 *   - size: lab デフォルト = 'md'（text-2xl）/ 'sm'（text-xl）
 *   - tone: 'default' | 'warn' （warn 時は値を vermilion で表示）
 *   - focus: チュートリアルで「今注目させたい」カードに付ける朱色枠と
 *            "FOCUS" バッジ
 *
 * 既存呼び出し箇所:
 *   - features/lab-render/components/MetricsDisplay.tsx の Metric
 *   - features/lab-memory-leak/components/MetricsDisplay.tsx の Metric
 *   - features/lab-rerender-map/components/MetricsDisplay.tsx の Metric
 *   - features/admin-dashboard/components/StatCard.tsx
 *   - app/admin/rum/page.tsx の Stat
 */

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type MetricCardProps = {
  label: string
  value: ReactNode
  /** 小さな補足（admin の "≤ 2.5s" や、Lab の "非対応" など） */
  note?: ReactNode
  /** チュートリアルで強調する場合に true */
  focus?: boolean
  /** 異常値を朱色で示したい場合に true */
  warn?: boolean
  /** 'md' = lab デフォルト / 'sm' = 密度高めの箇所 */
  size?: 'sm' | 'md'
}

export function MetricCard({
  label,
  value,
  note,
  focus = false,
  warn = false,
  size = 'md',
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'relative border bg-card transition-colors',
        size === 'md' ? 'p-4' : 'p-3',
        focus ? 'border-vermilion/70 bg-vermilion/5' : 'border-rule-dim',
      )}
    >
      {focus && (
        <span
          aria-hidden
          className="absolute -top-2 left-3 bg-background px-1 text-[11px] uppercase tracking-[0.2em] text-vermilion"
        >
          FOCUS
        </span>
      )}
      <div className="text-[11px] uppercase tracking-[0.24em] text-ink-400">{label}</div>
      <div
        className={cn(
          'tnum font-mincho leading-none',
          size === 'md' ? 'mt-2 text-2xl' : 'mt-1.5 text-xl',
          warn || focus ? 'text-vermilion' : 'text-ink-900',
        )}
      >
        {value}
      </div>
      {note && (
        <div
          className={cn(
            size === 'md' ? 'mt-2 text-xs text-ink-500' : 'mt-1 text-[10px] text-ink-300',
          )}
        >
          {note}
        </div>
      )}
    </div>
  )
}
