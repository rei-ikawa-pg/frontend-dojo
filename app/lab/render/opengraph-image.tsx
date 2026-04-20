import { LAB_RENDER_META } from '@/features/lab-render'
import { generateOgImage, ogContentType, ogSize } from '@/lib/og/template'
import { SITE } from '@/lib/site'

export const alt = `${LAB_RENDER_META.title} | ${SITE.name}`
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return generateOgImage({
    section: `§ ${String(LAB_RENDER_META.order).padStart(2, '0')} — Lab`,
    title: LAB_RENDER_META.title,
    description: LAB_RENDER_META.description,
  })
}
