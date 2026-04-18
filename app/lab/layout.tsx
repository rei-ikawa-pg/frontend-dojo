/**
 * /lab/** 共通レイアウト。
 * - 非 Chromium 警告バナー
 * - パンくず + モードタブ
 * - 中身（children）は各 Lab ページが描画する
 */

import { BrowserCompatBanner } from '@/components/lab/BrowserCompatBanner'
import { LabBreadcrumb } from '@/components/lab/LabBreadcrumb'
import { LabModeTabs } from '@/components/lab/LabModeTabs'

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BrowserCompatBanner />
      <div className="mx-auto w-full max-w-7xl px-5 pt-8 md:px-8">
        <LabBreadcrumb />
        <div className="mt-6">
          <LabModeTabs />
        </div>
      </div>
      {children}
    </>
  )
}
