/**
 * Lab 内でモード（概要 / 稽古 / 道場）を切り替えるタブ。
 * - 概要ページでも表示されるが、メインの導線は概要ページ内の大CTAで担うため、
 *   ここは補助的な位置づけ
 * - アクティブ判定は pathname の末尾で行う
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LABS } from '@/features/labs'
import { cn } from '@/lib/utils'

type TabDef = { key: string; label: string; suffix: string }

const TABS: readonly TabDef[] = [
  { key: 'overview', label: '概要', suffix: '' },
  { key: 'tutorial', label: '稽古', suffix: '/tutorial' },
  { key: 'playground', label: '道場', suffix: '/playground' },
]

export function LabModeTabs() {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(Boolean)
  const slug = parts[1]
  const currentMode = parts[2] ?? 'overview'
  const lab = LABS.find((l) => l.slug === slug)
  if (!lab) return null

  return (
    <div role="tablist" aria-label="モード切り替え" className="flex gap-0 border-b border-rule-dim">
      {TABS.map((tab) => {
        const isActive = tab.key === currentMode
        const href = `${lab.path}${tab.suffix}`
        return (
          <Link
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            href={href}
            className={cn(
              'relative -mb-px border-b-2 px-5 py-3 font-mincho text-sm transition-colors',
              isActive
                ? 'border-vermilion text-ink-900'
                : 'border-transparent text-ink-400 hover:text-ink-900',
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
