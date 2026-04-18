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
 * 位置決め:
 *   - trigger ボタンの getBoundingClientRect() から popover の位置を算出し、
 *     position: fixed で画面に直接配置する。これにより、祖先の overflow や
 *     sticky コンテナの内側にいても画面端でクリップされない。
 *   - 水平方向は trigger の中央寄せ → 画面両端に対して MARGIN でクランプ
 *   - 垂直方向は trigger の上に出すのが基本。上が狭ければ下に flip
 *   - 開いた後にスクロール / リサイズされたら追従が面倒なので一度閉じる（シンプル優先）
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

type Position = {
  top: number
  left: number
  /** 上に出す場合は true、下に flip した場合は false */
  above: boolean
}

const POPOVER_MAX_WIDTH = 320
const POPOVER_HEIGHT_ESTIMATE = 160
const EDGE_MARGIN = 12
const TRIGGER_GAP = 8

export function Term({ id, children }: TermProps) {
  const entry = getGlossary(id)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Position | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLSpanElement | null>(null)
  // hover で開いた時に pointerleave で遅延して閉じる（マウス移動の震えで消えないように）
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const descId = useId()

  const close = useCallback(() => {
    setOpen(false)
    setPos(null)
  }, [])

  const computePosition = useCallback((): Position | null => {
    const btn = buttonRef.current
    if (!btn || typeof window === 'undefined') return null
    const rect = btn.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const popoverWidth = Math.min(POPOVER_MAX_WIDTH, viewportWidth - EDGE_MARGIN * 2)

    // 水平: trigger 中央に寄せ、両端で EDGE_MARGIN 未満にならないようクランプ
    const rawLeft = rect.left + rect.width / 2 - popoverWidth / 2
    const left = Math.max(
      EDGE_MARGIN,
      Math.min(rawLeft, viewportWidth - popoverWidth - EDGE_MARGIN),
    )

    // 垂直: 上が狭いなら下に flip
    const above = rect.top >= POPOVER_HEIGHT_ESTIMATE + TRIGGER_GAP + EDGE_MARGIN
    const top = above ? rect.top - TRIGGER_GAP : rect.bottom + TRIGGER_GAP

    // 画面外の top はクランプ（下に flip した時に画面下にはみ出す対応）
    const clampedTop = above
      ? top
      : Math.min(top, viewportHeight - POPOVER_HEIGHT_ESTIMATE - EDGE_MARGIN)

    return { top: clampedTop, left, above }
  }, [])

  // 開いている間: 位置計算 + 外クリック / Escape / スクロール / リサイズで閉じる
  useEffect(() => {
    if (!open) return
    setPos(computePosition())
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (buttonRef.current?.contains(target)) return
      if (popoverRef.current?.contains(target)) return
      close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    // スクロール / リサイズ追従は煩雑になるので、単純に閉じる
    const onReflow = () => close()
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onReflow, true)
    window.addEventListener('resize', onReflow)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onReflow, true)
      window.removeEventListener('resize', onReflow)
    }
  }, [open, close, computePosition])

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
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={buttonRef}
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

      {open && pos && (
        <span
          ref={popoverRef}
          role="tooltip"
          id={descId}
          style={{
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            maxWidth: `${POPOVER_MAX_WIDTH}px`,
            width: 'calc(100vw - 24px)',
          }}
          className={cn(
            'fixed z-50 block border border-rule-normal bg-popover text-popover-foreground shadow-lg',
            'p-3 text-left text-xs leading-relaxed',
            pos.above ? '-translate-y-full' : '',
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
