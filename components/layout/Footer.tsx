import Link from 'next/link'
import { SITE } from '@/lib/site'

const COLUMNS = [
  {
    id: 'labs',
    title: 'LAB',
    subtitle: '稽古場',
    links: [
      { label: '稽古場一覧', href: '/labs' },
      { label: 'ロードマップ', href: '/roadmap' },
      { label: '道場について', href: '/about' },
    ],
  },
  {
    id: 'legal',
    title: 'LEGAL',
    subtitle: '規約',
    links: [
      { label: 'プライバシーポリシー', href: '/privacy' },
      { label: '利用規約', href: '/terms' },
      { label: 'お問い合わせ', href: '/contact' },
    ],
  },
] as const

const EXTERNAL = [
  { label: 'GitHub', href: SITE.github },
  { label: 'Zenn', href: SITE.zenn },
  { label: 'Feedback', href: SITE.feedbackForm },
] as const

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-rule-dim bg-ink-000">
      {/* フッタ上端の朱色アクセント帯 */}
      <div className="relative h-[2px] bg-ink-050">
        <div className="absolute inset-y-0 right-0 w-1/12 bg-vermilion" aria-hidden />
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 pb-10 pt-14 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* ブランド（サイト名・説明） */}
          <section aria-labelledby="footer-brand" className="flex flex-col gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-ink-300">
                § 00 — Colophon
              </div>
              <h2 id="footer-brand" className="mt-3 font-serif text-4xl italic text-ink-900">
                {SITE.nameEn}
              </h2>
              <p className="mt-1 font-mincho text-lg text-ink-500">{SITE.name}</p>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-ink-400">
              {SITE.tagline}
              <br />
              日本語のインタラクティブラボ。
            </p>
          </section>

          {COLUMNS.map((col) => (
            <section
              key={col.id}
              aria-labelledby={`footer-${col.id}`}
              className="flex flex-col gap-4"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-vermilion">
                  § {col.title}
                </div>
                <h2 id={`footer-${col.id}`} className="mt-1 font-mincho text-base text-ink-500">
                  {col.subtitle}
                </h2>
              </div>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[11px] uppercase tracking-[0.18em] text-ink-400 transition-colors hover:text-ink-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section aria-labelledby="footer-external" className="flex flex-col gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-vermilion">§ LINK</div>
              <h2 id="footer-external" className="mt-1 font-mincho text-base text-ink-500">
                外部
              </h2>
            </div>
            <ul className="flex flex-col gap-2.5">
              {EXTERNAL.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] uppercase tracking-[0.18em] text-ink-400 transition-colors hover:text-ink-900"
                  >
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-rule-dim pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[10px] uppercase tracking-[0.24em] text-ink-400">
            © 2026 {SITE.name} · Personal Lab · Built in Tokyo
          </p>
          <p className="tnum text-[10px] uppercase tracking-[0.24em] text-ink-400">
            v0.1.0 / Early Access
          </p>
        </div>
      </div>
    </footer>
  )
}
