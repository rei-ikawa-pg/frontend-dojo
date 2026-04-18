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
        'max-w-3xl',
        'font-sans leading-[1.9] text-ink-500',
        '[&_h1]:font-heading [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:mt-0 [&_h1]:mb-6 [&_h1]:text-ink-900',
        '[&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-ink-900',
        '[&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-ink-900',
        '[&_p]:mb-4 [&_p]:text-ink-500 [&_p]:[text-wrap:pretty]',
        '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-ink-500 [&_ul]:space-y-1.5',
        '[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-ink-500 [&_ol]:space-y-1.5',
        '[&_a]:text-vermilion [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-vermilion/40 hover:[&_a]:decoration-vermilion',
        '[&_code]:rounded-none [&_code]:border [&_code]:border-rule-dim [&_code]:bg-ink-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_code]:font-mono [&_code]:text-ink-900',
        '[&_strong]:font-semibold [&_strong]:text-ink-900',
        className,
      )}
    >
      {children}
    </div>
  )
}
