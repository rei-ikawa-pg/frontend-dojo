import { SectionMarker } from '@/components/instrument/SectionMarker'

const STATEMENTS = [
  {
    kanji: '壱',
    title: '読むより触る',
    body: 'ブラウザ内部の挙動は、言葉で説明されるほど掴みにくい。このラボは DOM とプロパティを操作しながら学ぶ設計になっています。',
  },
  {
    kanji: '弐',
    title: '観測と判定のハイブリッド',
    body: 'LoAF API でフレーム時間を実測し、CSS Triggers データで理論上の影響を並置する。勘ではなく数字で判断する力を育てます。',
  },
  {
    kanji: '参',
    title: 'DevTools への地続き',
    body: 'サイト内で概念を掴んだあと、同じ計測を Chrome DevTools 上で再現する手順まで案内します。座学で終わらせません。',
  },
] as const

export function IndexSection() {
  return (
    <section id="index" aria-labelledby="index-heading" className="border-b border-rule-dim">
      <div className="mx-auto w-full max-w-7xl px-5 py-24 md:px-20 md:py-32">
        <SectionMarker
          index={2}
          label="INDEX"
          caption="このサイトとは"
          className="mb-10 md:mb-14"
        />

        <div className="grid grid-cols-1 gap-16 md:grid-cols-[0.9fr_1.3fr]">
          <div>
            <h2
              id="index-heading"
              className="font-mincho text-4xl leading-[1.2] tracking-tight text-ink-900 md:text-5xl"
            >
              ブラウザという、
              <br />
              手元でいちばん深い
              <br />
              <span className="text-vermilion">ブラックボックス</span>。
            </h2>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-ink-500 md:text-base">
              毎日触っているはずなのに、フレームの中で何が走っているかは見えないまま。
              このラボでは、ブラウザの内部を
              <span className="text-ink-900">計測器付きの稽古場</span>
              で一度分解して、手元で開けてみる経験を用意しました。
            </p>
          </div>

          <ol className="flex flex-col">
            {STATEMENTS.map((st, idx) => (
              <li
                key={st.kanji}
                className="relative grid grid-cols-[auto_1fr] items-start gap-8 border-t border-rule-dim py-8 first:border-t-0 first:pt-0 md:py-10"
              >
                <div className="flex flex-col items-center gap-2">
                  <span
                    aria-hidden
                    className="font-mincho text-6xl leading-none text-ink-900 md:text-7xl"
                  >
                    {st.kanji}
                  </span>
                  <span className="tnum text-[11px] uppercase tracking-[0.24em] text-ink-300">
                    {String(idx + 1).padStart(2, '0')} / 03
                  </span>
                </div>
                <div className="flex flex-col gap-3 pt-1">
                  <h3 className="font-mincho text-2xl text-ink-900 md:text-3xl">{st.title}</h3>
                  <p className="max-w-lg text-sm leading-relaxed text-ink-500 md:text-base">
                    {st.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
