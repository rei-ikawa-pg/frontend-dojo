import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type InstrumentPanelProps = {
  label?: string
  index?: string
  children: ReactNode
  className?: string
  /**
   * 枠の強さ。`hairline` は背景に馴染む、`panel` は少し浮く、
   * `inset` は沈み込んだ見た目。
   */
  variant?: 'hairline' | 'panel' | 'inset'
}

/**
 * 計測器の筐体を模した枠コンポーネント。上辺に小さなラベル帯を持つ。
 */
export function InstrumentPanel({
  label,
  index,
  children,
  className,
  variant = 'hairline',
}: InstrumentPanelProps) {
  return (
    <div
      className={cn(
        'relative',
        variant === 'hairline' && 'border border-rule-dim',
        variant === 'panel' && 'border border-rule-normal bg-ink-050',
        variant === 'inset' &&
          'border border-rule-dim bg-ink-000 shadow-[inset_0_0_0_1px_var(--ink-000)]',
        className,
      )}
    >
      {(label || index) && (
        <div className="flex items-center justify-between border-b border-rule-dim bg-ink-050/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-ink-300">
          {label && <span className="tnum">{label}</span>}
          {index && <span className="tnum text-ink-400">{index}</span>}
        </div>
      )}
      {children}
      <PanelCornerTick position="tl" />
      <PanelCornerTick position="tr" />
      <PanelCornerTick position="bl" />
      <PanelCornerTick position="br" />
    </div>
  )
}

function PanelCornerTick({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const base = 'pointer-events-none absolute h-1.5 w-1.5 border-vermilion/70'
  return (
    <span
      aria-hidden
      className={cn(
        base,
        position === 'tl' && '-top-px -left-px border-t border-l',
        position === 'tr' && '-top-px -right-px border-t border-r',
        position === 'bl' && '-bottom-px -left-px border-b border-l',
        position === 'br' && '-bottom-px -right-px border-b border-r',
      )}
    />
  )
}
