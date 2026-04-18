/**
 * @next/mdx が参照するコンポーネントマップ。
 * MDX 内の h1 / p / ul 等に渡す要素を差し替えられる。
 * 本プロジェクトでは Prose コンポーネント側で装飾しているため、
 * ここではパススルーに留める（必要になったら個別上書きする）。
 */

import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components }
}
