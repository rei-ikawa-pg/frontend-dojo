/**
 * 管理画面の期間切替（7d / 30d / 90d）。
 *
 * - URL `?range=XXX` に同期。他のクエリ（token など）は保持する
 * - デフォルト値（30d）は URL には載せず省略する（URL を短く保つ）
 */

'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { DEFAULT_RANGE, parseRange, RANGE_OPTIONS, type RangeKey } from '../shared/range'

export function RangeSelector() {
  const pathname = usePathname()
  const params = useSearchParams()
  const current = parseRange(params.get('range'))

  function buildHref(range: RangeKey): string {
    const next = new URLSearchParams(params.toString())
    if (range === DEFAULT_RANGE) {
      next.delete('range')
    } else {
      next.set('range', range)
    }
    const qs = next.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  return (
    <nav aria-label="集計期間" className="inline-flex items-stretch border border-rule-dim bg-card">
      {RANGE_OPTIONS.map((opt) => {
        const active = opt === current
        return (
          <Link
            key={opt}
            href={buildHref(opt)}
            aria-current={active ? 'true' : undefined}
            scroll={false}
            className={`tnum px-3 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors ${
              active ? 'bg-ink-900 text-card' : 'text-ink-500 hover:bg-card/60 hover:text-ink-900'
            }`}
          >
            {opt}
          </Link>
        )
      })}
    </nav>
  )
}
