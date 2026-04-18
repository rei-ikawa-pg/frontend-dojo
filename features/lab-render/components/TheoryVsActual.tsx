/**
 * CSS Triggers（理論）と LoAF（実測）の突き合わせテーブル。
 * - Paint と Composite は LoAF では合算でしか取得できないので "Rendering" として表示
 * - 実測 0ms に近ければフェーズが走っていないと見做す（教材上の簡略化）
 */

'use client'

import type { PhaseImpact } from '@/features/lab-render/engine/cssTriggersData'
import type { FrameSample } from '@/features/lab-render/engine/types'
import { cn } from '@/lib/utils'

type Props = {
  theoretical: PhaseImpact
  lastFrame: FrameSample | null
}

const EPSILON_MS = 0.5

export function TheoryVsActual({ theoretical, lastFrame }: Props) {
  const actualLayout = (lastFrame?.styleLayoutDuration ?? 0) > EPSILON_MS
  const actualRendering = (lastFrame?.renderingDuration ?? 0) > EPSILON_MS

  return (
    <div className="border border-rule-dim bg-card">
      <div className="border-b border-rule-dim px-4 py-3">
        <h3 className="text-[10px] uppercase tracking-[0.24em] text-ink-400">§ Theory vs Actual</h3>
        <p className="mt-1 text-xs text-ink-500">
          CSS プロパティから理論上走るべきフェーズ（理論）と、LoAF API の実測を並べています。
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-rule-dim">
            <th className="px-4 py-2 text-left text-[10px] font-normal uppercase tracking-[0.2em] text-ink-400">
              Phase
            </th>
            <th className="px-4 py-2 text-center text-[10px] font-normal uppercase tracking-[0.2em] text-ink-400">
              理論
            </th>
            <th className="px-4 py-2 text-center text-[10px] font-normal uppercase tracking-[0.2em] text-ink-400">
              実測
            </th>
            <th className="px-4 py-2 text-right text-[10px] font-normal uppercase tracking-[0.2em] text-ink-400">
              時間
            </th>
          </tr>
        </thead>
        <tbody>
          <Row
            phase="Layout"
            theoretical={theoretical.layout}
            actual={actualLayout}
            time={lastFrame ? `${lastFrame.styleLayoutDuration.toFixed(1)}ms` : '—'}
          />
          <Row
            phase="Paint + Composite"
            theoretical={theoretical.paint || theoretical.composite}
            actual={actualRendering}
            time={lastFrame ? `${lastFrame.renderingDuration.toFixed(1)}ms` : '—'}
            hint="LoAF では Paint と Composite を分離できないため合算値"
          />
        </tbody>
      </table>
    </div>
  )
}

type RowProps = {
  phase: string
  theoretical: boolean
  actual: boolean
  time: string
  hint?: string
}

function Row({ phase, theoretical, actual, time, hint }: RowProps) {
  return (
    <tr className="border-b border-rule-dim last:border-b-0">
      <td className="px-4 py-3">
        <div className="font-mincho text-ink-900">{phase}</div>
        {hint && <div className="mt-0.5 text-[10px] text-ink-400">{hint}</div>}
      </td>
      <td className="px-4 py-3 text-center">
        <Mark on={theoretical} />
      </td>
      <td className="px-4 py-3 text-center">
        <Mark on={actual} />
      </td>
      <td className="px-4 py-3 text-right tnum text-ink-900">{time}</td>
    </tr>
  )
}

function Mark({ on }: { on: boolean }) {
  return (
    <span
      role="img"
      aria-label={on ? '走った' : '走らない'}
      className={cn(
        'inline-flex h-6 w-6 items-center justify-center border text-xs font-mono',
        on ? 'border-vermilion/70 bg-vermilion/10 text-vermilion' : 'border-rule-dim text-ink-400',
      )}
    >
      {on ? '○' : '×'}
    </span>
  )
}
