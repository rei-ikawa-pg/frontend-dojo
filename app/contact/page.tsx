import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr'
import type { Metadata } from 'next'
import { Prose } from '@/components/typography/Prose'
import { Button } from '@/components/ui/button'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: 'フロントエンド道場へのフィードバック・提案・バグ報告の送り先。',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8 md:py-16">
      <Prose>
        <h1>お問い合わせ</h1>
        <p>
          フィードバック・提案・バグ報告は以下のフォームから受け付けています。
          返信はベストエフォートですのでご了承ください。
        </p>

        <div className="not-prose my-8">
          <Button asChild size="lg">
            <a href={SITE.feedbackForm} target="_blank" rel="noopener noreferrer">
              フォームを開く
              <ArrowSquareOut size={16} weight="bold" className="ml-1" />
            </a>
          </Button>
        </div>

        <h2>GitHub Issue</h2>
        <p>バグや実装上の提案は、GitHub リポジトリの Issue でも受け付けます。</p>
        <p>
          <a href={SITE.github} target="_blank" rel="noopener noreferrer">
            {SITE.github}
          </a>
        </p>
      </Prose>
    </div>
  )
}
