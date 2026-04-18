/**
 * Lab の可視化機能はブラウザ実装に強く依存するため、
 * 非 Chromium 系では計測が取れない旨を上部バナーで告知する。
 * - 初期 render では true を返してちらつき（mismatch）を避ける
 * - useEffect で UA 判定し、非 Chromium のみ表示
 */

'use client'

import { Warning } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { isChromium } from '@/lib/browser/detect'

export function BrowserCompatBanner() {
  const [compat, setCompat] = useState(true)

  useEffect(() => {
    setCompat(isChromium())
  }, [])

  if (compat) return null

  return (
    <div role="status" className="border-b border-vermilion/30 bg-vermilion/10 px-5 py-3 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-start gap-3 text-sm text-vermilion">
        <Warning size={18} weight="duotone" className="mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          この稽古場は <strong>Chromium 系ブラウザ</strong>（Chrome / Edge / Brave
          等）を推奨します。 LoAF API
          などの計測は非対応ブラウザでは取得できないため、一部のメトリクスが空欄になります。
        </p>
      </div>
    </div>
  )
}
