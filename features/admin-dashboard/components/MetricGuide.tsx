/**
 * 各指標セクションの冒頭に添える「見方ガイド」。
 *
 * 管理画面を初めて開いた人でも「何を見るセクションなのか」がすぐ分かるよう、
 * 短い補足（2-3 行程度）を統一書式で表示する。
 */

import type { ReactNode } from 'react'

type MetricGuideProps = {
  title?: string
  children: ReactNode
}

export function MetricGuide({ title = '見方', children }: MetricGuideProps) {
  return (
    <div className="mb-4 border border-rule-dim bg-card/60 p-4 text-xs leading-relaxed text-ink-500">
      <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-ink-400">{title}</div>
      <div className="space-y-1 text-ink-500">{children}</div>
    </div>
  )
}
