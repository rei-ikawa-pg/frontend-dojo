/**
 * ヒープ使用量・DOM ノード数のスパークライン。
 *
 * 設計:
 *   - Canvas ではなく SVG（要素数は最大 240 で十分、アクセシビリティと印字も楽）
 *   - Y 軸は自動スケール（観測中の最大値を 1.1 倍）。リセット後は 0 から
 *   - `enabled=false`（実行停止中）ならグラデーションを淡めに
 */

'use client'

import type { MemorySample } from '../engine/types'

type MemoryChartProps = {
  samples: readonly MemorySample[]
  enabled: boolean
}

const WIDTH = 640
const HEIGHT = 140
const PADDING_X = 8
const PADDING_Y = 12

export function MemoryChart({ samples, enabled }: MemoryChartProps) {
  const hasData = samples.length >= 2
  const uses = samples.map((s) => s.used).filter((v): v is number => v !== null)
  const maxUsed = uses.length > 0 ? Math.max(...uses) * 1.1 : 1
  const minUsed = uses.length > 0 ? Math.min(...uses) : 0
  const domMax = samples.length ? Math.max(...samples.map((s) => s.domNodes)) * 1.1 : 1

  const toX = (i: number): number =>
    PADDING_X + (i / Math.max(1, samples.length - 1)) * (WIDTH - PADDING_X * 2)

  const toYUsed = (v: number): number =>
    HEIGHT - PADDING_Y - ((v - minUsed) / Math.max(1, maxUsed - minUsed)) * (HEIGHT - PADDING_Y * 2)

  const toYDom = (v: number): number =>
    HEIGHT - PADDING_Y - (v / Math.max(1, domMax)) * (HEIGHT - PADDING_Y * 2)

  const usedPath = hasData
    ? samples
        .map((s, i) => {
          if (s.used === null) return ''
          const cmd = i === 0 ? 'M' : 'L'
          return `${cmd}${toX(i).toFixed(1)},${toYUsed(s.used).toFixed(1)}`
        })
        .filter(Boolean)
        .join(' ')
    : ''

  const domPath = hasData
    ? samples
        .map(
          (s, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toYDom(s.domNodes).toFixed(1)}`,
        )
        .join(' ')
    : ''

  const latest = samples[samples.length - 1]
  const usedMb = latest?.used != null ? (latest.used / 1024 / 1024).toFixed(1) : '—'

  return (
    <div className="border border-rule-dim bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-[11px] uppercase tracking-[0.24em] text-ink-400">§ Heap Timeline</h3>
        <div className="flex items-baseline gap-4 text-[11px] uppercase tracking-[0.18em]">
          <span className="flex items-center gap-1.5 text-vermilion">
            <span aria-hidden className="block h-[2px] w-4 bg-vermilion" />
            Heap
            <span className="tnum text-ink-500 normal-case tracking-normal">{usedMb} MB</span>
          </span>
          <span className="flex items-center gap-1.5 text-sig-ok">
            <span aria-hidden className="block h-[2px] w-4 bg-sig-ok" />
            DOM
            <span className="tnum text-ink-500 normal-case tracking-normal">
              {latest?.domNodes ?? '—'}
            </span>
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="ヒープ使用量と DOM ノード数の時系列"
        preserveAspectRatio="none"
        className="h-32 w-full"
      >
        <title>Heap and DOM timeline</title>
        <rect
          x={0}
          y={0}
          width={WIDTH}
          height={HEIGHT}
          fill="transparent"
          stroke="var(--color-rule-dim)"
          strokeDasharray="2 3"
          opacity={0.3}
        />
        {hasData && (
          <>
            <path
              d={domPath}
              fill="none"
              stroke="var(--color-sig-ok)"
              strokeWidth={1.2}
              opacity={enabled ? 0.8 : 0.4}
            />
            {usedPath && (
              <path
                d={usedPath}
                fill="none"
                stroke="var(--color-vermilion)"
                strokeWidth={1.6}
                opacity={enabled ? 1 : 0.5}
              />
            )}
          </>
        )}
        {!hasData && (
          <text
            x={WIDTH / 2}
            y={HEIGHT / 2}
            textAnchor="middle"
            fill="var(--color-ink-400)"
            fontSize="11"
          >
            計測開始を待っています
          </text>
        )}
      </svg>
    </div>
  )
}
