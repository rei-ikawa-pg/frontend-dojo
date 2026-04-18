import { cn } from '@/lib/utils'

type RuleTicksProps = {
  /** 目盛り数。 */
  count?: number
  /** 目盛りの向き。 */
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

/**
 * 製図用定規の目盛りを模した装飾要素。意匠目的のみで機能は持たない。
 */
export function RuleTicks({ count = 24, orientation = 'horizontal', className }: RuleTicksProps) {
  const isH = orientation === 'horizontal'
  const ticks = Array.from({ length: count }, (_, i) => ({
    id: `${orientation}-${i}`,
    isMajor: i % 5 === 0,
    isMid: i % 5 === 2,
  }))

  return (
    <div
      aria-hidden
      className={cn(
        'flex',
        isH ? 'h-2 w-full flex-row items-end' : 'h-full w-2 flex-col items-end',
        className,
      )}
    >
      {ticks.map(({ id, isMajor, isMid }) => (
        <span
          key={id}
          className={cn(
            'flex-1 bg-rule-dim',
            isH ? 'mx-px' : 'my-px',
            isH && (isMajor ? 'h-2' : isMid ? 'h-1.5' : 'h-1'),
            !isH && (isMajor ? 'w-2' : isMid ? 'w-1.5' : 'w-1'),
          )}
          style={{ opacity: isMajor ? 0.8 : 0.4 }}
        />
      ))}
    </div>
  )
}
