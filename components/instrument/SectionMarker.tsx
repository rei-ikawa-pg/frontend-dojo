import { cn } from '@/lib/utils'

const KANJI = ['〇', '壱', '弐', '参', '肆', '伍', '陸', '漆', '捌', '玖']

type SectionMarkerProps = {
  /** 1 始まりの章番号。2 桁 0 埋めで表示される。 */
  index: number
  /** 欧文ラベル（大文字）。例: "HERO", "INDEX"。 */
  label?: string
  /** 和文のキャプション。 */
  caption?: string
  className?: string
}

/**
 * セクションの章番号を表示するマーカー。欧文序数 + 漢数字 + 和文キャプションを
 * 組み合わせる。技術書や製図の章題をイメージした意匠。
 */
export function SectionMarker({ index, label, caption, className }: SectionMarkerProps) {
  const paddedNum = String(index).padStart(2, '0')
  const kanji = index >= 0 && index < KANJI.length ? KANJI[index] : null

  return (
    <div
      className={cn(
        'flex items-center gap-4 text-[10px] uppercase tracking-[0.24em] text-ink-300',
        className,
      )}
    >
      <span className="tnum text-vermilion">§ {paddedNum}</span>
      <span aria-hidden className="h-px flex-1 max-w-[64px] bg-rule-dim" />
      {label && <span>{label}</span>}
      {caption && (
        <span className="font-mincho text-sm normal-case tracking-normal text-ink-400">
          {caption}
        </span>
      )}
      {kanji && (
        <span aria-hidden className="ml-auto font-mincho text-lg leading-none text-ink-200">
          {kanji}
        </span>
      )}
    </div>
  )
}
