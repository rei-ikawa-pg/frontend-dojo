/**
 * Lab 3 の操作パネル。
 * - 深さ (Depth) / 枝分かれ (Fanout) の数値セグメント
 * - prop 種別 / stateSource 選択
 * - memo on/off 一括切替
 *
 * state 更新 / リセットのトリガは VisualizationView 側（Render Tree カード内）に置き、
 * 「原因（ボタン）と結果（フラッシュ）を同じ枠で観察できる」UX を優先している。
 *
 * Depth / Fanout は値域が 1–4 と狭いため、スライダーではなく数値セグメントで
 * 「押せる UI」を明示し、prop kind / state source と同じ選択言語で揃える。
 */

'use client'

import { MagicWand } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
      <NumberSegmentedRow
        label="§ 01 — Depth"
        jaLabel="深さ"
        description="Root から葉までの階層数"
        value={depth}
        min={DEPTH_MIN}
        max={DEPTH_MAX}
        onChange={setDepth}
      />

      <NumberSegmentedRow
        label="§ 02 — Fanout"
        jaLabel="枝分かれ"
        description="各親ノードが持つ子の数"
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
    </aside>
  )
}

type NumberSegmentedRowProps = {
  label: string
  /** ラベル英語の隣に併記する日本語短語（例: 深さ） */
  jaLabel: string
  /** 選択肢の下に出す 1 行の補足説明 */
  description: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}

function NumberSegmentedRow({
  label,
  jaLabel,
  description,
  value,
  min,
  max,
  onChange,
}: NumberSegmentedRowProps) {
  const options = useMemo(() => {
    const arr: number[] = []
    for (let n = min; n <= max; n += 1) arr.push(n)
    return arr
  }, [min, max])

  return (
    <section aria-label={label.replace(/^§\s*\d+\s*—\s*/, '')}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h3 className="text-[11px] uppercase tracking-[0.24em] text-ink-400">
          {label} <span className="text-ink-500 normal-case tracking-normal">／ {jaLabel}</span>
        </h3>
        <span className="tnum font-mincho text-2xl leading-none text-ink-900">{value}</span>
      </div>
      <p className="mb-2 text-[11px] text-ink-500">{description}</p>
      <div className="flex gap-1.5">
        {options.map((n) => {
          const active = n === value
          return (
            <button
              key={n}
              type="button"
              aria-pressed={active}
              aria-label={`${jaLabel} ${n}`}
              onClick={() => onChange(n)}
              className={cn(
                'tnum flex-1 cursor-pointer border py-2 text-center text-sm transition-colors',
                active
                  ? 'border-ink-500 bg-ink-100 text-ink-900'
                  : 'border-rule-dim text-ink-400 hover:border-ink-300 hover:bg-ink-100/60 hover:text-ink-900',
              )}
            >
              {n}
            </button>
          )
        })}
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
