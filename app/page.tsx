import type { Metadata } from 'next'
import { CatalogSection } from '@/components/landing/CatalogSection'
import { FlowSection } from '@/components/landing/FlowSection'
import { Hero } from '@/components/landing/Hero'
import { IndexSection } from '@/components/landing/IndexSection'
import { ValueSection } from '@/components/landing/ValueSection'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: {
    absolute: `${SITE.name} — ${SITE.tagline}`,
  },
  description: SITE.description,
  alternates: { canonical: '/' },
}

export default function Home() {
  return (
    <>
      <Hero />
      <IndexSection />
      <ValueSection />
      <CatalogSection />
      <FlowSection />
    </>
  )
}
