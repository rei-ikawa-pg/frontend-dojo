/**
 * Lab ページ用のパンくず。
 * 現在の pathname から Lab slug / mode を推測して表示する。
 * 稽古場 > Lab 1: レンダリング ( > 稽古 | 道場 )
 */

'use client'

import { CaretRight } from '@phosphor-icons/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LABS } from '@/features/labs'

const MODE_LABEL: Record<string, string> = {
  tutorial: '稽古',
  playground: '道場',
}

export function LabBreadcrumb() {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(Boolean) // ['lab', <slug>, <mode>?]
  const slug = parts[1]
  const mode = parts[2]
  const lab = LABS.find((l) => l.slug === slug)
  if (!lab) return null

  const modeLabel = mode ? MODE_LABEL[mode] : null

  return (
    <nav aria-label="パンくず" className="text-[11px] uppercase tracking-[0.2em] text-ink-400">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/labs" className="hover:text-ink-900 transition-colors">
            稽古場
          </Link>
        </li>
        <li aria-hidden>
          <CaretRight size={10} weight="bold" />
        </li>
        <li>
          {modeLabel ? (
            <Link href={lab.path} className="hover:text-ink-900 transition-colors">
              {lab.shortTitle}
            </Link>
          ) : (
            <span className="text-ink-900">{lab.shortTitle}</span>
          )}
        </li>
        {modeLabel && (
          <>
            <li aria-hidden>
              <CaretRight size={10} weight="bold" />
            </li>
            <li className="text-ink-900">{modeLabel}</li>
          </>
        )}
      </ol>
    </nav>
  )
}
