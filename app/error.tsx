'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center">
      <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
        予期しないエラーが発生しました
      </h1>
      <p className="text-muted-foreground">
        ページの再読み込みをお試しください。問題が解決しない場合はお知らせください。
      </p>
      {error.digest && (
        <code className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
          digest: {error.digest}
        </code>
      )}
      <Button onClick={reset}>再試行</Button>
    </div>
  )
}
