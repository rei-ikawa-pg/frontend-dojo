/**
 * メトリクス表示エリア。
 * - FPS / フレームバジェット消費
 * - 理論 (CSS Triggers) と実測 (LoAF) の並置テーブル
 * - RUM への FPS 送信もここでトリガーする（1 秒ごと、isRunning 中のみ）
 */

'use client'

import { useEffect } from 'react'
import { usePlaygroundStore } from '@/features/lab-render'
import { useFrameMetrics } from '@/features/lab-render/hooks/useFrameMetrics'
import { aggregateImpact } from '@/features/lab-render/engine/cssTriggersData'
import { useRumCustomMetric } from '@/features/rum'
import { TheoryVsActual } from './TheoryVsActual'

/** 60fps = 16.67ms / frame */
const FRAME_BUDGET_MS = 1000 / 60

export function MetricsDisplay() {
  const { fps, lastFrame } = useFrameMetrics()
  const enabledProps = usePlaygroundStore((s) => s.enabledProps)
  const isRunning = usePlaygroundStore((s) => s.isRunning)
  const elementCount = usePlaygroundStore((s) => s.elementCount)
  const emit = useRumCustomMetric()

  const theoretical = aggregateImpact(enabledProps)

  // isRunning 中は 1 秒おきに FPS と計測コンテキストを RUM に送る
  useEffect(() => {
    if (!isRunning) return
    const id = window.setInterval(() => {
      emit({
        metric_name: 'lab.render.fps',
        metric_value: fps,
        lab_id: 'render',
        metadata: {
          element_count: elementCount,
          props: Array.from(enabledProps).join(','),
        },
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [isRunning, fps, elementCount, enabledProps, emit])

  return (
    <section aria-label="メトリクス" className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric label="FPS" value={isRunning ? String(fps) : '—'} />
        <Metric
          label="Frame Budget"
          value={
            lastFrame
              ? `${lastFrame.totalDuration.toFixed(1)} / ${FRAME_BUDGET_MS.toFixed(1)}ms`
              : '—'
          }
          warn={Boolean(lastFrame && lastFrame.totalDuration > FRAME_BUDGET_MS)}
        />
        <Metric
          label="Style+Layout"
          value={lastFrame ? `${lastFrame.styleLayoutDuration.toFixed(1)}ms` : '—'}
        />
        <Metric
          label="Rendering"
          value={lastFrame ? `${lastFrame.renderingDuration.toFixed(1)}ms` : '—'}
        />
      </div>

      <TheoryVsActual theoretical={theoretical} lastFrame={lastFrame} />
    </section>
  )
}

type MetricProps = { label: string; value: string; warn?: boolean }

function Metric({ label, value, warn }: MetricProps) {
  return (
    <div className="border border-rule-dim bg-card p-4">
      <div className="text-[10px] uppercase tracking-[0.24em] text-ink-400">{label}</div>
      <div
        className={`mt-2 tnum font-mincho text-2xl leading-none ${
          warn ? 'text-vermilion' : 'text-ink-900'
        }`}
      >
        {value}
      </div>
    </div>
  )
}
