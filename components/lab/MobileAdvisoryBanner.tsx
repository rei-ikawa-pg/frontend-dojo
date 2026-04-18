/**
 * モバイル端末で Lab にアクセスした時に表示する「PC 推奨」告知バナー。
 *
 * 目的:
 *   - Lab の操作 UI（スライダー / プロパティトグル / 実行ボタン）は PC での操作に最適化されている
 *   - モバイルでも解説は読めるし Playground も動くが、操作感が落ちる旨をはっきり伝える
 *
 * BrowserCompatBanner との役割分担:
 *   - BrowserCompatBanner: ブラウザ（Chromium 以外）への警告
 *   - このコンポーネント:     デバイス（モバイル）への推奨
 *
 * 実装:
 *   - サーバでは判定せず、クライアントで navigator.userAgent から判定（Hydration mismatch 回避のため初期 false）
 */

'use client'

import { DeviceMobile } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { detectDeviceType } from '@/lib/browser/detect'

export function MobileAdvisoryBanner() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(detectDeviceType() === 'mobile')
  }, [])

  if (!isMobile) return null

  return (
    <div
      role="status"
      className="border-b border-rule-normal bg-ink-050 px-5 py-3 md:px-8"
      aria-label="PC推奨のお知らせ"
    >
      <div className="mx-auto flex w-full max-w-7xl items-start gap-3 text-sm text-ink-500">
        <DeviceMobile size={18} weight="duotone" className="mt-0.5 shrink-0 text-ink-400" />
        <p className="leading-relaxed">
          この稽古場は <strong className="text-ink-900">PC での操作</strong> を推奨します。解説と
          Playground はモバイルでも動作しますが、 スライダー / プロパティ操作は PC
          の方が扱いやすい設計です。
        </p>
      </div>
    </div>
  )
}
