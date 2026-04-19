/**
 * Lab 3 の操作パネル。
 * - 深さ / fanout スライダー
 * - memo on/off 一括切替
 * - prop 種別 / stateSource 選択
 * - 「state を更新」ボタン
 */

'use client'

import { ArrowCounterClockwise, Lightning, MagicWand } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { renderTracker } from '../engine/renderTracker'
import { buildTree, collectIds } from '../engine/tree'
import {
  DEPTH_MAX,
  DEPTH_MIN,
  FANOUT_MAX,
  FANOUT_MIN,
  PROP_KIND_LABEL,
  PROP_KINDS,
  type PropKind,
  STATE_SOURCE_LABEL,
  STATE_SOURCES,
  type StateSource,
  useRerenderPlaygroundStore,
} from '../stores/playgroundStore'

export function ControlPanel() {
  const depth = useRerenderPlaygroundStore((s) => s.depth)
  const fanout = useRerenderPlaygroundStore((s) => s.fanout)
  const memoIds = useRerenderPlaygroundStore((s) => s.memoIds)
  const propKind = useRerenderPlaygroundStore((s) => s.propKind)
  const stateSource = useRerenderPlaygroundStore((s) => s.stateSource)
  const setDepth = useRerenderPlaygroundStore((s) => s.setDepth)
  const setFanout = useRerenderPlaygroundStore((s) => s.setFanout)
  const setAllMemo = useRerenderPlaygroundStore((s) => s.setAllMemo)
  const setPropKind = useRerenderPlaygroundStore((s) => s.setPropKind)
  const setStateSource = useRerenderPlaygroundStore((s) => s.setStateSource)
  const bumpTick = useRerenderPlaygroundStore((s) => s.bumpTick)
  const reset = useRerenderPlaygroundStore((s) => s.reset)

  const allIds = useMemo(
    () => collectIds(buildTree({ depth, fanout, memoIds })),
    [depth, fanout, memoIds],
  )
  const allMemoOn = memoIds.size > 0 && allIds.every((id) => memoIds.has(id))

  return (
    <aside
      aria-label="操作パネル"
      className="flex flex-col gap-7 border border-rule-dim bg-card p-5"
    >
      <SliderRow
        label="§ 01 — Depth"
        value={depth}
        min={DEPTH_MIN}
        max={DEPTH_MAX}
        onChange={setDepth}
      />

      <SliderRow
        label="§ 02 — Fanout"
        value={fanout}
        min={FANOUT_MIN}
        max={FANOUT_MAX}
        onChange={setFanout}
      />

      <Segmented<PropKind>
        label="§ 03 — Prop kind"
        value={propKind}
        options={PROP_KINDS}
        toLabel={(v) => PROP_KIND_LABEL[v]}
        onChange={setPropKind}
      />

      <Segmented<StateSource>
        label="§ 04 — State source"
        value={stateSource}
        options={STATE_SOURCES}
        toLabel={(v) => STATE_SOURCE_LABEL[v]}
        onChange={setStateSource}
      />

      <section aria-labelledby="control-memo" className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 id="control-memo" className="text-[11px] uppercase tracking-[0.24em] text-ink-400">
            § 05 — Memo
          </h3>
          <span className="tnum text-xs text-ink-500">
            {memoIds.size} / {allIds.length}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAllMemo(!allMemoOn, allIds)}
        >
          <MagicWand size={14} weight="bold" className="mr-2" />
          {allMemoOn ? '全て解除' : '全て memo 化'}
        </Button>
      </section>

      <section aria-labelledby="control-run" className="flex flex-col gap-2">
        <h3 id="control-run" className="mb-1 text-[11px] uppercase tracking-[0.24em] text-ink-400">
          § 06 — Run
        </h3>
        <Button type="button" onClick={bumpTick}>
          <Lightning size={14} weight="bold" className="mr-2" />
          state を更新
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset()
            renderTracker.reset()
          }}
        >
          <ArrowCounterClockwise size={14} weight="bold" className="mr-2" />
          リセット
        </Button>
      </section>
    </aside>
  )
}

type SliderRowProps = {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}

function SliderRow({ label, value, min, max, onChange }: SliderRowProps) {
  return (
    <section aria-label={label.replace(/^§\s*\d+\s*—\s*/, '')}>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-[11px] uppercase tracking-[0.24em] text-ink-400">{label}</h3>
        <span className="tnum font-mincho text-2xl text-ink-900">{value}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={(vals) => {
          const next = vals[0]
          if (typeof next === 'number') onChange(next)
        }}
      />
      <div className="mt-2 flex justify-between text-[11px] text-ink-400 tnum">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </section>
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
