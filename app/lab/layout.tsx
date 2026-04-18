/**
 * /lab/** 共通レイアウト。
 * - 非 Chromium 警告バナー
 * - パンくず + モードタブ
 * - 中身（children）は各 Lab ページが描画する
 * - 末尾に FeedbackButton を配置（全 Lab ページ共通）
 */

import { BrowserCompatBanner } from '@/components/lab/BrowserCompatBanner'
import { LabBreadcrumb } from '@/components/lab/LabBreadcrumb'
import { LabModeTabs } from '@/components/lab/LabModeTabs'
import { MobileAdvisoryBanner } from '@/components/lab/MobileAdvisoryBanner'
import { FeedbackButton } from '@/features/feedback'

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BrowserCompatBanner />
      <MobileAdvisoryBanner />
      <div className="mx-auto w-full max-w-7xl px-5 pt-8 md:px-8">
        <LabBreadcrumb />
        <div className="mt-6">
          <LabModeTabs />
        </div>
      </div>
      {children}
      <div className="mx-auto w-full max-w-7xl px-5 pb-16 md:px-8">
        <FeedbackButton />
      </div>
    </>
  )
}
