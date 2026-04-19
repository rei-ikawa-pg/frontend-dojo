'use client'

import { Slider as SliderPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max],
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col',
        className,
      )}
      {...props}
    >
      {/* Track (移動可能範囲のレール): パネル背景 `bg-card` と同色の `bg-muted` だと埋没するので、
          中明度の `bg-rule-normal` で「ここに沿って動かせる線」として視認できるようにしている。
          Range (現在値までの塗り) は `bg-primary` で highlight。
          orientation は data-[orientation=...] で明示的に分岐（Tailwind の短縮 `data-horizontal:`
          が Radix の `data-orientation="horizontal"` 属性にマッチしない環境を回避）。 */}
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow cursor-pointer overflow-hidden rounded-none bg-rule-normal data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-primary select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          // 「ドラッグできる」を視覚化するため、白い小四角ではなくグリップ風の縦長ハンドル。
          // 内側に 3 本の横線（aria-hidden）を入れてフェーダーらしさを出す。
          className={cn(
            'group/thumb relative flex shrink-0 cursor-grab items-center justify-center',
            'rounded-none border border-ring bg-white outline-none select-none',
            'shadow-sm ring-ring/50 transition-[transform,box-shadow]',
            'after:absolute after:-inset-2',
            'data-[orientation=horizontal]:h-6 data-[orientation=horizontal]:w-4',
            'data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-6',
            'hover:bg-ink-050 hover:ring-2',
            'focus-visible:ring-2 focus-visible:outline-hidden',
            'active:cursor-grabbing active:ring-2',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <span
            aria-hidden
            className="flex flex-col gap-[2px] group-data-[orientation=vertical]/thumb:flex-row"
          >
            <span className="block h-px w-2 bg-ink-500 group-data-[orientation=vertical]/thumb:h-2 group-data-[orientation=vertical]/thumb:w-px" />
            <span className="block h-px w-2 bg-ink-500 group-data-[orientation=vertical]/thumb:h-2 group-data-[orientation=vertical]/thumb:w-px" />
            <span className="block h-px w-2 bg-ink-500 group-data-[orientation=vertical]/thumb:h-2 group-data-[orientation=vertical]/thumb:w-px" />
          </span>
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
