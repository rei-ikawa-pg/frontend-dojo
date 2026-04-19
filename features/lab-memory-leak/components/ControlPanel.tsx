/**
 * Lab 2 の操作パネル。
 * - リーク種別 / 対策 / 保持サイズ / サイクル数の設定
 *
 * Run トリガ（1 サイクル実行 / 自動実行 / リセット）は VisualizationView 側
 * （Retained References カード内）に置き、原因と結果を同じ枠で観察できる UX を採る。
 *
 * Cycles はスライダーから「1 / 10 / 50 / 100」のプリセット数値ボタンに変更。
 * 値域 1–100 で細かい刻みが要らないことと、押せる UI を明示するため。
 */

'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { HoldSize, LeakType, Mitigation } from '../engine/types'
import {
  HOLD_SIZE_LABEL,
  HOLD_SIZES,
  LEAK_TYPE_LABEL,
  LEAK_TYPES,
  MITIGATION_LABEL,
  MITIGATIONS,
  useMemoryPlaygroundStore,
} from '../stores/playgroundStore'

const CYCLE_PRESETS = [1, 10, 50, 100] as const

export function ControlPanel() {
  const leakType = useMemoryPlaygroundStore((s) => s.leakType)
  const mitigation = useMemoryPlaygroundStore((s) => s.mitigation)
  const holdSize = useMemoryPlaygroundStore((s) => s.holdSize)
  const cycleCount = useMemoryPlaygroundStore((s) => s.cycleCount)
  const setLeakType = useMemoryPlaygroundStore((s) => s.setLeakType)
  const setMitigation = useMemoryPlaygroundStore((s) => s.setMitigation)
  const setHoldSize = useMemoryPlaygroundStore((s) => s.setHoldSize)
  const setCycleCount = useMemoryPlaygroundStore((s) => s.setCycleCount)

  return (
    <aside
      aria-label="操作パネル"
      className="flex flex-col gap-7 border border-rule-dim bg-card p-5"
    >
      <Segmented<LeakType>
        label="§ 01 — Leak Type"
        jaLabel="リーク種別"
        value={leakType}
        options={LEAK_TYPES}
        toLabel={(v) => LEAK_TYPE_LABEL[v]}
        onChange={setLeakType}
      />

      <Segmented<Mitigation>
        label="§ 02 — Mitigation"
        jaLabel="対策"
        value={mitigation}
        options={MITIGATIONS}
        toLabel={(v) => MITIGATION_LABEL[v]}
        onChange={setMitigation}
      />

      <Segmented<HoldSize>
        label="§ 03 — Hold Size"
        jaLabel="保持サイズ"
        value={holdSize}
        options={HOLD_SIZES}
        toLabel={(v) => HOLD_SIZE_LABEL[v]}
        onChange={setHoldSize}
      />

      <NumberPresetRow
        label="§ 04 — Cycles / tick"
        jaLabel="1 周期あたりの実行回数"
        description="自動実行 1 周で何サイクル進めるか"
        value={cycleCount}
        options={CYCLE_PRESETS}
        onChange={setCycleCount}
      />
    </aside>
  )
}

type NumberPresetRowProps = {
  label: string
  /** ラベル英語の隣に併記する日本語短語 */
  jaLabel: string
  /** 選択肢の下に出す 1 行の補足説明 */
  description: string
  value: number
  options: readonly number[]
  onChange: (v: number) => void
}

function NumberPresetRow({
  label,
  jaLabel,
  description,
  value,
  options,
  onChange,
}: NumberPresetRowProps) {
  // store 側 clamp で範囲外の値も受理されるが、active 表示は最も近いプリセットでハイライト。
  // ユーザーが preset 経由でしか値を変更できない構造なので通常は厳密一致する。
  const activeValue = useMemo(() => {
    if (options.includes(value)) return value
    return options.reduce((closest, n) =>
      Math.abs(n - value) < Math.abs(closest - value) ? n : closest,
    )
  }, [value, options])

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
          const active = n === activeValue
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
  /** ラベル英語の隣に併記する日本語短語 */
  jaLabel?: string
  value: T
  options: readonly T[]
  toLabel: (v: T) => string
  onChange: (v: T) => void
}

function Segmented<T extends string>({
  label,
  jaLabel,
  value,
  options,
  toLabel,
  onChange,
}: SegmentedProps<T>) {
  return (
    <section aria-label={label.replace(/^§\s*\d+\s*—\s*/, '')}>
      <h3 className="mb-2 text-[11px] uppercase tracking-[0.24em] text-ink-400">
        {label}
        {jaLabel && <span className="text-ink-500 normal-case tracking-normal"> ／ {jaLabel}</span>}
      </h3>
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
