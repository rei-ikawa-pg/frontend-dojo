/**
 * 朱色アクセント帯 + 道マーク行（h-[72px]）のヘッダー上段。
 * トップのヘッダーとモバイルメニュー内ヘッダーで共通利用することで、
 * 両者のサイズや縦位置がずれる余地をなくす。
 */
import type { ReactNode } from 'react'
import { BrandMark } from './BrandMark'

type Props = {
  /** 行の右端に配置するアクション（PCはNav＋Zenn＋ハンバーガー、モーダル内は×ボタン）。 */
  right: ReactNode
  /** 行を max-w-7xl mx-auto に包むか（ページ内ヘッダーはtrue、モーダル内は横いっぱいで使うのでfalse）。 */
  contained?: boolean
  /** 道マーククリック時に追加で呼ぶ処理（モーダル内はメニューを閉じる用途）。 */
  onBrandNavigate?: () => void
}

export function HeaderBar({ right, contained = false, onBrandNavigate }: Props) {
  const rowClass = contained
    ? 'mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-6 px-5 md:px-8'
    : 'flex h-[72px] items-center justify-between gap-6 px-5'

  return (
    <>
      <div className="relative h-[2px] bg-ink-050">
        <div className="absolute inset-y-0 left-0 w-1/12 bg-vermilion" aria-hidden />
      </div>
      {/* 下端境界はフルブリードで引く（行は max-w-7xl のまま中央寄せ） */}
      <div className="border-b border-rule-dim">
        <div className={rowClass}>
          <BrandMark onNavigate={onBrandNavigate} />
          {right}
        </div>
      </div>
    </>
  )
}
