/**
 * Lab 2 各ステップの理解度クイズ。
 * 形式は Lab 1 と共通（1 ステップ 1 問、選択式、ヒント付き）。
 */

export type QuizOption = {
  id: string
  text: string
  hint?: string
}

export type Quiz = {
  stepId: number
  question: string
  options: readonly QuizOption[]
  correctId: string
  explanation: string
}

export const QUIZZES: readonly Quiz[] = [
  {
    stepId: 1,
    question: '`performance.memory.usedJSHeapSize` が「常に正確な値」とは限らない理由は？',
    options: [
      {
        id: 'a',
        text: 'ブラウザによっては精度が粗く丸められるため（Chromium 限定・Site Isolation 要件あり）',
      },
      {
        id: 'b',
        text: 'JS エンジンがわざと嘘の値を返すため',
        hint: '仕様的に「嘘をつく」わけではなく、セキュリティ目的で丸めているだけです。',
      },
      {
        id: 'c',
        text: 'Safari と Firefox でも同じ値が取れるため',
        hint: '逆です。Chromium 系でのみ提供されています。',
      },
    ],
    correctId: 'a',
    explanation:
      'performance.memory は非標準の Chromium 拡張です。Site Isolation の条件を満たさない場合は 3 分刻みに丸められますが、傾向を見る目的には十分使えます。',
  },
  {
    stepId: 2,
    question:
      '`useEffect` の中で `setInterval` を張ったとき、何を返すと Timer リークを避けられる？',
    options: [
      { id: 'a', text: '`() => clearInterval(id)` を return する' },
      {
        id: 'b',
        text: '依存配列に id を入れる',
        hint: 'id は useEffect の外で決まる値ではないため依存配列には入りません。',
      },
      {
        id: 'c',
        text: 'React が自動で解放してくれるため何も返す必要はない',
        hint: 'unmount で React が呼ぶのは return した関数だけです。',
      },
    ],
    correctId: 'a',
    explanation:
      'useEffect の cleanup 関数（return した関数）がアンマウント時に呼ばれます。ここで clearInterval しないと interval は生き続けてしまいます。',
  },
  {
    stepId: 3,
    question: 'AbortController を使うと Listener リークを防げる仕組みは？',
    options: [
      { id: 'a', text: '`abort()` 1 回で、同じ signal に紐付けた全ての listener が解除される' },
      {
        id: 'b',
        text: 'ブラウザが AbortController を識別し、不要な listener を自動削除してくれる',
        hint: '「自動で賢く削除」ではなく、明示的に解除しています。',
      },
      {
        id: 'c',
        text: 'listener は元から弱参照なので、Controller は GC のヒントとしてだけ使われる',
        hint: 'addEventListener の参照は強参照です。',
      },
    ],
    correctId: 'a',
    explanation:
      'addEventListener 第 3 引数に { signal } を渡すと、controller.abort() で一括解除されます。複数の listener をまとめて掃除できるのが利点です。',
  },
  {
    stepId: 4,
    question: '「Detached DOM」が問題になるのはなぜ？',
    options: [
      { id: 'a', text: '画面からは消えているのに JS オブジェクトとして生き続け、ヒープを食うから' },
      {
        id: 'b',
        text: '描画エンジンが壊れて画面が乱れるから',
        hint: '描画には影響しません。影響するのはメモリだけです。',
      },
      {
        id: 'c',
        text: 'removeChild してもブラウザが削除を忘れるから',
        hint: '削除自体は行われています。問題は JS 側の参照です。',
      },
    ],
    correctId: 'a',
    explanation:
      'DOM ツリーから外した（detached）ノードでも、JS の変数で参照されている限り GC されません。大きな subtree を抱えるとじわじわヒープが増えていきます。',
  },
  {
    stepId: 5,
    question: 'Closure が「大きな配列」を抱え込んでしまう典型は？',
    options: [
      {
        id: 'a',
        text: '外側スコープの配列を関数内で一度でも参照している + その関数が外で生存している',
      },
      {
        id: 'b',
        text: '配列を const で宣言するとキャプチャが強くなるから',
        hint: '宣言キーワードは解放の有無に影響しません。',
      },
      {
        id: 'c',
        text: '`async` 関数の戻り値は常に保持されるため',
        hint: '戻り値の型と解放は関係ありません。',
      },
    ],
    correctId: 'a',
    explanation:
      'Closure は外側のスコープ全体をまとめてキャプチャします。event handler に渡した関数が大きな配列を参照していると、その配列も handler と同じ寿命になります。',
  },
] as const

export function getQuiz(stepId: number): Quiz | null {
  return QUIZZES.find((q) => q.stepId === stepId) ?? null
}
