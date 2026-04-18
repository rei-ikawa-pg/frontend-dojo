import Link from 'next/link'
import { SITE } from '@/lib/site'

const ABOUT_LINKS = [
  { label: '道場について', href: '/about' },
  { label: 'ロードマップ', href: '/roadmap' },
] as const

const EXTERNAL_LINKS = [
  { label: 'GitHub', href: SITE.github },
  { label: 'Zenn', href: SITE.zenn },
] as const

const LEGAL_LINKS = [
  { label: 'プライバシーポリシー', href: '/privacy' },
  { label: '利用規約', href: '/terms' },
  { label: 'お問い合わせ', href: '/contact' },
] as const

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <section aria-labelledby="footer-about">
            <h2
              id="footer-about"
              className="mb-3 text-sm font-medium text-foreground font-heading"
            >
              {SITE.name}
            </h2>
            <ul className="flex flex-col gap-2">
              {ABOUT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {EXTERNAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="footer-legal">
            <h2
              id="footer-legal"
              className="mb-3 text-sm font-medium text-foreground font-heading"
            >
              規約
            </h2>
            <ul className="flex flex-col gap-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="footer-contact">
            <h2
              id="footer-contact"
              className="mb-3 text-sm font-medium text-foreground font-heading"
            >
              連絡
            </h2>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href={SITE.feedbackForm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  フィードバックを送る
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © 2026 {SITE.name}
        </div>
      </div>
    </footer>
  )
}
