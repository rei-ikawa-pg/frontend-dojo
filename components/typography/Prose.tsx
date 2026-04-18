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
        'font-sans leading-relaxed text-foreground',
        '[&_h1]:font-heading [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:mt-0 [&_h1]:mb-6',
        '[&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4',
        '[&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-8 [&_h3]:mb-2',
        '[&_p]:mb-4 [&_p]:text-muted-foreground',
        '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground [&_ul]:space-y-1',
        '[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-muted-foreground [&_ol]:space-y-1',
        '[&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline',
        '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono',
        '[&_strong]:text-foreground',
        className,
      )}
    >
      {children}
    </div>
  )
}
