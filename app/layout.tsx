import type { Metadata } from 'next'
import { Instrument_Serif, JetBrains_Mono, Shippori_Mincho } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { RumProvider } from '@/features/rum'
import { SITE } from '@/lib/site'
import { cn } from '@/lib/utils'

const CF_ANALYTICS_TOKEN = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN
const RUM_ENABLED = process.env.NEXT_PUBLIC_RUM_ENABLED === 'true'
const RUM_ENDPOINT = '/api/rum/collect'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const shipporiMincho = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-mincho',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={cn(
        'dark h-full',
        jetbrainsMono.variable,
        instrumentSerif.variable,
        shipporiMincho.variable,
      )}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground font-mono antialiased selection:bg-accent/30 selection:text-foreground"
      >
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] [background-image:radial-gradient(circle_at_1px_1px,_var(--color-foreground)_1px,_transparent_0)] [background-size:24px_24px]"
        />
        <NuqsAdapter>
          <RumProvider endpoint={RUM_ENDPOINT} enabled={RUM_ENABLED}>
            <Header />
            <main className="relative z-10 flex-1">{children}</main>
            <Footer />
          </RumProvider>
        </NuqsAdapter>
        {CF_ANALYTICS_TOKEN && (
          <Script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: CF_ANALYTICS_TOKEN })}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  )
}
