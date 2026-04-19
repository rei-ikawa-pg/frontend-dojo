/**
 * Lab 3 各ステップのクイズ。
 * 型は components/lab/quiz.ts に集約。
 */

import type { Quiz } from '@/components/lab/quiz'

export type { Quiz, QuizOption } from '@/components/lab/quiz'

export const QUIZZES: readonly Quiz[] = [
  {
    stepId: 1,
    question: '親の state 更新で子は何回 render される？',
    options: [
      { id: 'a', text: '1 回 (親と同じタイミング)' },
      {
        id: 'b',
        text: '子の数だけ多重に render される',
        hint: '子は自分自身の render を 1 回するだけです。',
      },
      {
        id: 'c',
        text: '子は render されない',
        hint: '親の state が変わると、memo がない限り子にも伝わります。',
      },
    ],
    correctId: 'a',
    explanation:
      '親が再 render されると、その JSX 中に現れる子も 1 回再 render されます。memo がなければこの伝播は止まりません。',
  },
  {
    stepId: 2,
    question: 'memo 化された子が再 render を止めるためには props に何が必要？',
    options: [
      { id: 'a', text: 'すべての props が shallow equal であること' },
      {
        id: 'b',
        text: 'props の型が primitive であること',
        hint: 'primitive なら確かに安定ですが、それだけでは条件を言い切れません。',
      },
      {
        id: 'c',
        text: '子が useState を持っていないこと',
        hint: '内部の state 有無は再 render 判定に影響しません。',
      },
    ],
    correctId: 'a',
    explanation:
      'React.memo は前回と今回の props を shallow 比較し、すべて同一参照なら render をスキップします。primitive は値比較で同一、object は参照比較です。',
  },
  {
    stepId: 3,
    question: '`<Child user={{ id: 1 }} />` で memo が効かない理由は？',
    options: [
      {
        id: 'a',
        text: '毎 render で新しいオブジェクトが作られ、shallow 比較で参照が違うと判定されるため',
      },
      {
        id: 'b',
        text: 'オブジェクトは memo 比較の対象外だから',
        hint: '対象外ではなく、「毎回違うと判定される」のが正しいです。',
      },
      {
        id: 'c',
        text: 'React が object prop を特別扱いして memo を外すから',
        hint: '特別扱いは入っていません。純粋に参照比較の結果です。',
      },
    ],
    correctId: 'a',
    explanation:
      '{ id: 1 } と書くたびに別オブジェクトが生成されます。memo は === で比較するので、毎回「異なる prop」とみなされて再 render されます。',
  },
  {
    stepId: 4,
    question: 'Context と Zustand の再 render 範囲の違いは？',
    options: [
      { id: 'a', text: 'Context は全 consumer が再 render / Zustand は selector で絞った部分だけ' },
      {
        id: 'b',
        text: 'どちらも selector で絞れる',
        hint: 'React Context 単体には selector 機能がありません（useContextSelector は別ライブラリ）。',
      },
      {
        id: 'c',
        text: 'どちらも全 consumer が再 render される',
        hint: 'Zustand の selector は比較関数 (Object.is デフォルト) で再 render をスキップします。',
      },
    ],
    correctId: 'a',
    explanation:
      'Context.Provider の value が変わると、その下で useContext を呼ぶ全コンポーネントが再 render されます。Zustand は store の購読に selector を書けるため、必要な部分だけに絞れます。',
  },
  {
    stepId: 5,
    question: '派生 state (state から計算して別の state に保持) が問題を生む主因は？',
    options: [
      {
        id: 'a',
        text: '元 state の更新に追従する useEffect が余分な render を生み、同期ズレも起きるため',
      },
      {
        id: 'b',
        text: 'React が派生 state を検出してエラーを投げるため',
        hint: '実行時エラーは出ません。静かに動作がずれるのが怖いところです。',
      },
      {
        id: 'c',
        text: 'TypeScript がコンパイルを拒否するため',
        hint: '型システムでは検出できません。',
      },
    ],
    correctId: 'a',
    explanation:
      '派生値は都度計算する（必要なら useMemo で memo 化する）のが原則です。state に保持すると「元 → 派生」の追従 useEffect が必要となり、render サイクルが増え、同期ズレの窓も生まれます。',
  },
  {
    stepId: 6,
    question: 'render phase と commit phase の違いは？',
    options: [
      {
        id: 'a',
        text: 'render で VDOM を作り、commit で実 DOM に反映する。DOM 変更がなければ commit は軽い',
      },
      {
        id: 'b',
        text: 'render が GPU 処理、commit が CPU 処理',
        hint: 'どちらも CPU の JS 処理です。GPU は Composite 段階で登場します。',
      },
      {
        id: 'c',
        text: 'render は開発用、commit は本番用',
        hint: '両者は 1 回の更新で必ずペアで走ります。',
      },
    ],
    correctId: 'a',
    explanation:
      'render phase は純粋関数的で副作用を伴いません。commit phase で初めて DOM mutation と layout effects が走ります。「再 render されても DOM 変化がない」ケースは多く、過剰な memo は不要です。',
  },
] as const

export function getQuiz(stepId: number): Quiz | null {
  return QUIZZES.find((q) => q.stepId === stepId) ?? null
}
