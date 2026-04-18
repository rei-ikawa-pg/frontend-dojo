/**
 * メトリクス表示エリア。
 * - FPS / フレームバジェット消費
 * - 理論 (CSS Triggers) と実測 (LoAF) の並置テーブル
 * - RUM への FPS 送信もここでトリガーする（1 秒ごと、isRunning 中のみ）
 *
 * focus prop:
 *   チュートリアルで「このステップで注目すべきメトリクス」を強調する。
 *   渡されたキーに対応するカード / テーブルに vermilion のリング + "FOCUS" バッジを付ける。
 */

'use client'

import { useEffect } from 'react'
import { usePlaygroundStore } from '@/features/lab-render'
import { aggregateImpact } from '@/features/lab-render/engine/cssTriggersData'
import { useFrameMetrics } from '@/features/lab-render/hooks/useFrameMetrics'
import type { MetricFocus } from '@/features/lab-render/tutorial/steps'
import { useRumCustomMetric } from '@/features/rum'
import { cn } from '@/lib/utils'
import { TheoryVsActual } from './TheoryVsActual'

/** 60fps = 16.67ms / frame */
const FRAME_BUDGET_MS = 1000 / 60

type MetricsDisplayProps = {
  focus?: ReadonlyArray<MetricFocus>
}

export function MetricsDisplay({ focus }: MetricsDisplayProps = {}) {
  const { fps, lastFrame } = useFrameMetrics()
  const enabledProps = usePlaygroundStore((s) => s.enabledProps)
  const isRunning = usePlaygroundStore((s) => s.isRunning)
  const elementCount = usePlaygroundStore((s) => s.elementCount)
  const emit = useRumCustomMetric()

  const theoretical = aggregateImpact(enabledProps)
  const focused = new Set(focus ?? [])

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
        <Metric label="FPS" value={isRunning ? String(fps) : '—'} focus={focused.has('fps')} />
        <Metric
          label="Frame Budget"
          value={
            lastFrame
              ? `${lastFrame.totalDuration.toFixed(1)} / ${FRAME_BUDGET_MS.toFixed(1)}ms`
              : '—'
          }
          warn={Boolean(lastFrame && lastFrame.totalDuration > FRAME_BUDGET_MS)}
          focus={focused.has('frame_budget')}
        />
        <Metric
          label="Style+Layout"
          value={lastFrame ? `${lastFrame.styleLayoutDuration.toFixed(1)}ms` : '—'}
          focus={focused.has('style_layout')}
        />
        <Metric
          label="Rendering"
          value={lastFrame ? `${lastFrame.renderingDuration.toFixed(1)}ms` : '—'}
          focus={focused.has('rendering')}
        />
      </div>

      <div
        className={cn(
          'transition-colors',
          focused.has('theory_vs_actual') && 'ring-1 ring-vermilion/60',
        )}
      >
        <TheoryVsActual theoretical={theoretical} lastFrame={lastFrame} />
      </div>
    </section>
  )
}

type MetricProps = { label: string; value: string; warn?: boolean; focus?: boolean }

function Metric({ label, value, warn, focus }: MetricProps) {
  return (
    <div
      className={cn(
        'relative border bg-card p-4 transition-colors',
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
          'mt-2 tnum font-mincho text-2xl leading-none',
          warn ? 'text-vermilion' : focus ? 'text-vermilion' : 'text-ink-900',
        )}
      >
        {value}
      </div>
    </div>
  )
}
