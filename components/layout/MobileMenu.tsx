'use client'

import { List, X } from '@phosphor-icons/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { NAV_ITEMS, SITE } from '@/lib/site'
import { HeaderBar } from './HeaderBar'

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  // SSR時はPortalを使わない（document.bodyが無いため）。
  // マウント後にtrueにしてPortal先の存在を保証する。
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    // overflow: hidden だけだとスクロールバーの出現/消失で本体幅が変わり、
    // 連打時にヘッダーの道マークや本文が左右にガクッと揺れる。
    // 同じ幅の padding-right を body に足して補正する。
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [open])

  // ヘッダーに backdrop-blur が当たっていると、position: fixed が
  // ヘッダー要素を含有ブロックとして扱われ、全画面パネルがヘッダー高さに潰れる。
  // document.body への Portal で含有ブロックを body（実質ビューポート）に戻す。
  const panel = (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink-000 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="ナビゲーションメニュー"
    >
      {/* トップのヘッダーと同一コンポーネント（HeaderBar）で組むことで縦位置・サイズのズレを根絶する。 */}
      <HeaderBar
        onBrandNavigate={() => setOpen(false)}
        right={
          <button
            type="button"
            aria-label="メニューを閉じる"
            className="flex h-8 w-8 cursor-pointer items-center justify-center border border-rule-dim text-ink-400 transition-colors hover:border-vermilion hover:text-ink-900"
            onClick={() => setOpen(false)}
          >
            <X size={16} weight="regular" />
          </button>
        }
      />

      <nav className="flex flex-1 flex-col px-5 py-8" aria-label="モバイルナビゲーション">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item, index) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="group flex items-baseline gap-4 border-b border-rule-dim py-5 text-ink-900 transition-colors hover:text-vermilion"
              >
                <span className="tnum text-[11px] uppercase tracking-[0.24em] text-ink-300 group-hover:text-vermilion">
                  § {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-mincho text-2xl">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-3 border-t border-rule-dim pt-6">
          <a
            href={SITE.zenn}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="text-[11px] uppercase tracking-[0.24em] text-ink-400 transition-colors hover:text-ink-900"
          >
            Zenn ↗
          </a>
        </div>
      </nav>

      <footer className="border-t border-rule-dim px-5 py-4 text-[11px] uppercase tracking-[0.22em] text-ink-300">
        EST. 2026 / Personal Lab
      </footer>
    </div>
  )

  return (
    <>
      <button
        type="button"
        aria-label="メニューを開く"
        aria-expanded={open}
        className="flex h-8 w-8 cursor-pointer items-center justify-center border border-rule-dim text-ink-400 transition-colors hover:border-vermilion hover:text-ink-900 md:hidden"
        onClick={() => setOpen(true)}
      >
        <List size={16} weight="regular" />
      </button>

      {open && mounted ? createPortal(panel, document.body) : null}
    </>
  )
}
