import type { Metadata } from 'next'
import { Prose } from '@/components/typography/Prose'
import { ContactForm } from '@/features/contact'

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
          フィードバック・提案・バグ報告はこのフォームから受け付けています。
          お返事は可能な場合のみ、メールを記入いただいた方へお送りします（ベストエフォート）。
        </p>
        <p>
          各 Lab ページ末尾の Good / Bad ボタンからも匿名で一言コメントを送れます。
          短いフィードバックはそちらからでも構いません。
        </p>
      </Prose>

      <div className="mt-10 max-w-3xl">
        <ContactForm />
      </div>
    </div>
  )
}
