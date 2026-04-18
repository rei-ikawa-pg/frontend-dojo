import type { Metadata } from 'next'
import Link from 'next/link'
import { Prose } from '@/components/typography/Prose'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'フロントエンド道場で収集するデータの種類・目的・保存期間について。',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8 md:py-16">
      <Prose>
        <h1>プライバシーポリシー</h1>

        <p>
          フロントエンド道場（以下「本サイト」）における個人情報・行動データの取り扱いについて定めます。
          本サイトは個人開発の学習・教育目的のサイトであり、広告やアフィリエイトは掲載していません。
        </p>

        <h2>1. 収集するデータ</h2>
        <h3>1.1 自前 RUM（Real User Monitoring）</h3>
        <p>
          サイトの表示パフォーマンスを測定するため、以下を収集します。
          個人を特定できる情報は一切含まれません。
        </p>
        <ul>
          <li>Core Web Vitals（LCP / INP / CLS / FCP / TTFB）</li>
          <li>Long Animation Frames（フレーム時間、対応ブラウザのみ）</li>
          <li>
            各 Lab での計測値（フレームレート、メモリ使用量、操作から次フレームまでのレイテンシ等）
          </li>
          <li>
            匿名セッション ID（<code>sessionStorage</code> に保存、タブを閉じると消えます）
          </li>
          <li>ページパス、Lab ID、モード、デバイス種別、ブラウザ種別、ビューポートサイズ</li>
        </ul>
        <p>
          <strong>Cookie は使用しません</strong>。IP
          アドレスはサーバで受信時に即時破棄し、ログにも残しません。 User-Agent は「Chromium /
          Safari / Firefox / other」のいずれかへ抽出した後の値のみ保存します。
        </p>

        <h3>1.2 Cloudflare Web Analytics</h3>
        <p>
          ページビューや参照元などのビジネス指標を計測するため、Cloudflare Web Analytics
          を利用しています。同サービスは Cookie を使わず、個人を特定する情報は収集されません。
        </p>

        <h3>1.3 フィードバック</h3>
        <p>
          フィードバックボタンから送信された評価（Good/Bad）と任意のコメントは、 匿名セッション
          ID・送信元ページパスと共に保存されます。 コメントに個人情報を含めないようご協力ください。
        </p>

        <h2>2. データの保存先と期間</h2>
        <ul>
          <li>保存先: Cloudflare D1（SQLite ベース）</li>
          <li>RUM データ: 90 日経過で自動削除</li>
          <li>フィードバック: 当面の間保持（不要になった時点で一括削除）</li>
        </ul>

        <h2>3. 利用目的</h2>
        <ul>
          <li>サイト自体のパフォーマンス改善</li>
          <li>Lab の教材としての品質改善</li>
          <li>どの Lab / 解説が読まれているかの把握</li>
        </ul>

        <h2>4. 第三者への提供</h2>
        <p>
          収集したデータを第三者へ提供することはありません。 Cloudflare
          に対しては、同社のデータ処理規約に基づき処理されます。
        </p>

        <h2>5. お問い合わせ</h2>
        <p>
          本ポリシーに関する問い合わせは、
          <Link href="/contact">お問い合わせフォーム</Link>
          からお願いします。
        </p>

        <h2>6. 改訂</h2>
        <p>本ポリシーは必要に応じて改訂されます。改訂時は本ページの最終更新日を更新します。</p>
        <p>最終更新: 2026-04-18</p>
      </Prose>
    </div>
  )
}
