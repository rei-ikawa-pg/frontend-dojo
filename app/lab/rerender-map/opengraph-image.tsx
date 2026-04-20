import { LAB_RERENDER_MAP_META } from '@/features/lab-rerender-map'
import { generateOgImage, ogContentType, ogSize } from '@/lib/og/template'
import { SITE } from '@/lib/site'

export const alt = `${LAB_RERENDER_MAP_META.title} | ${SITE.name}`
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return generateOgImage({
    section: `§ ${String(LAB_RERENDER_MAP_META.order).padStart(2, '0')} — Lab`,
    title: LAB_RERENDER_MAP_META.title,
    description: LAB_RERENDER_MAP_META.description,
  })
}
