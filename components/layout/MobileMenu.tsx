'use client'

import { List, X } from '@phosphor-icons/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { NAV_ITEMS, SITE } from '@/lib/site'

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open])

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

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-ink-000 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="ナビゲーションメニュー"
        >
          <div className="flex h-14 items-center justify-between border-b border-rule-dim px-5">
            <span className="flex flex-col leading-none">
              <span className="font-serif text-base italic text-ink-900">{SITE.nameEn}</span>
              <span className="mt-0.5 text-[11px] uppercase tracking-[0.28em] text-ink-400">
                {SITE.name}
              </span>
            </span>
            <button
              type="button"
              aria-label="メニューを閉じる"
              className="flex h-8 w-8 cursor-pointer items-center justify-center border border-rule-dim text-ink-400 transition-colors hover:border-vermilion hover:text-ink-900"
              onClick={() => setOpen(false)}
            >
              <X size={16} weight="regular" />
            </button>
          </div>

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
      )}
    </>
  )
}
