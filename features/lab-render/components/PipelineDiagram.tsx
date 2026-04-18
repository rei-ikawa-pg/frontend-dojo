/**
 * 描画パイプラインを可視化する「主役」コンポーネント。
 *
 * JS → Style → Layout → Paint → Composite → Display の 6 段フローで、
 * 選択中のプロパティが走らせる段階だけを phase 色で点灯させる。
 *
 * 設計意図:
 *   - Canvas 上のアニメーションだけでは「何が起きているか」が伝わらない
 *     （チカチカする記号の羅列に見える）ため、概念的な対応関係を常時表示する
 *   - phase 色は globals.css の --phase-* トークンを利用し ControlPanel / TheoryVsActual
 *     と視覚的に完全一致させる
 *   - 実測 ms は MetricsDisplay 側の役割とし、ここでは「概念の地図」に徹する
 *     （役割分担を明確にして視覚的ノイズを避ける）
 *
 * variant:
 *   - 'full': Tutorial/Playground 用。6 ボックス（JS/Style/Layout/Paint/Composite/Display）
 *   - 'compact': ComparisonView 用。L/P/C の 3 ボックスのみ
 */

'use client'

import { CaretRight } from '@phosphor-icons/react'
import { motion, useReducedMotion } from 'motion/react'
import { Fragment, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { aggregateImpact, type PhaseImpact } from '../engine/cssTriggersData'

type Tone = 'neutral' | 'layout' | 'paint' | 'composite'

type StageConfig = {
  key: 'js' | 'style' | 'layout' | 'paint' | 'composite' | 'display'
  label: string
  sub: string
  tone: Tone
  /** impact に関わらず常に「走る」扱い（ブラウザの描画ループで必ず通る段階） */
  alwaysOn: boolean
}

const FULL_STAGES: readonly StageConfig[] = [
  { key: 'js', label: 'JS', sub: 'スクリプト', tone: 'neutral', alwaysOn: true },
  { key: 'style', label: 'Style', sub: 'スタイル計算', tone: 'neutral', alwaysOn: true },
  { key: 'layout', label: 'Layout', sub: '位置を再計算', tone: 'layout', alwaysOn: false },
  { key: 'paint', label: 'Paint', sub: 'ピクセルを塗る', tone: 'paint', alwaysOn: false },
  {
    key: 'composite',
    label: 'Composite',
    sub: 'レイヤを合成',
    tone: 'composite',
    alwaysOn: false,
  },
  { key: 'display', label: 'Display', sub: '画面に反映', tone: 'neutral', alwaysOn: true },
]

const COMPACT_STAGES: readonly StageConfig[] = [
  { key: 'layout', label: 'L', sub: 'Layout', tone: 'layout', alwaysOn: false },
  { key: 'paint', label: 'P', sub: 'Paint', tone: 'paint', alwaysOn: false },
  { key: 'composite', label: 'C', sub: 'Composite', tone: 'composite', alwaysOn: false },
]

const TONE_ACTIVE_CLASS: Record<Tone, string> = {
  neutral: 'border-rule-normal bg-ink-100/40 text-ink-500',
  layout: 'border-phase-layout bg-phase-layout/15 text-phase-layout',
  paint: 'border-phase-paint bg-phase-paint/15 text-phase-paint',
  composite: 'border-phase-composite bg-phase-composite/15 text-phase-composite',
}

const TONE_INACTIVE_CLASS = 'border-dashed border-rule-dim bg-transparent text-ink-300/70'

type PipelineDiagramProps = {
  /** 有効化されたプロパティ群。渡されると aggregateImpact で impact を導出する */
  props?: Iterable<string>
  /** 事前計算済みの impact。指定時は props より優先 */
  impact?: PhaseImpact
  /** full: 6 段 / compact: 3 段 */
  variant?: 'full' | 'compact'
  className?: string
}

export function PipelineDiagram({
  props,
  impact,
  variant = 'full',
  className,
}: PipelineDiagramProps) {
  const resolvedImpact = useMemo<PhaseImpact>(() => {
    if (impact) return impact
    if (props) return aggregateImpact(props)
    return { layout: false, paint: false, composite: false }
  }, [impact, props])

  if (variant === 'compact') {
    return (
      <ol
        aria-label="描画パイプライン（圧縮版）"
        className={cn('flex list-none items-center gap-1.5', className)}
      >
        {COMPACT_STAGES.map((stage) => (
          <StageChip key={stage.key} stage={stage} active={isActive(stage, resolvedImpact)} />
        ))}
      </ol>
    )
  }

  return (
    <section
      aria-label="描画パイプライン"
      className={cn('border border-rule-dim bg-card p-5', className)}
    >
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xs uppercase tracking-[0.24em] text-ink-400">
          § Pipeline / 1 フレームの旅
        </h3>
        <span className="text-xs tracking-[0.2em] text-ink-300">走る段階だけ点灯</span>
      </header>

      <ol className="flex list-none flex-wrap items-stretch gap-y-2">
        {FULL_STAGES.map((stage, idx) => {
          const next = FULL_STAGES[idx + 1]
          return (
            <Fragment key={stage.key}>
              <StageBox stage={stage} active={isActive(stage, resolvedImpact)} />
              {next && (
                <StageArrow
                  active={isActive(stage, resolvedImpact) && isActive(next, resolvedImpact)}
                />
              )}
            </Fragment>
          )
        })}
      </ol>

      <p className="mt-4 border-t border-rule-dim pt-3 text-xs leading-relaxed text-ink-400">
        <span className="text-phase-layout">Layout</span>{' '}
        は「どこに置くか」を再計算する最も重い段階。
        <span className="text-phase-paint"> Paint</span> はピクセルを塗り、
        <span className="text-phase-composite"> Composite</span> は既にあるレイヤを GPU
        で重ねるだけで最軽量。
      </p>
    </section>
  )
}

function isActive(stage: StageConfig, impact: PhaseImpact): boolean {
  if (stage.alwaysOn) return true
  if (stage.key === 'layout') return impact.layout
  if (stage.key === 'paint') return impact.paint
  if (stage.key === 'composite') return impact.composite
  return false
}

type StageBoxProps = {
  stage: StageConfig
  active: boolean
}

function StageBox({ stage, active }: StageBoxProps) {
  const prefersReduced = useReducedMotion()
  const ariaLabel = `${stage.label}: ${active ? '走る' : '走らない'}`
  // 呼吸アニメは「選択で点灯した phase」(= non-neutral かつ active) だけに限定。
  // neutral（常時 on）は動かさない、動きが多いと視線が散る
  const breathing = active && stage.tone !== 'neutral' && !prefersReduced

  return (
    <motion.li
      aria-label={ariaLabel}
      aria-current={active ? 'true' : undefined}
      animate={breathing ? { opacity: [1, 0.78, 1] } : { opacity: 1 }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      // min-width は日本語サブラベルの改行を避けるため 112px に（"位置を再計算" が 1 行で収まる幅）
      className={cn(
        'flex min-w-[112px] flex-1 flex-col items-center justify-center gap-1.5 border px-3 py-4 text-center transition-colors',
        active ? TONE_ACTIVE_CLASS[stage.tone] : TONE_INACTIVE_CLASS,
      )}
    >
      <span className="font-mincho text-base leading-tight tracking-wide">{stage.label}</span>
      <span className="text-[11px] leading-tight tracking-[0.04em] opacity-80">{stage.sub}</span>
    </motion.li>
  )
}

function StageArrow({ active }: { active: boolean }) {
  return (
    // <ol> の子要素なので li にするが、aria-hidden で読み上げから外す（装飾のみ）
    <li
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center px-0.5 transition-colors',
        active ? 'text-ink-400' : 'text-ink-300/40',
      )}
    >
      <CaretRight size={12} weight="bold" />
    </li>
  )
}

type StageChipProps = {
  stage: StageConfig
  active: boolean
}

function StageChip({ stage, active }: StageChipProps) {
  const ariaLabel = `${stage.sub}: ${active ? '走る' : '走らない'}`
  return (
    <li
      aria-label={ariaLabel}
      aria-current={active ? 'true' : undefined}
      title={stage.sub}
      className={cn(
        'inline-flex min-w-[28px] items-center justify-center border px-2 py-1 font-mono text-xs font-semibold tracking-wide transition-colors',
        active ? TONE_ACTIVE_CLASS[stage.tone] : TONE_INACTIVE_CLASS,
      )}
    >
      {stage.label}
    </li>
  )
}
