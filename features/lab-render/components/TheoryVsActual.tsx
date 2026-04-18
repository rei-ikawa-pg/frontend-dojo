/**
 * CSS Triggers（理論）と LoAF（実測）の突き合わせテーブル。
 * - Paint と Composite は LoAF では合算でしか取得できないので "Rendering" として表示
 * - 実測 0ms に近ければフェーズが走っていないと見做す（教材上の簡略化）
 * - 「理論と実測が一致するか」が最大の学びなので、判定列を設けて明示する
 */

'use client'

import { CheckCircle, Minus, WarningCircle } from '@phosphor-icons/react'
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
  const hasMeasurement = lastFrame !== null

  return (
    <div className="border border-rule-dim bg-card">
      <div className="flex flex-col gap-3 border-b border-rule-dim px-4 py-4">
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.24em] text-ink-400">
            § Theory vs Actual — 理論と実測
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-ink-500">
            CSS プロパティから予測される「走るべきフェーズ」（
            <strong className="text-ink-900">理論</strong>）と、 LoAF API で計測した実際の挙動（
            <strong className="text-ink-900">実測</strong>）を並べています。
            <br />
            <strong className="text-ink-900">両者が一致（判定 ✓）</strong>していれば、 CSS Triggers
            の予測どおりブラウザが動いている証拠です。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-rule-dim pt-3 text-[11px] uppercase tracking-[0.18em] text-ink-400">
          <span className="flex items-center gap-1.5">
            <Dot on />
            走る
          </span>
          <span className="flex items-center gap-1.5">
            <Dot on={false} />
            走らない
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle size={12} weight="fill" className="text-sig-ok" />
            一致
          </span>
          <span className="flex items-center gap-1.5">
            <WarningCircle size={12} weight="fill" className="text-sig-warn" />
            不一致
          </span>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-rule-dim bg-ink-050/40">
            <th className="px-4 py-2.5 text-left text-[11px] font-normal uppercase tracking-[0.2em] text-ink-400">
              Phase
            </th>
            <Th>理論</Th>
            <Th>実測</Th>
            <Th>判定</Th>
            <th className="px-4 py-2.5 text-right text-[11px] font-normal uppercase tracking-[0.2em] text-ink-400">
              時間
            </th>
          </tr>
        </thead>
        <tbody>
          <Row
            phase="Layout"
            theoretical={theoretical.layout}
            actual={actualLayout}
            hasMeasurement={hasMeasurement}
            time={lastFrame ? `${lastFrame.styleLayoutDuration.toFixed(1)}ms` : '—'}
          />
          <Row
            phase="Paint + Composite"
            theoretical={theoretical.paint || theoretical.composite}
            actual={actualRendering}
            hasMeasurement={hasMeasurement}
            time={lastFrame ? `${lastFrame.renderingDuration.toFixed(1)}ms` : '—'}
            hint="LoAF では Paint と Composite を分離できないため合算値"
          />
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-center text-[11px] font-normal uppercase tracking-[0.2em] text-ink-400">
      {children}
    </th>
  )
}

type RowProps = {
  phase: string
  theoretical: boolean
  actual: boolean
  hasMeasurement: boolean
  time: string
  hint?: string
}

function Row({ phase, theoretical, actual, hasMeasurement, time, hint }: RowProps) {
  const isMatch = theoretical === actual
  return (
    <tr className="border-b border-rule-dim last:border-b-0">
      <td className="px-4 py-3">
        <div className="font-mincho text-ink-900">{phase}</div>
        {hint && <div className="mt-0.5 text-[11px] text-ink-400">{hint}</div>}
      </td>
      <td className="px-4 py-3 text-center">
        <Dot on={theoretical} variant="theory" />
      </td>
      <td className="px-4 py-3 text-center">
        <Dot on={actual} variant="actual" />
      </td>
      <td className="px-4 py-3 text-center">
        {hasMeasurement ? (
          <Verdict isMatch={isMatch} />
        ) : (
          <Minus size={14} className="inline text-ink-300" aria-label="未計測" />
        )}
      </td>
      <td className="px-4 py-3 text-right tnum text-ink-900">{time}</td>
    </tr>
  )
}

type DotVariant = 'theory' | 'actual' | 'legend'

function Dot({ on, variant = 'legend' }: { on: boolean; variant?: DotVariant }) {
  // 理論 = vermilion（予測の色）、実測 = ink-900（計測値の色）で列ごとに視覚を分離
  const onClass =
    variant === 'actual'
      ? 'border-ink-500 bg-ink-500 shadow-[0_0_6px_var(--ink-500)]'
      : 'border-vermilion bg-vermilion shadow-[0_0_6px_var(--vermilion)]'
  return (
    <span
      role="img"
      aria-label={on ? '走る' : '走らない'}
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full border align-middle',
        on ? onClass : 'border-rule-normal bg-transparent',
      )}
    />
  )
}

function Verdict({ isMatch }: { isMatch: boolean }) {
  return isMatch ? (
    <span
      role="img"
      aria-label="理論と実測が一致"
      className="inline-flex items-center gap-1 text-[11px] text-sig-ok"
    >
      <CheckCircle size={14} weight="fill" />
      一致
    </span>
  ) : (
    <span
      role="img"
      aria-label="理論と実測が不一致"
      className="inline-flex items-center gap-1 text-[11px] text-sig-warn"
    >
      <WarningCircle size={14} weight="fill" />
      不一致
    </span>
  )
}
