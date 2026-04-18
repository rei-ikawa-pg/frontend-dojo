/**
 * 各チュートリアルステップに対応するクイズ定義。
 *
 * 方針:
 *   - 1 ステップ 1 問（ストレスを増やさない）
 *   - 選択式（自由記述は採点が難しいため）
 *   - 不正解時はヒント（正解へ辿る手がかり）を表示
 *   - 正解時は補足で「なぜそうなのか」を 1-2 行追加
 *   - 結果は RUM へ `lab.tutorial.quiz_result` で送信し、後で管理画面で集計する
 */

export type QuizOption = {
  id: string
  text: string
  /** この選択肢を選んだ時のヒント（正解の選択肢は省略） */
  hint?: string
}

export type Quiz = {
  stepId: number
  question: string
  options: readonly QuizOption[]
  /** 正解の選択肢 id */
  correctId: string
  /** 正解後の補足（「なぜそうなるか」を 1-2 行） */
  explanation: string
}

export const QUIZZES: readonly Quiz[] = [
  {
    stepId: 1,
    question: '1 フレームの処理はどの順序で進みますか？',
    options: [
      { id: 'a', text: 'Layout → Style → Paint → Composite', hint: 'Style はどの段階で確定するでしょうか？' },
      { id: 'b', text: 'Style → Layout → Paint → Composite' },
      { id: 'c', text: 'Paint → Composite → Style → Layout', hint: 'まだピクセルを描く前に、まず何を決める必要があります。' },
    ],
    correctId: 'b',
    explanation: 'まず各要素に当たる CSS を確定 (Style) し、位置とサイズ (Layout)、ピクセル (Paint)、合成 (Composite) の順で進みます。',
  },
  {
    stepId: 2,
    question: 'width を毎フレーム変え続けている時、LoAF 実測の Style+Layout 時間は？',
    options: [
      { id: 'a', text: '0 ms に張り付く（Layout は走らない）', hint: 'width は「要素のサイズ」を決める情報です。周囲の位置に影響を与えませんか？' },
      { id: 'b', text: '有意な時間が乗る（数 ms 以上）' },
      { id: 'c', text: '固定で 16.67 ms', hint: '16.67 ms は 60fps の 1 フレーム上限値で、Style+Layout 固有の数字ではありません。' },
    ],
    correctId: 'b',
    explanation: 'width はサイズ情報なので、変わると周囲レイアウトの再計算が必要になり Layout が走ります。',
  },
  {
    stepId: 3,
    question: 'background-color を変えた時、スキップされるフェーズは？',
    options: [
      { id: 'a', text: 'Style', hint: 'どの色が当たるかを決める工程なので、色を変えれば Style は必ず走ります。' },
      { id: 'b', text: 'Layout' },
      { id: 'c', text: 'Paint', hint: 'ピクセルの色そのものを塗り直す工程なので、ここはスキップできません。' },
      { id: 'd', text: 'Composite', hint: '最終的な合成は毎フレーム必要です。' },
    ],
    correctId: 'b',
    explanation: '色はサイズや位置に関係ないので、Layout は不要。Paint と Composite だけで済みます。',
  },
  {
    stepId: 4,
    question: 'transform が他のプロパティより軽いのはなぜ？',
    options: [
      { id: 'a', text: 'GPU で合成レイヤーをずらすだけで済むため' },
      { id: 'b', text: 'ブラウザが transform を特別扱いして最適化しているため', hint: '特別扱いというより、設計上「どこまで影響するか」が違います。' },
      { id: 'c', text: 'フレームレートが自動で上がるから', hint: '軽さの原因と結果が逆になっています。' },
    ],
    correctId: 'a',
    explanation: 'transform は事前に Paint されたレイヤーの合成情報だけを書き換えるので、Layout も Paint も走らず GPU 合成だけで済みます。',
  },
  {
    stepId: 5,
    question: 'CSS Triggers の理論と LoAF の実測が一致するのは、どういう意味？',
    options: [
      { id: 'a', text: 'ブラウザの設計として「どのプロパティでどこまで走るか」が決まっている' },
      { id: 'b', text: 'ブラウザが CSS Triggers の表を参照して動いている', hint: '表の方が後から書かれたものです。ブラウザの挙動を観察して整理されたものが表です。' },
      { id: 'c', text: '偶然の一致', hint: '何度計測しても一致するなら、それは偶然ではなく設計です。' },
    ],
    correctId: 'a',
    explanation: 'Blink など各エンジンのソースで「このプロパティはどこまで影響するか」が決まっていて、CSS Triggers はそれを整理した資料です。',
  },
  {
    stepId: 6,
    question: '軽い transform と重い width を同時に動かした時、1 フレームのコストは？',
    options: [
      { id: 'a', text: 'transform 側の軽さに引き寄せられる', hint: '1 フレームは「走る必要があるフェーズの一番深いところまで」必ず通ります。' },
      { id: 'b', text: 'width 側のコストに引きずられる' },
      { id: 'c', text: '両方の平均になる', hint: '平均する仕組みはありません。深い方に合わせて全部走ります。' },
    ],
    correctId: 'b',
    explanation: '一度でも Layout が必要になれば、そのフレームは Style+Layout+Paint+Composite を全部通るので、重い側のコストに支配されます。',
  },
  {
    stepId: 7,
    question: '軽いはずの transform でも要素を 2000 個動かすと FPS が落ちる理由は？',
    options: [
      { id: 'a', text: '要素が増えると Layout が走り始めるため', hint: 'transform は本来 Composite のみ。要素が増えても性質は変わりません。' },
      { id: 'b', text: '合成するレイヤー数が増えて GPU の処理が重くなるため' },
      { id: 'c', text: 'transform が内部的に Layout を呼ぶようになるため', hint: 'transform の挙動は要素数で変わりません。' },
    ],
    correctId: 'b',
    explanation: 'Composite だけで済んでも、合成対象が増えれば GPU のバジェットを食います。「軽い × 多量 = 重い」は現場でよく見る構図です。',
  },
  {
    stepId: 8,
    question: 'DevTools Performance パネルで紫色に表示される領域は何？',
    options: [
      { id: 'a', text: 'JavaScript の実行時間', hint: 'JavaScript は黄色で表示されます。' },
      { id: 'b', text: 'Rendering（Style 再計算 + Layout）' },
      { id: 'c', text: 'Paint のみ', hint: 'Paint は緑で分けて表示されます。' },
    ],
    correctId: 'b',
    explanation: 'DevTools では Rendering (Style + Layout) が紫、Painting が緑、Scripting が黄色、Loading が水色で色分けされます。本サイトの Style+Layout がこの紫に対応します。',
  },
] as const

export function getQuiz(stepId: number): Quiz | null {
  return QUIZZES.find((q) => q.stepId === stepId) ?? null
}
