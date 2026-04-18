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
import { PipelineDiagram } from './PipelineDiagram'

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
      <Lane ref={leftRef} label={left.label} sub="LEFT" enabledProps={left.enabledProps} />
      <Lane ref={rightRef} label={right.label} sub="RIGHT" enabledProps={right.enabledProps} />
    </div>
  )
}

type LaneProps = {
  label: string
  sub: string
  enabledProps: ReadonlyArray<PlaygroundProp>
  ref: React.RefObject<HTMLDivElement | null>
}

function Lane({ label, sub, enabledProps, ref }: LaneProps) {
  return (
    // 親 grid の items-stretch + flex-1 な canvas で、左右レーンの外枠・Canvas 領域が常に揃う。
    // ヘッダは 2 行固定 (ラベル行 + chip 行) で左右同じ高さにする。
    <div className="flex flex-col overflow-hidden border border-rule-dim bg-ink-050/50">
      <header className="flex flex-col gap-2 border-b border-rule-dim px-4 py-2.5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="whitespace-nowrap pt-px text-xs uppercase tracking-[0.24em] text-vermilion">
            § {sub}
          </span>
          {/* ラベルは省略せず折り返しを許可。
              左右で 1 行 / 2 行と折り返し数が変わると高さが揃わないので、
              min-h で常に 2 行分の縦スペースを確保して視覚的に等高にする */}
          <span className="block min-h-[2.75em] min-w-0 flex-1 font-mono text-xs leading-snug text-ink-500">
            {label}
          </span>
        </div>
        <PipelineDiagram variant="compact" props={enabledProps} />
      </header>
      <div
        ref={ref}
        role="presentation"
        className="flex min-h-[320px] flex-1 flex-wrap content-start gap-1 p-4 md:min-h-[400px]"
      />
    </div>
  )
}
