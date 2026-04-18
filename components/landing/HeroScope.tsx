'use client'

import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { InstrumentPanel } from '@/components/instrument/InstrumentPanel'
import { MetricReadout } from '@/components/instrument/MetricReadout'
import { Sparkline } from '@/components/instrument/Sparkline'

/**
 * Hero 右側で動き続ける「ライブスコープ」。フレームカウンタ・擬似的な
 * Style+Layout / Paint の計測値・ミニスパークラインを持つ。
 * 着地後数秒で「このサイトはブログではなく Lab である」ことを視覚的に伝えるための装飾。
 */
export function HeroScope() {
  const [frame, setFrame] = useState(0)
  const [values, setValues] = useState<number[]>(() => Array(24).fill(0.2))
  const [accent, setAccent] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastTickRef = useRef(0)

  useEffect(() => {
    const TICK_MS = 140
    const tick = (ts: number) => {
      if (ts - lastTickRef.current > TICK_MS) {
        lastTickRef.current = ts
        setFrame((f) => (f + 1) % 10_000)
        setValues((prev) => {
          const n = prev.slice(1)
          const base = 0.18 + Math.sin(ts / 900) * 0.06
          const spike = Math.random() < 0.07 ? Math.random() * 0.7 : 0
          const next = Math.min(1, base + Math.random() * 0.12 + spike)
          if (spike > 0) setAccent(true)
          else if (spike === 0 && Math.random() < 0.2) setAccent(false)
          return [...n, next]
        })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const last = values[values.length - 1]
  const styleLayoutMs = (last * 18 + 2).toFixed(1)
  const paintMs = (last * 9 + 1).toFixed(1)
  const fps = Math.max(30, Math.round(60 - last * 24))

  return (
    <div className="relative">
      {/* 背景のグリッド */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(var(--rule-dim)_1px,transparent_1px),linear-gradient(90deg,var(--rule-dim)_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <InstrumentPanel
        label="LIVE SCOPE"
        index={`FRAME ${String(frame).padStart(4, '0')}`}
        variant="panel"
        className="relative"
      >
        <div className="flex flex-col divide-y divide-rule-dim">
          {/* スコープ本体：棒グラフ */}
          <div className="relative px-5 py-6">
            <div className="flex h-32 items-end gap-[3px]">
              {values.map((v, i) => {
                const h = Math.max(2, v * 100)
                const isLast = i === values.length - 1
                // key には位置スロット (i) を使う。これは固定長のローリングウィンドウで、
                // 各スロットの値が入れ替わることが期待動作のため。
                const slotKey = `slot-${i}`
                return (
                  <motion.span
                    key={slotKey}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                    className={`flex-1 origin-bottom ${
                      v > 0.55 ? 'bg-vermilion' : v > 0.35 ? 'bg-sig-warn/80' : 'bg-ink-300/70'
                    }`}
                    style={{
                      minHeight: 2,
                      outline: isLast
                        ? '1px solid color-mix(in oklch, var(--vermilion) 60%, transparent)'
                        : undefined,
                    }}
                  />
                )
              })}
            </div>
            <div className="mt-3 flex justify-between text-[9px] uppercase tracking-[0.24em] text-ink-300">
              <span>T-24 FRAMES</span>
              <span className="tnum">{styleLayoutMs} MS · NOW</span>
            </div>
            {accent && (
              <span
                aria-hidden
                className="absolute right-4 top-4 flex items-center gap-2 border border-vermilion/60 bg-ink-000/70 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-vermilion"
              >
                <span className="inline-block h-1.5 w-1.5 animate-pulse bg-vermilion" />
                Spike
              </span>
            )}
          </div>

          {/* 計測値パネル */}
          <div className="grid grid-cols-3 divide-x divide-rule-dim">
            <div className="px-5 py-4">
              <MetricReadout
                label="Style + Layout"
                value={styleLayoutMs}
                unit="ms"
                size="md"
                signal={last > 0.55 ? 'crit' : last > 0.35 ? 'warn' : 'ok'}
              />
            </div>
            <div className="px-5 py-4">
              <MetricReadout label="Paint" value={paintMs} unit="ms" size="md" />
            </div>
            <div className="px-5 py-4">
              <MetricReadout
                label="FPS"
                value={fps}
                unit="hz"
                size="md"
                sub={
                  <Sparkline
                    data={values}
                    width={88}
                    height={16}
                    stroke="color-mix(in oklch, var(--ink-400) 80%, transparent)"
                    fill="var(--ink-300)"
                  />
                }
              />
            </div>
          </div>
        </div>
      </InstrumentPanel>

      {/* スコープ下部のキャプション */}
      <p className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-ink-400">
        <span>FIG. 01 — Sample readout from Lab 01 (Render)</span>
        <span className="tnum text-ink-300">REF: LoAF · CSS TRIGGERS</span>
      </p>
    </div>
  )
}
