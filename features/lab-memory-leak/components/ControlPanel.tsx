/**
 * Lab 2 の操作パネル。
 * - リーク種別 (4 種) / 対策 (4 種) / 保持サイズ (3 段) / サイクル数
 * - 「1 サイクル実行」「自動実行 / 停止」「リセット」
 *
 * onCycle は親から渡される。LeakController の実態は VisualizationView が持つため。
 */

'use client'

import { ArrowCounterClockwise, Pause, Play, Target } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import type { HoldSize, LeakType, Mitigation } from '../engine/types'
import {
  CYCLE_COUNT_MAX,
  CYCLE_COUNT_MIN,
  HOLD_SIZE_LABEL,
  HOLD_SIZES,
  LEAK_TYPE_LABEL,
  LEAK_TYPES,
  MITIGATION_LABEL,
  MITIGATIONS,
  useMemoryPlaygroundStore,
} from '../stores/playgroundStore'

type ControlPanelProps = {
  onCycle: () => void
  onRelease: () => void
}

export function ControlPanel({ onCycle, onRelease }: ControlPanelProps) {
  const leakType = useMemoryPlaygroundStore((s) => s.leakType)
  const mitigation = useMemoryPlaygroundStore((s) => s.mitigation)
  const holdSize = useMemoryPlaygroundStore((s) => s.holdSize)
  const cycleCount = useMemoryPlaygroundStore((s) => s.cycleCount)
  const isRunning = useMemoryPlaygroundStore((s) => s.isRunning)
  const setLeakType = useMemoryPlaygroundStore((s) => s.setLeakType)
  const setMitigation = useMemoryPlaygroundStore((s) => s.setMitigation)
  const setHoldSize = useMemoryPlaygroundStore((s) => s.setHoldSize)
  const setCycleCount = useMemoryPlaygroundStore((s) => s.setCycleCount)
  const start = useMemoryPlaygroundStore((s) => s.start)
  const stop = useMemoryPlaygroundStore((s) => s.stop)
  const reset = useMemoryPlaygroundStore((s) => s.reset)

  return (
    <aside
      aria-label="操作パネル"
      className="flex flex-col gap-7 border border-rule-dim bg-card p-5"
    >
      <Segmented<LeakType>
        label="§ 01 — Leak Type"
        value={leakType}
        options={LEAK_TYPES}
        toLabel={(v) => LEAK_TYPE_LABEL[v]}
        onChange={setLeakType}
      />

      <Segmented<Mitigation>
        label="§ 02 — Mitigation"
        value={mitigation}
        options={MITIGATIONS}
        toLabel={(v) => MITIGATION_LABEL[v]}
        onChange={setMitigation}
      />

      <Segmented<HoldSize>
        label="§ 03 — Hold Size"
        value={holdSize}
        options={HOLD_SIZES}
        toLabel={(v) => HOLD_SIZE_LABEL[v]}
        onChange={setHoldSize}
      />

      <section aria-labelledby="control-cycle">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 id="control-cycle" className="text-[11px] uppercase tracking-[0.24em] text-ink-400">
            § 04 — Cycles / tick
          </h3>
          <span className="tnum font-mincho text-2xl text-ink-900">{cycleCount}</span>
        </div>
        <Slider
          min={CYCLE_COUNT_MIN}
          max={CYCLE_COUNT_MAX}
          step={1}
          value={[cycleCount]}
          onValueChange={(value) => {
            const next = value[0]
            if (typeof next === 'number') setCycleCount(next)
          }}
        />
        <div className="mt-2 flex justify-between text-[11px] text-ink-400 tnum">
          <span>{CYCLE_COUNT_MIN}</span>
          <span>{CYCLE_COUNT_MAX}</span>
        </div>
      </section>

      <section aria-labelledby="control-run" className="flex flex-col gap-2">
        <h3 id="control-run" className="mb-1 text-[11px] uppercase tracking-[0.24em] text-ink-400">
          § 05 — Run
        </h3>
        <Button type="button" variant="outline" onClick={onCycle}>
          <Target size={14} weight="bold" className="mr-2" />1 サイクル実行
        </Button>
        {isRunning ? (
          <Button type="button" variant="outline" onClick={stop}>
            <Pause size={14} weight="bold" className="mr-2" />
            自動停止
          </Button>
        ) : (
          <Button type="button" onClick={start}>
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
        >
          <ArrowCounterClockwise size={14} weight="bold" className="mr-2" />
          リセット
        </Button>
      </section>
    </aside>
  )
}

type SegmentedProps<T extends string> = {
  label: string
  value: T
  options: readonly T[]
  toLabel: (v: T) => string
  onChange: (v: T) => void
}

function Segmented<T extends string>({
  label,
  value,
  options,
  toLabel,
  onChange,
}: SegmentedProps<T>) {
  return (
    <section aria-label={label.replace(/^§\s*\d+\s*—\s*/, '')}>
      <h3 className="mb-2 text-[11px] uppercase tracking-[0.24em] text-ink-400">{label}</h3>
      <ul className="flex flex-col gap-1.5">
        {options.map((opt) => {
          const active = opt === value
          return (
            <li key={opt}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onChange(opt)}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between border px-3 py-2 text-left text-sm transition-colors',
                  active
                    ? 'border-ink-500 bg-ink-100 text-ink-900'
                    : 'border-rule-dim text-ink-400 hover:border-ink-300 hover:bg-ink-100/60 hover:text-ink-900',
                )}
              >
                <span>{toLabel(opt)}</span>
                {active && <span aria-hidden className="h-1.5 w-1.5 bg-vermilion" />}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
