import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center">
      <p className="text-6xl font-heading font-semibold text-muted-foreground">404</p>
      <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
        お探しのページは見つかりませんでした
      </h1>
      <p className="text-muted-foreground">
        URL が間違っているか、ページが移動した可能性があります。
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">トップへ戻る</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/labs">稽古場一覧へ</Link>
        </Button>
      </div>
    </div>
  )
}
