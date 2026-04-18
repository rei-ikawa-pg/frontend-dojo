import type { Metadata } from 'next'
import Link from 'next/link'
import { Prose } from '@/components/typography/Prose'

export const metadata: Metadata = {
  title: '道場について',
  description: 'フロントエンド道場の理念、対象読者、技術スタック、制作者について。',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8 md:py-16">
      <Prose>
        <h1>道場について</h1>

        <h2>このサイトが目指すもの</h2>
        <p>
          フロントエンドには、記事を読むだけでは腑に落ちない領域があります。
          レンダリングパイプライン、メモリリーク、スクロールジャンク、React の再レンダー — いずれも
          「手を動かして観察しないと、判断の基準が身につかない」類の問題です。
        </p>
        <p>
          フロントエンド道場は、こうした鬼門を<strong>読む代わりに触る</strong>ための場です。
          ブラウザ上で実際に DOM や CSS を操作し、LoAF API
          でフレーム時間を実測しながら、理論と実測を並べて確認できます。
        </p>

        <h2>誰向けか</h2>
        <ul>
          <li>英語記事を読むのに消耗している中級フロントエンドエンジニア</li>
          <li>ブラウザの内部やパフォーマンス最適化の判断基準を自分のものにしたい人</li>
          <li>チームに説明する際の「触って見せる」教材を探している技術リード</li>
        </ul>

        <h2>連絡先</h2>
        <p>
          フィードバックやバグ報告は<Link href="/contact"> お問い合わせ</Link>
          からお願いします。Zenn で関連記事も公開しています。
        </p>
      </Prose>
    </div>
  )
}
