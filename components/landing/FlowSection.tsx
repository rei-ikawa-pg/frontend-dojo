import { SectionMarker } from '@/components/instrument/SectionMarker'

const STEPS = [
  {
    id: 'A',
    title: 'Tutorial',
    ja: '型を覚える',
    body: 'ステップを追って操作・計測値の見方を身につける。読みながら触る。',
    duration: '約 15 分',
  },
  {
    id: 'B',
    title: 'Playground',
    ja: '自由稽古',
    body: 'スライダーとトグルで自由に値を揺らし、仮説を立てて検証する。',
    duration: '自由',
  },
  {
    id: 'C',
    title: 'DevTools',
    ja: '実戦へ',
    body: '同じ事象を Chrome DevTools の Performance パネルで再現する手引き付き。',
    duration: '応用',
  },
] as const

export function FlowSection() {
  return (
    <section id="flow" aria-labelledby="flow-heading" className="border-b border-rule-dim">
      <div className="mx-auto w-full max-w-7xl px-5 py-24 md:px-20 md:py-32">
        <SectionMarker index={5} label="FLOW" caption="稽古の進め方" className="mb-10 md:mb-14" />

        <div className="mb-16 flex flex-col gap-5">
          <h2
            id="flow-heading"
            className="max-w-2xl font-mincho text-3xl leading-tight tracking-tight text-ink-900 md:text-5xl"
          >
            3 段で深まる、
            <br />
            稽古の筋道。
          </h2>
        </div>

        <ol className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-x-6 md:gap-y-0">
          {STEPS.map((step, i) => (
            <li key={step.id} className="relative flex flex-col gap-6">
              {/* A/B/C のレタープレート */}
              <div
                aria-hidden
                className="relative flex h-[104px] w-full items-center justify-center border border-rule-dim bg-ink-000"
              >
                <span className="font-serif text-5xl italic leading-none text-ink-900">
                  {step.id}
                </span>
                {i === 0 && (
                  <span className="absolute left-2 top-2 inline-block h-1.5 w-1.5 animate-pulse bg-vermilion" />
                )}
              </div>

              {/* 詳細テキスト */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-ink-300">
                  <span className="tnum">STEP {String(i + 1).padStart(2, '0')}</span>
                  <span>{step.duration}</span>
                </div>

                <h3 className="font-mincho text-2xl leading-snug text-ink-900 md:text-3xl">
                  <span className="mr-2 font-serif text-lg italic text-ink-500 md:text-xl">
                    {step.title}
                  </span>
                  {step.ja}
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-ink-500">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
