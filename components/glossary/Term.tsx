/**
 * 用語解説を inline で提供する Term コンポーネント。
 *
 * UX:
 *   - 下線 + ⓘ で「解説があるよ」のシグナルを出す
 *   - デスクトップ: hover で popover が開く
 *   - モバイル: tap で popover が開く、外をタップで閉じる
 *   - Escape で閉じる
 *   - popover 内に /glossary#id への深掘りリンクを含める
 *
 * 設計:
 *   - Radix 等の外部依存は入れず、最小実装に留める（MVP）
 *   - Portal は使わず inline absolute 配置。長いテキストや画面端では位置調整が必要になる可能性があるが
 *     Lab 1 の語彙は短いので現時点で許容する
 */

'use client'

import { Info } from '@phosphor-icons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { getGlossary } from '@/lib/glossary'
import { cn } from '@/lib/utils'

type TermProps = {
  id: string
  /** 表記を変えたいときだけ指定。未指定なら辞書の term を表示 */
  children?: ReactNode
}

export function Term({ id, children }: TermProps) {
  const entry = getGlossary(id)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement | null>(null)
  // hover で開いた時に pointerleave で遅延して閉じる（マウス移動の震えで消えないように）
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const descId = useId()

  const close = useCallback(() => setOpen(false), [])

  // 外クリック / Escape で閉じる
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  // 辞書に未登録なら装飾せずにプレーンテキストとして返す（ビルド時点で気づけるように console にも出す）
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Term] 辞書に未登録の id: ${id}`)
    }
    return <>{children}</>
  }

  const label = children ?? entry.term

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    leaveTimerRef.current = setTimeout(close, 120)
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: 実際の操作対象は内側の button / a、span は hover の遅延解除用
    <span
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? descId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-0.5 border-b border-dotted border-vermilion/60',
          'cursor-help text-ink-900 transition-colors hover:border-vermilion hover:text-vermilion',
          'align-baseline',
        )}
      >
        {label}
        <Info size={11} weight="bold" className="ml-0.5 shrink-0 text-vermilion/70" />
      </button>

      {open && (
        <span
          role="tooltip"
          id={descId}
          className={cn(
            'absolute bottom-[calc(100%+6px)] left-1/2 z-30 w-[min(320px,80vw)] -translate-x-1/2',
            'border border-rule-normal bg-popover text-popover-foreground shadow-lg',
            'p-3 text-left text-xs leading-relaxed',
          )}
          // popover 自体にホバーしてる間は閉じない
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span className="flex items-baseline justify-between gap-3">
            <span className="font-mincho text-sm text-ink-900">{entry.term}</span>
            {entry.reading && (
              <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                {entry.reading}
              </span>
            )}
          </span>
          <span className="mt-2 block text-ink-500">{entry.short}</span>
          <span className="mt-2 block border-t border-rule-dim pt-2">
            <Link
              href={`/glossary#${entry.id}`}
              className="text-[11px] uppercase tracking-[0.2em] text-vermilion hover:underline"
              onClick={close}
            >
              詳しく見る →
            </Link>
          </span>
        </span>
      )}
    </span>
  )
}
