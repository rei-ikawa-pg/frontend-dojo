/**
 * ヘッダーとモバイルメニューで共通利用する「道」マーク＋サイト名ブロック。
 * トップのヘッダーとオーバーレイで見た目が揃わないと違和感が出るため、
 * 1 か所に集約して差分を防ぐ。
 */
import Link from 'next/link'
import { SITE } from '@/lib/site'

type Props = {
  /** Link化するか。false の場合は静的な span（既にリンクの入れ子に置く場合など） */
  asLink?: boolean
  /** Link クリック時のハンドラ。モバイルメニューでは閉じる用途。 */
  onNavigate?: () => void
}

export function BrandMark({ asLink = true, onNavigate }: Props) {
  const inner = (
    <>
      <span
        aria-hidden
        className="relative flex h-11 w-11 items-center justify-center border border-vermilion/70 font-mincho text-[26px] leading-none text-vermilion transition-colors group-hover:bg-vermilion/10"
      >
        道
        <span
          aria-hidden
          className="pointer-events-none absolute -right-[1px] -top-[1px] h-1.5 w-1.5 border-t border-r border-vermilion"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-[1px] -left-[1px] h-1.5 w-1.5 border-b border-l border-vermilion"
        />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-serif text-[22px] italic leading-none text-ink-900">
          {SITE.nameEn}
        </span>
        <span className="mt-1 font-mincho text-[13px] text-ink-400">{SITE.name}</span>
      </span>
    </>
  )

  if (asLink) {
    return (
      <Link
        href="/"
        onClick={onNavigate}
        className="group flex items-center gap-4 transition-opacity hover:opacity-90"
      >
        {inner}
      </Link>
    )
  }

  return <span className="group flex items-center gap-4">{inner}</span>
}
