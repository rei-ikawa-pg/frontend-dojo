/**
 * @next/mdx が参照するコンポーネントマップ。
 * MDX 内で `<Term id="layout">Layout</Term>` が使えるよう、ここでグローバル登録する。
 */

import type { MDXComponents } from 'mdx/types'
import { Term } from '@/components/glossary/Term'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Term,
  }
}
