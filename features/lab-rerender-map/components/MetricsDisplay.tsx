/**
 * Lab 3 のメトリクス表示。
 * - カード: Total renders / Root clicks / Flash latency / Memo count
 * - テーブル: ノード別の render 回数
 */

'use client'

import { useEffect, useMemo } from 'react'
import { MetricCard } from '@/components/lab/MetricCard'
import { useRumCustomMetric } from '@/features/rum'
import { cn } from '@/lib/utils'
import { buildTree, collectIds } from '../engine/tree'
import { useRenderStats } from '../hooks/useRenderStats'
import { useRerenderPlaygroundStore } from '../stores/playgroundStore'
import type { MetricFocus } from '../tutorial/steps'

type MetricsDisplayProps = {
  focus?: ReadonlyArray<MetricFocus>
}

export function MetricsDisplay({ focus }: MetricsDisplayProps = {}) {
  const stats = useRenderStats()
  const tick = useRerenderPlaygroundStore((s) => s.tick)
  const depth = useRerenderPlaygroundStore((s) => s.depth)
  const fanout = useRerenderPlaygroundStore((s) => s.fanout)
  const memoIds = useRerenderPlaygroundStore((s) => s.memoIds)
  const propKind = useRerenderPlaygroundStore((s) => s.propKind)
  const stateSource = useRerenderPlaygroundStore((s) => s.stateSource)
  const emit = useRumCustomMetric()

  const ids = useMemo(
    () => collectIds(buildTree({ depth, fanout, memoIds })),
    [depth, fanout, memoIds],
  )

  const totalRenders = Object.values(stats.counts).reduce((a, b) => a + b, 0)
  const memoCount = memoIds.size
  const focused = new Set(focus ?? [])

  useEffect(() => {
    if (tick === 0) return
    emit({
      metric_name: 'lab.rerender.tick',
      metric_value: tick,
      lab_id: 'rerender-map',
      metadata: {
        depth,
        fanout,
        memo_count: memoCount,
        prop_kind: propKind,
        state_source: stateSource,
        total_renders: totalRenders,
      },
    })
  }, [tick, depth, fanout, memoCount, propKind, stateSource, totalRenders, emit])

  return (
    <section aria-label="メトリクス" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard size="sm" label="Clicks" value={String(tick)} />
        <MetricCard
          size="sm"
          label="Total renders"
          value={String(totalRenders)}
          focus={focused.has('total_renders')}
        />
        <MetricCard size="sm" label="Memo nodes" value={`${memoCount} / ${ids.length}`} />
        <MetricCard size="sm" label="State src" value={stateSource} />
      </div>

      <div
        className={cn(
          'border border-rule-dim bg-card p-4',
          focused.has('table') && 'ring-1 ring-vermilion/60',
        )}
      >
        <h3 className="mb-3 text-[11px] uppercase tracking-[0.24em] text-ink-400">
          § Per-node render count
        </h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-ink-400">
              <th className="py-1">Node</th>
              <th className="py-1">memo</th>
              <th className="py-1 text-right tnum">renders</th>
            </tr>
          </thead>
          <tbody>
            {ids.map((id) => (
              <tr key={id} className="border-t border-rule-dim/60">
                <td className="py-1 font-mono text-ink-900">{id}</td>
                <td className="py-1">
                  {memoIds.has(id) ? (
                    <span className="text-sig-ok">●</span>
                  ) : (
                    <span className="text-ink-300">—</span>
                  )}
                </td>
                <td className="py-1 text-right tnum text-ink-500">{stats.counts[id] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
