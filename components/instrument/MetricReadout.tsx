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
    md: { value: 'text-3xl', unit: 'text-xs', label: 'text-[11px]' },
    lg: { value: 'text-5xl', unit: 'text-sm', label: 'text-xs' },
  }[size]

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <div className={cn('uppercase tracking-[0.2em] text-ink-300', sizeConfig.label)}>{label}</div>
      <div className="flex items-baseline gap-1.5">
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
