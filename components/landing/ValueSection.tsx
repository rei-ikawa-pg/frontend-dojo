import { SectionMarker } from '@/components/instrument/SectionMarker'

const OUTCOMES = [
  {
    id: '01',
    title: 'ブラウザ内部のメンタルモデル',
    detail:
      'Layout / Paint / Composite の違い、Style 再計算がどこで走るか、Jank の発生点 — 座学では届かない層を手触りで掴める。',
    tags: ['Rendering', 'Memory', 'Event Loop'],
  },
  {
    id: '02',
    title: '数値で判断する目',
    detail:
      '「なんとなく遅い」ではなく「Style+Layout が 28ms 掛かった」と言える語彙を獲得。DevTools で同じことが読めるようになる。',
    tags: ['LoAF', 'Long Tasks', 'Profiling'],
  },
  {
    id: '03',
    title: '試して戻って確認、の反復速度',
    detail: 'トグル ON/OFF で即座に計測値が動く Lab。数分単位で仮説→検証のループを何周も回せる。',
    tags: ['Playground', 'Tutorial'],
  },
] as const

export function ValueSection() {
  return (
    <section
      id="outcomes"
      aria-labelledby="outcomes-heading"
      className="relative border-b border-rule-dim bg-ink-050/30"
    >
      <div className="mx-auto w-full max-w-7xl px-5 py-24 md:px-20 md:py-32">
        <SectionMarker
          index={3}
          label="OUTCOMES"
          caption="ここで得られるもの"
          className="mb-10 md:mb-14"
        />

        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2
            id="outcomes-heading"
            className="max-w-xl font-mincho text-3xl leading-tight tracking-tight text-ink-900 md:text-5xl"
          >
            30 分で、
            <br />
            <span className="text-vermilion">「分かった気」</span>
            ではない
            <br />
            理解を。
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-ink-500">
            以下は Lab を 1〜2 周して得られるスキル・感覚の目安です。個別の Lab
            ページに詳しい習得目標があります。
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-0 border-t border-rule-dim md:grid-cols-3">
          {OUTCOMES.map((o, idx) => (
            <li
              key={o.id}
              className="group relative flex flex-col gap-6 border-b border-rule-dim p-8 transition-colors hover:bg-ink-000 md:border-b-0 md:border-r md:last:border-r-0 md:p-10"
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-ink-300">
                <span className="tnum text-vermilion">§ {o.id}</span>
                <span>GAIN · {idx + 1}/3</span>
              </div>

              <h3 className="font-mincho text-2xl leading-snug text-ink-900 md:text-[28px]">
                {o.title}
              </h3>

              <p className="text-sm leading-relaxed text-ink-500">{o.detail}</p>

              <ul className="mt-auto flex flex-wrap gap-2 pt-2">
                {o.tags.map((t) => (
                  <li
                    key={t}
                    className="border border-rule-dim bg-ink-000 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-ink-400"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
