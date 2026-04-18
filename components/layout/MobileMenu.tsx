'use client'

import { List, X } from '@phosphor-icons/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
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
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="メニューを開く"
        aria-expanded={open}
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <List size={20} weight="regular" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="ナビゲーションメニュー"
        >
          <div className="flex h-14 items-center justify-between px-4 border-b">
            <span className="font-heading text-lg">{SITE.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="メニューを閉じる"
              onClick={() => setOpen(false)}
            >
              <X size={20} weight="regular" />
            </Button>
          </div>
          <nav className="flex flex-col gap-1 p-4" aria-label="モバイルナビゲーション">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base text-foreground hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-1 border-t pt-4">
              <a
                href={SITE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-3 py-3 text-sm text-muted-foreground hover:bg-accent"
              >
                GitHub
              </a>
              <a
                href={SITE.zenn}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-3 py-3 text-sm text-muted-foreground hover:bg-accent"
              >
                Zenn
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
