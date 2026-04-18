/**
 * JSON-LD を <script type="application/ld+json"> として埋め込むユーティリティ。
 * SSR 時にそのまま文字列として出力するので、CSR でのハイドレーション差分は起きない。
 */

import type { Thing, WithContext } from 'schema-dts'

type JsonLdProps = {
  data: WithContext<Thing> | ReadonlyArray<WithContext<Thing>>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD を構造化データとしてそのまま埋め込むため
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
