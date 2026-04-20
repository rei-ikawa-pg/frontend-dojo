import { LAB_MEMORY_LEAK_META } from '@/features/lab-memory-leak'
import { generateOgImage, ogContentType, ogSize } from '@/lib/og/template'
import { SITE } from '@/lib/site'

export const alt = `${LAB_MEMORY_LEAK_META.title} | ${SITE.name}`
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return generateOgImage({
    section: `§ ${String(LAB_MEMORY_LEAK_META.order).padStart(2, '0')} — Lab`,
    title: LAB_MEMORY_LEAK_META.title,
    description: LAB_MEMORY_LEAK_META.description,
  })
}
