import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ProseProps = {
  children: ReactNode
  className?: string
}

export function Prose({ children, className }: ProseProps) {
  return (
    <div
      className={cn(
        // min-w-0: grid/flex 親内で intrinsic 幅を超えて伸びないように。
        // 内部の <pre> が overflow-x:auto で横スクロールできる前提条件。
        'min-w-0 max-w-3xl',
        'font-sans leading-[1.9] text-ink-500',
        '[&_h1]:font-heading [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:mt-0 [&_h1]:mb-6 [&_h1]:text-ink-900',
        '[&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-ink-900',
        '[&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-ink-900',
        '[&_p]:mb-4 [&_p]:text-ink-500 [&_p]:[text-wrap:pretty]',
        '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-ink-500 [&_ul]:space-y-1.5',
        '[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-ink-500 [&_ol]:space-y-1.5',
        // リスト項目内で <code> が折り返されると、code の background/border が隣の行と
        // 重なって見えるため、li の line-height を本文より広めに取る
        '[&_li]:leading-[2.4]',
        '[&_a]:text-vermilion [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-vermilion/40 hover:[&_a]:decoration-vermilion',
        // インライン code 枠は意図的に小さめに: inline-block + align-middle で縦位置を安定させ、
        // 上下 padding を 0、font-size を 0.85em、leading-tight で内部高さを最小化する。
        // li の leading-[2.4] と合わせて、折り返しても上下の code 枠が接触しない寸法にしている。
        '[&_code]:inline-block [&_code]:align-middle [&_code]:leading-tight [&_code]:rounded-none [&_code]:border [&_code]:border-rule-dim [&_code]:bg-ink-100 [&_code]:px-1.5 [&_code]:py-0 [&_code]:text-[0.85em] [&_code]:font-mono [&_code]:text-ink-900',
        // fenced code block (<pre>) は SP で横スクロール可能にして、
        // 長い行があっても親要素を押し広げないようにする。
        '[&_pre]:mb-4 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-rule-dim [&_pre]:bg-ink-100 [&_pre]:p-3 [&_pre]:text-[0.85em] [&_pre]:leading-normal',
        // <pre> 内の <code> はインライン枠のスタイルをリセットして素のテキストとして流す。
        '[&_pre_code]:block [&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[1em] [&_pre_code]:leading-normal [&_pre_code]:whitespace-pre',
        '[&_strong]:font-semibold [&_strong]:text-ink-900',
        className,
      )}
    >
      {children}
    </div>
  )
}
