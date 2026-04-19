/**
 * Lab 概要ページで「稽古 / 道場」モードへ誘導する大 CTA カード。
 *
 * - 漢字 1 文字の意匠 + 欧文サブラベル + 説明文 + アイコン
 * - `primary` が真のとき朱色（vermilion）で強調する。同じページ内で 1 つだけ true にする想定
 * - リンク先は `href`（呼び出し側が `${LAB_X_META.path}/tutorial` などを渡す）
 *
 * 3 Lab の概要ページで重複していた `ModeCta` ローカル関数をここに統合した。
 */

import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import type { ReactNode } from 'react'

export type ModeCtaProps = {
  href: string
  /** 漢字 1 文字（例: 稽 / 道） */
  kanji: string
  /** 和文ラベル（例: 稽古 / 道場） */
  label: string
  /** 欧文サブラベル（例: Tutorial / Playground） */
  subtitle: string
  description: string
  icon: ReactNode
  /** true で朱色強調。各ページで主導線のみに付ける */
  primary?: boolean
}

export function ModeCta({
  href,
  kanji,
  label,
  subtitle,
  description,
  icon,
  primary = false,
}: ModeCtaProps) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col gap-5 overflow-hidden border p-8 transition-colors ${
        primary
          ? 'border-vermilion/50 bg-vermilion/5 hover:bg-vermilion/10'
          : 'border-rule-dim bg-card hover:border-ink-500'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className={`flex h-14 w-14 items-center justify-center border font-mincho text-3xl leading-none ${
              primary ? 'border-vermilion/60 text-vermilion' : 'border-rule-normal text-ink-900'
            }`}
          >
            {kanji}
          </span>
          <div>
            <div
              className={`font-mincho text-xl leading-none ${primary ? 'text-vermilion' : 'text-ink-900'}`}
            >
              {label}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-ink-400">
              {subtitle}
            </div>
          </div>
        </div>
        <div
          className={`${primary ? 'text-vermilion' : 'text-ink-500'} transition-transform group-hover:translate-x-1`}
        >
          {icon}
        </div>
      </div>
      <p className="text-sm leading-relaxed text-ink-500">{description}</p>
      <span
        className={`mt-auto inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] ${
          primary ? 'text-vermilion' : 'text-ink-500 group-hover:text-ink-900'
        }`}
      >
        開く
        <ArrowRight
          size={12}
          weight="bold"
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
    </Link>
  )
}
