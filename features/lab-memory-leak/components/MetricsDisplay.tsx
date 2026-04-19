/**
 * Lab 2 のメトリクス表示エリア。
 *
 * 上段: ヒープ / DOM / Retained 参照のカード 4 つ
 * 下段: MemoryChart
 *
 * focus prop はチュートリアル側で「このステップで注目するメトリクス」を強調する。
 */

'use client'

import { useEffect, useState } from 'react'
import { MetricCard } from '@/components/lab/MetricCard'
import { useRumCustomMetric } from '@/features/rum'
import { cn } from '@/lib/utils'
import type { LeakCounts } from '../engine/leakController'
import { isMemoryApiAvailable } from '../engine/memoryReader'
import { useMemoryMetrics } from '../hooks/useMemoryMetrics'
import { useMemoryPlaygroundStore } from '../stores/playgroundStore'
import type { MetricFocus } from '../tutorial/steps'
import { MemoryChart } from './MemoryChart'

type MetricsDisplayProps = {
  counts: LeakCounts
  focus?: ReadonlyArray<MetricFocus>
}

export function MetricsDisplay({ counts, focus }: MetricsDisplayProps) {
  const isRunning = useMemoryPlaygroundStore((s) => s.isRunning)
  const leakType = useMemoryPlaygroundStore((s) => s.leakType)
  const mitigation = useMemoryPlaygroundStore((s) => s.mitigation)
  const emit = useRumCustomMetric()
  // performance.memory 有無は環境依存のため、SSR では一律 false として扱い、
  // マウント後に実測値に差し替える。こうしないと Hydration ミスマッチが発生する。
  const [available, setAvailable] = useState(false)
  useEffect(() => {
    setAvailable(isMemoryApiAvailable())
  }, [])

  const getRetained = () => counts.timers + counts.listeners + counts.detached + counts.closures

  const { samples } = useMemoryMetrics({ enabled: true, getRetainedCount: getRetained })
  const latest = samples[samples.length - 1]
  const usedMb = latest?.used != null ? (latest.used / 1024 / 1024).toFixed(1) : null
  const focused = new Set(focus ?? [])
  const retained = getRetained()

  // isRunning 中は 1 秒おきに heap サイズを RUM に送る（プライバシー配慮: 生 URL は送らない）
  useEffect(() => {
    if (!isRunning) return
    const id = window.setInterval(() => {
      emit({
        metric_name: 'lab.memory.heap_mb',
        metric_value: latest?.used != null ? latest.used / 1024 / 1024 : 0,
        lab_id: 'memory-leak',
        metadata: {
          leak_type: leakType,
          mitigation,
          dom_nodes: latest?.domNodes ?? 0,
          retained,
        },
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [isRunning, latest, leakType, mitigation, retained, emit])

  return (
    <section aria-label="メトリクス" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          size="sm"
          label="Heap"
          value={usedMb ? `${usedMb} MB` : '—'}
          note={available ? undefined : '非対応'}
          focus={focused.has('heap')}
        />
        <MetricCard
          size="sm"
          label="DOM Nodes"
          value={latest?.domNodes != null ? String(latest.domNodes) : '—'}
          focus={focused.has('dom_nodes')}
        />
        <MetricCard
          size="sm"
          label="Retained"
          value={String(retained)}
          focus={focused.has('retained')}
        />
        <MetricCard
          size="sm"
          label="Timers / Listeners"
          value={`${counts.timers} / ${counts.listeners}`}
          focus={focused.has('retained')}
        />
      </div>

      <div className={cn('transition-colors', focused.has('chart') && 'ring-1 ring-vermilion/60')}>
        <MemoryChart samples={samples} enabled={isRunning} />
      </div>

      {!available && (
        <p className="text-[11px] leading-relaxed text-ink-400">
          このブラウザでは <code className="font-mono text-ink-500">performance.memory</code> が
          未対応のため、ヒープ使用量は計測されません (Chromium 系のみ対応)。 Timer / Listener /
          Detached / Closure のカウントは動作します。
        </p>
      )}
    </section>
  )
}
