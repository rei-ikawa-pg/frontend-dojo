import type { Metadata } from 'next'
import Link from 'next/link'
import { Prose } from '@/components/typography/Prose'
import { SITE } from '@/lib/site'

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

        <h2>技術スタック</h2>
        <p>
          本サイト自体が「こう作れば良い RUM
          になる」という見本になることを目指しています。主要な構成は以下のとおりです。
        </p>
        <ul>
          <li>Next.js 16 (App Router) / React 19 / TypeScript strict</li>
          <li>Tailwind CSS / shadcn/ui / MDX</li>
          <li>Zustand / nuqs / Zod</li>
          <li>Cloudflare Workers (OpenNext) / D1 / Web Analytics</li>
          <li>自前 RUM（web-vitals + LoAF + カスタムメトリクス）</li>
        </ul>

        <h2>ソースコード</h2>
        <p>
          サイトのソースコードは GitHub で公開しています。実装の参考にしたり、Issue
          で提案したりしてください。
        </p>
        <p>
          <a href={SITE.github} target="_blank" rel="noopener noreferrer">
            {SITE.github}
          </a>
        </p>

        <h2>連絡先</h2>
        <p>
          フィードバックやバグ報告は<Link href="/contact"> お問い合わせ</Link>
          からお願いします。Zenn で関連記事も公開しています。
        </p>
      </Prose>
    </div>
  )
}
