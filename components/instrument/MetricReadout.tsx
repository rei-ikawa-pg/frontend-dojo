import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type MetricReadoutProps = {
  label: string
  value: ReactNode
  unit?: string
  signal?: 'default' | 'ok' | 'warn' | 'crit'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  sub?: ReactNode
}

/**
 * 計測器の文字盤を模した数値表示。等幅・桁揃えの数字でラベル付きで描画する。
 */
export function MetricReadout({
  label,
  value,
  unit,
  signal = 'default',
  size = 'md',
  className,
  sub,
}: MetricReadoutProps) {
  const signalColor = {
    default: 'text-ink-900',
    ok: 'text-sig-ok',
    warn: 'text-sig-warn',
    crit: 'text-sig-crit',
  }[signal]

  const sizeConfig = {
    sm: { value: 'text-xl', unit: 'text-[11px]', label: 'text-[11px]' },
    // SP では text-2xl に抑え、md 以上で text-3xl に戻す。
    // globals.css の `overflow-wrap: anywhere` により SP の狭幅で "10.0" 等が
    // 途中改行して高さが増え、grid-cols-3 の隣接セルごと伸びる（= CLS 原因）。
    md: { value: 'text-2xl md:text-3xl', unit: 'text-xs', label: 'text-[11px]' },
    lg: { value: 'text-5xl', unit: 'text-sm', label: 'text-xs' },
  }[size]

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <div className={cn('uppercase tracking-[0.2em] text-ink-300', sizeConfig.label)}>{label}</div>
      {/* 数値と単位は必ず 1 行で保つ（途中改行によるカード高さの揺れを防ぐ） */}
      <div className="flex items-baseline gap-1.5 whitespace-nowrap [overflow-wrap:normal]">
        <span className={cn('tnum font-medium leading-none', sizeConfig.value, signalColor)}>
          {value}
        </span>
        {unit && (
          <span className={cn('tnum uppercase tracking-wider text-ink-400', sizeConfig.unit)}>
            {unit}
          </span>
        )}
      </div>
      {sub && <div className="mt-1 text-[11px] text-ink-400">{sub}</div>}
    </div>
  )
}
