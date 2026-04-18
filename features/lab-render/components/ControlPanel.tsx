/**
 * 自由操作モードの操作パネル。
 * - 要素数スライダー
 * - プロパティトグル群（CSS Triggers で分類して色分け表示）
 * - 実行 / 停止 / リセット
 */

'use client'

import { ArrowCounterClockwise, Pause, Play } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  ELEMENT_COUNT_MAX,
  ELEMENT_COUNT_MIN,
  PLAYGROUND_PROPS,
  type PlaygroundProp,
  usePlaygroundStore,
} from '@/features/lab-render'
import { getPhaseImpact } from '@/features/lab-render/engine/cssTriggersData'
import { cn } from '@/lib/utils'

function phaseBadge(prop: PlaygroundProp): {
  label: string
  tone: 'composite' | 'paint' | 'layout'
} {
  const impact = getPhaseImpact(prop)
  if (impact.layout) return { label: 'LAYOUT', tone: 'layout' }
  if (impact.paint) return { label: 'PAINT', tone: 'paint' }
  return { label: 'COMPOSITE', tone: 'composite' }
}

// Phase 色は globals.css の --phase-* トークンに統一（PipelineDiagram と一致させるため）
const TONE_CLASS = {
  composite: 'border-phase-composite/50 text-phase-composite',
  paint: 'border-phase-paint/60 text-phase-paint',
  layout: 'border-phase-layout/60 text-phase-layout',
} as const

export function ControlPanel() {
  const elementCount = usePlaygroundStore((s) => s.elementCount)
  const enabledProps = usePlaygroundStore((s) => s.enabledProps)
  const isRunning = usePlaygroundStore((s) => s.isRunning)
  const setElementCount = usePlaygroundStore((s) => s.setElementCount)
  const toggleProp = usePlaygroundStore((s) => s.toggleProp)
  const start = usePlaygroundStore((s) => s.start)
  const stop = usePlaygroundStore((s) => s.stop)
  const reset = usePlaygroundStore((s) => s.reset)

  return (
    <aside
      aria-label="操作パネル"
      className="flex flex-col gap-8 border border-rule-dim bg-card p-5"
    >
      <section aria-labelledby="control-count">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 id="control-count" className="text-[11px] uppercase tracking-[0.24em] text-ink-400">
            § 01 — Element Count
          </h3>
          <span className="tnum font-mincho text-2xl text-ink-900">{elementCount}</span>
        </div>
        <Slider
          min={ELEMENT_COUNT_MIN}
          max={ELEMENT_COUNT_MAX}
          step={50}
          value={[elementCount]}
          onValueChange={(value) => {
            const next = value[0]
            if (typeof next === 'number') setElementCount(next)
          }}
        />
        <div className="mt-2 flex justify-between text-[11px] text-ink-400 tnum">
          <span>{ELEMENT_COUNT_MIN}</span>
          <span>{ELEMENT_COUNT_MAX}</span>
        </div>
      </section>

      <section aria-labelledby="control-props">
        <h3
          id="control-props"
          className="mb-3 text-[11px] uppercase tracking-[0.24em] text-ink-400"
        >
          § 02 — CSS Properties
        </h3>
        <ul className="flex flex-col gap-1.5">
          {PLAYGROUND_PROPS.map((prop) => {
            const enabled = enabledProps.has(prop)
            const { label, tone } = phaseBadge(prop)
            return (
              <li key={prop}>
                <button
                  type="button"
                  onClick={() => toggleProp(prop)}
                  aria-pressed={enabled}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between border px-3 py-2 text-left text-sm transition-colors',
                    enabled
                      ? 'border-ink-500 bg-ink-100 text-ink-900'
                      : 'border-rule-dim text-ink-400 hover:border-ink-300 hover:bg-ink-100/60 hover:text-ink-900',
                  )}
                >
                  <span className="font-mono text-xs">{prop}</span>
                  <span
                    className={cn(
                      'border px-1.5 py-0.5 text-[11px] uppercase tracking-[0.18em]',
                      TONE_CLASS[tone],
                    )}
                  >
                    {label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="control-run" className="flex flex-col gap-2">
        <h3 id="control-run" className="mb-1 text-[11px] uppercase tracking-[0.24em] text-ink-400">
          § 03 — Run
        </h3>
        {isRunning ? (
          <Button type="button" variant="outline" onClick={stop}>
            <Pause size={14} weight="bold" className="mr-2" />
            停止
          </Button>
        ) : (
          <Button type="button" onClick={start}>
            <Play size={14} weight="bold" className="mr-2" />
            実行
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={reset}>
          <ArrowCounterClockwise size={14} weight="bold" className="mr-2" />
          リセット
        </Button>
      </section>
    </aside>
  )
}
