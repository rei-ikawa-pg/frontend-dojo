import { cn } from '@/lib/utils'

type SparklineProps = {
  /** 0..1 に正規化された値の配列。 */
  data: number[]
  width?: number
  height?: number
  className?: string
  stroke?: string
  fill?: string
}

/**
 * 副次的な指標の推移を示す簡易スパークライン。出力は決定的なので
 * Server Components でも使用可能。
 */
export function Sparkline({
  data,
  width = 96,
  height = 24,
  className,
  stroke = 'currentColor',
  fill,
}: SparklineProps) {
  if (data.length === 0) return null

  const step = width / Math.max(1, data.length - 1)
  const points = data
    .map((v, i) => {
      const x = i * step
      const y = height - Math.max(0, Math.min(1, v)) * height
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  const areaPoints = fill ? `0,${height} ${points} ${width},${height}` : undefined

  return (
    <svg
      role="img"
      aria-label="計測値の推移スパークライン"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
    >
      <title>計測値の推移スパークライン</title>
      {areaPoints && <polygon points={areaPoints} fill={fill} opacity={0.25} />}
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
