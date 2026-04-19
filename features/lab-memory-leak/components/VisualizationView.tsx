/**
 * 可視化エリア: LeakController が直接 DOM に書き込むコンテナをホストする。
 * container ref は `forwardRef` ではなく、props で渡された ref に内部 div を接続する。
 */

'use client'

import type { RefObject } from 'react'
import type { LeakCounts } from '../engine/leakController'
import { useMemoryPlaygroundStore } from '../stores/playgroundStore'

type VisualizationViewProps = {
  containerRef: RefObject<HTMLDivElement | null>
  counts: LeakCounts
}

export function VisualizationView({ containerRef, counts }: VisualizationViewProps) {
  const isRunning = useMemoryPlaygroundStore((s) => s.isRunning)
  const total = counts.timers + counts.listeners + counts.detached + counts.closures

  return (
    <div className="relative overflow-hidden border border-rule-dim bg-ink-050/50">
      <div className="absolute inset-x-4 top-3 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-ink-400">
        <span>§ Retained References</span>
        <span className="tnum text-ink-300">{total} live</span>
      </div>
      <div
        ref={containerRef}
        role="presentation"
        aria-live="polite"
        className="flex min-h-[220px] flex-wrap content-start gap-1 p-4 pt-10 md:min-h-[260px]"
      />
      {isRunning && (
        <div className="absolute bottom-3 right-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-vermilion">
          <span className="block h-1.5 w-1.5 animate-pulse bg-vermilion" />
          自動サイクル中
        </div>
      )}
    </div>
  )
}
