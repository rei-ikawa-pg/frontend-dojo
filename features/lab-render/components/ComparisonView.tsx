/**
 * Before/After 比較レーン。
 *
 * - 左右に独立した RenderEngine インスタンスを持つ（要素数は共通、enabled props は別）
 * - playgroundStore.isRunning で左右同時に start/stop する
 *   （要素数・props は props 経由で受け取り、store には触らない）
 * - LoAF の実測値はページ全体で合算されるため、このモードでは MetricsDisplay を使わず
 *   「目で見た滑らかさ」の比較に焦点を絞る方針（TutorialMode 側で MetricsDisplay を非表示にする）
 */

'use client'

import { useEffect, useRef } from 'react'
import { RenderEngine } from '../engine/renderer'
import { type PlaygroundProp, usePlaygroundStore } from '../stores/playgroundStore'

type LaneConfig = {
  label: string
  enabledProps: ReadonlyArray<PlaygroundProp>
}

type ComparisonViewProps = {
  elementCount: number
  left: LaneConfig
  right: LaneConfig
}

export function ComparisonView({ elementCount, left, right }: ComparisonViewProps) {
  const isRunning = usePlaygroundStore((s) => s.isRunning)
  const leftRef = useRef<HTMLDivElement | null>(null)
  const rightRef = useRef<HTMLDivElement | null>(null)
  const leftEngineRef = useRef<RenderEngine | null>(null)
  const rightEngineRef = useRef<RenderEngine | null>(null)

  // マウント時に 2 つのエンジンを生成、アンマウント時に破棄
  useEffect(() => {
    if (leftRef.current) {
      leftEngineRef.current = new RenderEngine({ container: leftRef.current })
    }
    if (rightRef.current) {
      rightEngineRef.current = new RenderEngine({ container: rightRef.current })
    }
    return () => {
      leftEngineRef.current?.destroy()
      rightEngineRef.current?.destroy()
      leftEngineRef.current = null
      rightEngineRef.current = null
    }
  }, [])

  // 要素数はまず左右共通で反映
  useEffect(() => {
    leftEngineRef.current?.setElementCount(elementCount)
    rightEngineRef.current?.setElementCount(elementCount)
  }, [elementCount])

  useEffect(() => {
    leftEngineRef.current?.setEnabledProperties(left.enabledProps)
  }, [left.enabledProps])

  useEffect(() => {
    rightEngineRef.current?.setEnabledProperties(right.enabledProps)
  }, [right.enabledProps])

  useEffect(() => {
    if (isRunning) {
      leftEngineRef.current?.start()
      rightEngineRef.current?.start()
    } else {
      leftEngineRef.current?.stop()
      rightEngineRef.current?.stop()
    }
  }, [isRunning])

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Lane ref={leftRef} label={left.label} sub="LEFT" />
      <Lane ref={rightRef} label={right.label} sub="RIGHT" />
    </div>
  )
}

type LaneProps = {
  label: string
  sub: string
  ref: React.RefObject<HTMLDivElement | null>
}

function Lane({ label, sub, ref }: LaneProps) {
  return (
    <div className="relative overflow-hidden border border-rule-dim bg-ink-050/50">
      <div className="absolute inset-x-4 top-3 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.24em] text-ink-400">
        <span className="text-vermilion">§ {sub}</span>
        <span className="truncate font-mono text-ink-500" title={label}>
          {label}
        </span>
      </div>
      <div
        ref={ref}
        role="presentation"
        className="flex min-h-[320px] flex-wrap content-start gap-1 p-4 pt-10 md:min-h-[400px]"
      />
    </div>
  )
}
