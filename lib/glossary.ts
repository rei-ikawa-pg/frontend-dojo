/**
 * 用語集。
 *
 * - Term コンポーネント / /glossary ページで共有
 * - short は 1-2 行の即席定義（popover 用）
 * - long は /glossary ページ用の本格解説（MDX 風マークアップは使わず plain に留める）
 * - 関連用語は see で参照。循環参照は避ける
 */

export type GlossaryEntry = {
  id: string
  term: string
  reading?: string
  short: string
  long: string
  see?: readonly string[]
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  'rendering-pipeline': {
    id: 'rendering-pipeline',
    term: 'レンダリングパイプライン',
    reading: 'Rendering Pipeline',
    short:
      'ブラウザが 1 フレームを描くまでの流れ。Style → Layout → Paint → Composite の 4 段階を通る。',
    long: '各要素に当たる CSS を確定する Style、位置とサイズを計算する Layout、ピクセル列に落とす Paint、GPU でレイヤーを合成する Composite の 4 段階で構成される。どの CSS プロパティを変更したかによって、この中の「どこまで走るか」が決まる。',
    see: ['style', 'layout', 'paint', 'composite'],
  },
  style: {
    id: 'style',
    term: 'Style',
    reading: 'スタイル再計算',
    short: 'どの CSS ルールがどの要素に当たるかを確定させる工程。Recalculate Style とも。',
    long: 'DOM とスタイルシートを突き合わせ、各要素の最終的なスタイル値（computed style）を確定する段階。どの CSS プロパティを変えても Style は必ず走る。DevTools Performance パネルでは紫で表示される。',
    see: ['rendering-pipeline'],
  },
  layout: {
    id: 'layout',
    term: 'Layout',
    reading: 'レイアウト',
    short: '各要素の位置とサイズを計算する工程。サイズ系プロパティを変えると走る。',
    long: '確定した Style をもとに、要素の位置・サイズ・行送りなどを決める工程。width / height / top / margin などサイズや位置に関わるプロパティを変えると走る。周囲の要素にも影響が及ぶため、発生するコストは比較的大きい。',
    see: ['style', 'paint', 'composite', 'reflow'],
  },
  paint: {
    id: 'paint',
    term: 'Paint',
    reading: 'ペイント',
    short: '各要素をピクセル列として塗る工程。色や影を変えるとここまで走る。',
    long: 'Layout の結果に基づいて、各要素を実際のピクセル（色・枠・影など）として描き込む段階。まだ画面に出る前のレイヤー単位の仕上げで、background-color / color / box-shadow など見た目系のプロパティで走る。',
    see: ['layout', 'composite', 'repaint'],
  },
  composite: {
    id: 'composite',
    term: 'Composite',
    reading: 'コンポジット / 合成',
    short:
      '事前に描いた各レイヤーを GPU で重ね合わせて最終画面を作る工程。transform / opacity はここだけで済む。',
    long: 'Paint で作られた合成レイヤーを GPU で重ね合わせて最終画面を作る段階。transform や opacity はこの段階の情報だけを書き換えるため、Layout / Paint をスキップできる。アニメーションを軽くするなら transform / opacity を使う、という定石の根拠はここにある。',
    see: ['paint', 'compositor-layer'],
  },
  'compositor-layer': {
    id: 'compositor-layer',
    term: '合成レイヤー',
    reading: 'Compositor Layer',
    short:
      'ブラウザが内部で分けて保持している描画単位。transform の軽さはこのレイヤー単位の合成で成立する。',
    long: 'ブラウザは要素を複数の内部レイヤーに分けて Paint し、最後に Composite で重ね合わせる。will-change: transform や 3D transform などが適用されるとレイヤーが独立し、そのレイヤーだけを GPU で動かせるため軽くなる。ただしレイヤー数が増えすぎるとメモリと GPU 負荷が跳ね上がる副作用もある。',
    see: ['composite'],
  },
  loaf: {
    id: 'loaf',
    term: 'LoAF',
    reading: 'Long Animation Frames API',
    short:
      'Chromium 123+ で使える新しい計測 API。1 フレーム内の Style+Layout / Rendering / Script の内訳を取得できる。',
    long: '従来の long task API よりも細かく、個別フレームに対して scriptDuration / styleAndLayoutStart / renderStart / duration などを取得できる。Safari / Firefox では未対応。本サイトの実測はこの API をベースにしている。',
    see: ['performance-observer', 'long-task'],
  },
  'long-task': {
    id: 'long-task',
    term: 'Long Task',
    reading: 'ロングタスク',
    short: '50ms を超えるメインスレッドのタスク。ユーザー操作に対する応答性を損なう目安。',
    long: 'PerformanceObserver で type: "longtask" を観測すると、50 ms を超えたタスクが取れる。LoAF 非対応ブラウザではこちらがフォールバックとして使われる。',
    see: ['loaf'],
  },
  'css-triggers': {
    id: 'css-triggers',
    term: 'CSS Triggers',
    short: 'どの CSS プロパティが Layout / Paint / Composite のどこまで走らせるかをまとめた資料。',
    long: 'Paul Lewis らが公開していた分類表。Blink / Gecko / WebKit のソースに埋まっている「どのプロパティがどのフェーズに影響するか」を整理したもので、本サイトの「理論」列はこれに準拠している。原典サイトは閉鎖されたがアーカイブが閲覧可能。',
    see: ['rendering-pipeline'],
  },
  fps: {
    id: 'fps',
    term: 'FPS',
    reading: 'Frames Per Second',
    short: '1 秒あたりのフレーム描画数。60 FPS 以上で「滑らか」と感じる目安。',
    long: '標準的な画面は 60 Hz リフレッシュレートなので、60 FPS = 毎フレーム 16.67 ms 以内に描画が終わっている状態。下がると「カクつき」「ジャンク」として体感される。',
    see: ['frame-budget', 'raf'],
  },
  'frame-budget': {
    id: 'frame-budget',
    term: 'フレームバジェット',
    reading: 'Frame Budget',
    short:
      '60 FPS を維持するため 1 フレームで使える時間 = 約 16.67 ms。ここを超えるとフレーム落ちする。',
    long: '60 Hz の画面で 60 FPS を維持するには、1000ms / 60 ≒ 16.67 ms に全ての処理（JS 実行 + Style + Layout + Paint + Composite）を収める必要がある。現実的には 10 ms 前後で終えて、余裕を残すのが望ましい。',
    see: ['fps', 'loaf'],
  },
  raf: {
    id: 'raf',
    term: 'requestAnimationFrame',
    reading: 'rAF',
    short: '次のフレーム描画直前にコールバックを呼ぶ API。アニメーションの標準入り口。',
    long: 'setTimeout や setInterval の代わりに使うアニメーション用 API。ブラウザのフレームタイミングに同期するため、無駄な中間フレームが走らない。本サイトの FPS メーターもこれをベースに測定している。',
    see: ['fps'],
  },
  reflow: {
    id: 'reflow',
    term: 'Reflow',
    short: 'Layout の別名。特に、すでに描画済みの画面に再計算が走るケースを指すことが多い。',
    long: '歴史的には Gecko 由来の呼び方。Chromium では Layout と呼ぶが、実質同じものを指していることがほとんど。ブログなどでは Reflow / Relayout / Layout が混在するので、読むときは同義と思って差し支えない。',
    see: ['layout'],
  },
  repaint: {
    id: 'repaint',
    term: 'Repaint',
    short: 'Paint の再実行。色や影を変えた時に走る。Reflow を伴わないのが特徴。',
    long: 'Layout が不要（位置・サイズが変わらない）だが描き直しが必要な変更に対して走る。background-color や box-shadow の変更はこの Repaint のみで済むケース。',
    see: ['paint'],
  },
  'performance-observer': {
    id: 'performance-observer',
    term: 'PerformanceObserver',
    short: 'ブラウザのパフォーマンス系イベント（LCP, longtask, LoAF 等）を購読する API。',
    long: 'observer.observe({ type: ... }) で必要なエントリ種別だけを指定して観測する。本サイトの RUM とフレーム計測はこの API の上に成り立っている。',
    see: ['loaf', 'long-task'],
  },
  'devtools-performance': {
    id: 'devtools-performance',
    term: 'DevTools Performance パネル',
    short: 'Chrome DevTools の計測タブ。Layout / Paint / Script などの時間を色分けして可視化する。',
    long: '⌘⌥I で開き、Performance タブで Record ボタンを押すと、その間のフレーム内訳がタイムラインで表示される。紫 = Rendering（Style + Layout）、緑 = Painting、黄色 = Scripting、水色 = Loading。本サイトの計測と対応する。',
    see: ['loaf'],
  },
  lcp: {
    id: 'lcp',
    term: 'LCP',
    reading: 'Largest Contentful Paint',
    short:
      'ページのメインコンテンツが描画されるまでの時間。Core Web Vitals の目玉指標で、2.5 秒以下が Good。',
    long: 'ビューポート内で最大の画像やテキストブロックが描画されたタイミング。ユーザーが「ページが来た」と感じる瞬間の近似。画像の最適化、フォント遅延、サーバ応答改善が主な打ち手。',
    see: [],
  },
  inp: {
    id: 'inp',
    term: 'INP',
    reading: 'Interaction to Next Paint',
    short:
      'ユーザー操作から次のフレーム描画までの遅延。Core Web Vitals の応答性指標。200 ms 以下が Good。',
    long: '2024 年から FID（First Input Delay）を置き換えた指標。クリック/タップ/キー入力からブラウザが次に画面を更新するまでの時間を取る。長い JS 処理や高頻度の Layout / Paint が悪化の主要因。',
    see: ['frame-budget'],
  },
  cls: {
    id: 'cls',
    term: 'CLS',
    reading: 'Cumulative Layout Shift',
    short:
      'ページの「ガタつき」の指標。読み込み中に要素が予期せずずれる量を累積計測。0.1 以下が Good。',
    long: '画像サイズ未指定の後読み込み、広告や iframe の挿入、Web フォント切り替わりなどが原因。サイズを事前予約する / 新規コンテンツは上から割り込ませない、が王道対策。',
    see: [],
  },
} as const

export type GlossaryId = keyof typeof GLOSSARY

export function getGlossary(id: string): GlossaryEntry | null {
  return (GLOSSARY as Record<string, GlossaryEntry>)[id] ?? null
}

/** /glossary ページ表示用に並べ替え（リード順 = 学習順の目安） */
export const GLOSSARY_ORDER: readonly string[] = [
  'rendering-pipeline',
  'style',
  'layout',
  'paint',
  'composite',
  'compositor-layer',
  'reflow',
  'repaint',
  'loaf',
  'long-task',
  'css-triggers',
  'fps',
  'frame-budget',
  'raf',
  'performance-observer',
  'devtools-performance',
  'lcp',
  'inp',
  'cls',
]
