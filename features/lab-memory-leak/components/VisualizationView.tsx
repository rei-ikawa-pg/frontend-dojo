/**
 * 可視化エリア: LeakController が直接 DOM に書き込むコンテナをホストする。
 * container ref は `forwardRef` ではなく、props で渡された ref に内部 div を接続する。
 *
 * カード底部に Run アクションバー（1 サイクル実行 / 自動実行 / リセット）を配置し、
 * 「原因（ボタン）と結果（ノード追加・解放）を同じ枠で観察できる」UX を採る。
 * onCycle / onRelease は LeakController を保持する親（Tutorial/Playground）から渡される。
 */

'use client'

import { ArrowCounterClockwise, Pause, Play, Target } from '@phosphor-icons/react'
import type { RefObject } from 'react'
import { Button } from '@/components/ui/button'
import type { LeakCounts } from '../engine/leakController'
import { useMemoryPlaygroundStore } from '../stores/playgroundStore'

type VisualizationViewProps = {
  containerRef: RefObject<HTMLDivElement | null>
  counts: LeakCounts
  onCycle: () => void
  onRelease: () => void
}

export function VisualizationView({
  containerRef,
  counts,
  onCycle,
  onRelease,
}: VisualizationViewProps) {
  const isRunning = useMemoryPlaygroundStore((s) => s.isRunning)
  const start = useMemoryPlaygroundStore((s) => s.start)
  const stop = useMemoryPlaygroundStore((s) => s.stop)
  const reset = useMemoryPlaygroundStore((s) => s.reset)
  const total = counts.timers + counts.listeners + counts.detached + counts.closures

  return (
    <div className="relative overflow-hidden border border-rule-dim bg-ink-050/50">
      <div className="absolute inset-x-4 top-3 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-ink-400">
        <span>
          § Retained References{' '}
          <span className="text-ink-500 normal-case tracking-normal">／ 保持中の参照</span>
        </span>
        <span className="tnum text-ink-300">{total} live</span>
      </div>
      <div
        ref={containerRef}
        role="presentation"
        aria-live="polite"
        className="flex h-[220px] flex-wrap content-start gap-1 overflow-y-auto p-4 pt-10 [contain:layout] md:h-[260px]"
      />
      {isRunning && (
        <div className="absolute right-4 top-9 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-vermilion">
          <span className="block h-1.5 w-1.5 animate-pulse bg-vermilion" />
          自動サイクル中
        </div>
      )}
      <div className="flex border-t border-rule-dim">
        <Button
          type="button"
          variant="outline"
          onClick={onCycle}
          className="h-10 flex-1 rounded-none border-0 border-r border-rule-dim"
        >
          <Target size={14} weight="bold" className="mr-2" />1 サイクル実行
        </Button>
        {isRunning ? (
          <Button
            type="button"
            variant="outline"
            onClick={stop}
            className="h-10 flex-1 rounded-none border-0 border-r border-rule-dim"
          >
            <Pause size={14} weight="bold" className="mr-2" />
            自動停止
          </Button>
        ) : (
          <Button
            type="button"
            onClick={start}
            className="h-10 flex-1 rounded-none border-0 border-r border-rule-dim"
          >
            <Play size={14} weight="bold" className="mr-2" />
            自動実行
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            stop()
            onRelease()
            reset()
          }}
          className="h-10 rounded-none px-4"
        >
          <ArrowCounterClockwise size={14} weight="bold" className="mr-2" />
          リセット
        </Button>
      </div>
    </div>
  )
}
