import type { MetadataRoute } from 'next'
import { LABS } from '@/features/labs'
import { SITE } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/labs`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE.url}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE.url}/roadmap`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE.url}/glossary`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE.url}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE.url}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const labRoutes: MetadataRoute.Sitemap = LABS.filter((lab) => lab.status === 'published').flatMap(
    (lab) => [
      {
        url: `${SITE.url}${lab.path}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE.url}${lab.path}/tutorial`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${SITE.url}${lab.path}/playground`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ],
  )

  return [...staticRoutes, ...labRoutes]
}
