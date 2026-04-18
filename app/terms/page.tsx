import type { Metadata } from 'next'
import { Prose } from '@/components/typography/Prose'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: '利用規約',
  description: 'フロントエンド道場の利用にあたっての免責事項と利用条件。',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8 md:py-16">
      <Prose>
        <h1>利用規約</h1>

        <h2>1. 本サイトの目的</h2>
        <p>
          {SITE.name}
          （本サイト）は、フロントエンド技術の学習・教育を目的とした個人運営のサイトです。
          商用利用・広告・アフィリエイトは行っていません。
        </p>

        <h2>2. 免責事項</h2>
        <ul>
          <li>
            本サイトで提供する情報・コード・計測値は、正確性を期しているものの、内容の完全性・最新性を
            保証するものではありません。
          </li>
          <li>
            本サイトのコンテンツに基づいて利用者が実施した施策の結果について、運営者は一切の責任を負いません。
          </li>
          <li>
            本サイトのインタラクティブ機能は、一部のブラウザ（主に Chromium
            系）でのみ完全に動作します。 他のブラウザでは機能が制限される旨を明示しています。
          </li>
        </ul>

        <h2>3. 禁止事項</h2>
        <ul>
          <li>本サイトへの過剰な負荷をかける行為（DoS 的なリクエスト等）</li>
          <li>RUM / フィードバックエンドポイントへの不正なデータ送信</li>
          <li>本サイトのコンテンツを無断で商用利用する行為</li>
        </ul>

        <h2>4. コンテンツの利用</h2>
        <p>
          本サイトの解説文・コードのライセンスは GitHub リポジトリに記載しています。
          学習目的での引用・参照は歓迎しますが、転載時は出典を明記してください。
        </p>

        <h2>5. サービスの変更・停止</h2>
        <p>運営者は、事前の通知なく本サイトの内容変更・一時停止・終了を行うことがあります。</p>

        <h2>6. 準拠法</h2>
        <p>本利用規約は日本法に準拠します。</p>

        <p>最終更新: 2026-04-18</p>
      </Prose>
    </div>
  )
}
