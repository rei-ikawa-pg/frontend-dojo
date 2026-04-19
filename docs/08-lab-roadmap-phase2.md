# フロントエンド道場 Phase 2+ Lab ロードマップ & 難易度タグ設計

最終更新: 2026-04-18 / ステータス: ドラフト (R 合意: 中級者特化 + 難易度タグ)

## 0. サマリ

- **読者ターゲット**: Phase 2 以降も中級フロントエンドエンジニア特化を維持。初心者 / 上級者向けのコース分割はしない
- **差別化軸**: 各 Lab に **難易度タグ (初段 / 二段 / 三段)** + **分野タグ** を付与し、中級の幅を明示する
- **Phase 2+ Lab 候補 7 個**: メモリリーク / 再レンダリング / イベントループ / スタッキングコンテキスト / Next.js キャッシュ / Hydration / INP 解剖
- **Phase 2 推奨構成**: Lab 2 (メモリリーク) + Lab 5 (スタッキングコンテキスト) を同梱公開
- **Phase 3 推奨**: Lab 3 (再レンダリング) — フラッグシップ化(既存計画のスクロールジャンクを置き換え)
- **正式版**: Lab 4 / Lab 6 / Lab 7 / Lab 8

---

## 1. 位置付け判断: 中級者特化の維持

### 1.1 背景

Phase 1 MVP の時点で「中級フロントエンドエンジニア向け」と定義(CLAUDE.md §0.1)。Phase 2 検討時に「初心者〜上級者のコース分割」案が挙がったが、以下の理由で却下する。

### 1.2 採用理由(中級特化)

- **差別化の最大化**: 「触って腑に落ちる」という道場の価値は、**予想と実測のズレが最大化される層**=「読んで分かった気になっている中級者」で最大効用を持つ。初心者はそもそも読んだ量が少なく、上級者は既に腑に落ちている
- **競合との棲み分け**: 初心者向けは Progate / MDN JP / ドットインストール等の日本語無料教材が層厚く、上級向けは Zenn 長文 / 技術書典 / 登壇の領域。真っ向勝負を避け、空白地帯を突く
- **工数の現実性**: Lab 1 つあたり工数 M〜L (2-3 週)。3 レベル × 複数 Lab は個人開発では維持不能で、全層で平凡になるリスクが高い

### 1.3 却下案: コース分割

- **初心者コース**: HTML/CSS/JS 基礎、フレームワーク入門。既存教材との差別化が弱い
- **上級者コース**: JIT/V8 内部、Compiler、ブラウザエンジン実装。観測 API が存在せず「触って」価値が発揮できない(実装可能性△)

### 1.4 代替策: 難易度タグ

中級の中にも幅がある(「中級の入口」と「中級の上位」)。Lab ごとに難易度を 3 段階で提示して、読者が自分に合う Lab を選べるようにする。コース分割の利点(流入の多様化)の一部を低コストで回収する。

---

## 2. 難易度タグ設計

### 2.1 タグ体系

2 軸構成。

1. **難易度タグ(主軸)**: 初段 / 二段 / 三段 — Lab 1 件に 1 つ必須
2. **分野タグ(副軸)**: ブラウザランタイム / React・Next.js / CSS / パフォーマンス / ネットワーク / セキュリティ / アクセシビリティ — Lab 1 件に 1〜2 つ

### 2.2 難易度タグの付与基準

| タグ | 想定読者 | 前提 Lab | 想定学習時間 | 概念の抽象度 |
|------|---------|---------|------------|-------------|
| **初段** (Entry) | 中級の入口 | なし(独立) | 60〜90 分 | 基礎概念 1〜2 個の獲得 |
| **二段** (Core) | 中級の主戦場 | 1 Lab | 90〜120 分 | 基礎概念の組合せ、実務頻出 |
| **三段** (Advanced) | 中級の上位 | 2 Lab 以上 or 高抽象度 | 120 分〜 | 多層問題、複数概念の相互作用 |

### 2.3 UI / URL への反映

- **`/labs` (Lab 一覧)**: カード上部に難易度バッジ + 分野タグ。難易度/分野でフィルタ可能(nuqs で URL 状態保持)
- **`/lab/xxx` (Lab 概要)**: ヘッダー直下に難易度バッジ + 想定学習時間 + 前提 Lab へのリンク
- **URL には含めない**: URL は意味的(`/lab/memory-leak`)で、タグは metadata 扱い
- **SEO / 構造化データ**: JSON-LD `educationalLevel` (beginner/intermediate/advanced に mapping) と `timeRequired` (ISO 8601 duration) に反映

### 2.4 タグ命名の選定理由

- **道場メタファーの節度ある活用**: CLAUDE.md §4.1 「道場メタファーを節度を保って使う」方針。既に UI コピーで「稽古」「◯段目」等を使用しており整合的
- **段位の意味合い**: 柔道/剣道の初段は「技術習得の完了」を示す。中級 = 技術習得済みの含意と合致
- **progression の明示**: 数字で進捗が読み取れる(1→2→3)

### 2.5 却下した案

- **白帯/茶帯/黒帯**: 黒帯が最難と誤解される、初心者向けニュアンスが混ざる
- **Lv.1 / Lv.2 / Lv.3**: ゲーム由来で道場世界観に合わない
- **初級/中級/上級**: 「中級特化で中級向け分類」と矛盾する表現になる

---

## 3. Phase 2+ 鬼門の洗い出し

Lab 1 (レンダリングパイプライン) を除く、中級者の実務頻出の鬼門を 20 項目。

| # | 鬼門 | カテゴリ | 読むだけで曖昧になる理由 | 陥りやすい罠 |
|---|---|---|---|---|
| 1 | イベントループ (microtask / macrotask / rAF) | ブラウザランタイム | 出力順序が非直感的な例(Promise vs setTimeout(0))を紙面では追えず、rAF 発火位置の理解も曖昧 | `setTimeout(0)` を即時と誤解、microtask 飢餓の存在を知らない |
| 2 | メモリリーク (Closure / Listener / Detached DOM) | ブラウザランタイム | heap snapshot を取らずに「リークの型」が身につかない | `useEffect` cleanup を呪文化、Closure 経由リークに気付けない |
| 3 | Layout Thrashing (forced sync reflow) | ブラウザランタイム | read→write の順序崩れの具体コードを書かないと結び付かない | `offsetWidth` をループ内で読む、バッチ化の発想が出ない |
| 4 | クロージャと Stale State | JS 言語仕様 | 各関数インスタンスが別環境をキャプチャする事実が `useEffect` / `setInterval` で急に難解化 | 依存配列忘れは認識するが、古い値が見える理由を説明できない |
| 5 | `this` binding / アロー関数 | JS 言語仕様 | クラス・コールバック・ハンドラで散発的に変わる | `bind` / アロー関数をおまじないで使う |
| 6 | 非同期エラー伝搬 | JS 言語仕様 | 失敗パターンは実行しないと見えない | `forEach` で `await` で直列化すると誤解、エラーが消える経路に無自覚 |
| 7 | React 再レンダリングの伝播 | React/Next.js | どの prop/state 更新がどこまで伝播するかの追跡観点が身につかない | `memo` を信心で付ける、Context を global state に流用 |
| 8 | Hydration ミスマッチ | React/Next.js | 発生源(時刻/乱数/ブラウザ API/locale)の列挙知識に留まる | `suppressHydrationWarning` で警告を消して根本を放置 |
| 9 | RSC 境界 / `'use client'` | React/Next.js | 何がシリアライズされるか / どこで切れるかが記事では身につかない | `'use client'` をページトップに貼って RSC の利点喪失 |
| 10 | Next.js Cache 4 層 | React/Next.js | 4 層の条件分岐の説明文が長く、挙動と紐付かない | `cache:'no-store'` と `revalidate:0` と `dynamic='force-dynamic'` の差を説明できない |
| 11 | HTTP キャッシュ (`Cache-Control`, ETag, SWR) | ネットワーク/HTTP | ディレクティブ組合せが多く、実 Request/Response 観察まで挙動不明 | `must-revalidate` と `no-cache` を混同、SWR が単体で動くと誤解 |
| 12 | CORS (Simple vs Preflight, credentials) | ネットワーク/HTTP | Preflight 発火条件が列挙知識 | `*` で許可すれば通ると思い込み、credentials と組合せで詰まる |
| 13 | Cookie 属性 (SameSite, Secure, HttpOnly, Partitioned) | ネットワーク/HTTP | Lax/Strict/None と CSRF・Cross-site fetch の関係が実挙動と結び付かない | SameSite=Lax で CSRF 対策完了と誤解 |
| 14 | INP のサブパート | パフォーマンス | input delay / processing / presentation の内訳が抽象的 | 原因特定せず debounce で対症療法 |
| 15 | スタッキングコンテキストと z-index | CSS | 新スタッキング文脈生成条件の列挙を暗記できない | `z-index:9999` を積むが効かない、親 `transform` で突然壊れる |
| 16 | カスケード / @layer / 詳細度 | CSS | @layer 導入で優先順位ルールが複雑化、実挙動との不一致で混乱 | `!important` で殴る、Tailwind と衝突を説明できない |
| 17 | Flexbox/Grid の intrinsic sizing | CSS | 解決順序は触らないと追えない | `flex:1` で縮まないと悩む、`min-width:0` の出番を知らない |
| 18 | XSS (DOM-based, framework bypass) | セキュリティ | フレームワークが守ってくれると信じすぎる | URL サニタイズなしに `href` 代入、`javascript:` を見逃す |
| 19 | フォーカス管理 (Modal / Skip link / `aria-live`) | アクセシビリティ | SR 読み上げ順 / トラップ / 復帰は実機で動かすまで体感できない | Modal でフォーカスが背景に漏れる、Skip link を置くだけで安心 |
| 20 | Web Worker / SharedArrayBuffer (参考) | ブラウザランタイム | メインスレッド分離の実感が湧かない | postMessage のコストを軽視、COOP/COEP の要件を知らない |

---

## 4. インタラクティブ化適性評価

◎ = 直接観測 API あり / ○ = 間接観測 / △ = 観測 API なし、シミュレーション必要。

| # | 鬼門 | 可視化 | 操作 | 鬼門度 | 差別化 | 実装 | 総合 |
|---|---|---|---|---|---|---|---|
| 1 | イベントループ | ◎ | ◎ | ◎ | ◎ | ○ | **◎** |
| 2 | メモリリーク | ○ | ◎ | ◎ | ◎ | ○ | **○◎** |
| 3 | Layout Thrashing | ◎ | ◎ | ◎ | △ (Lab 1 近接) | ◎ | ○ |
| 4 | Stale Closure | △ | ○ | ◎ | ◎ | ◎ | ○ |
| 5 | `this` binding | △ | △ | ○ | ◎ | ◎ | △ |
| 6 | 非同期エラー伝搬 | ○ | ◎ | ○ | ◎ | ◎ | ○ |
| 7 | React 再レンダリング | ◎ | ◎ | ◎ | ◎ | ○ | **◎** |
| 8 | Hydration ミスマッチ | ◎ | ◎ | ◎ | ◎ | ○ | **◎** |
| 9 | RSC 境界 | ○ | ◎ | ◎ | ◎ | ○△ | ○ |
| 10 | Next.js Cache 4 層 | ◎ | ◎ | ◎ | ◎ | ○ | **◎** |
| 11 | HTTP キャッシュ | ○ | ◎ | ◎ | ◎ | ◎ | **◎** |
| 12 | CORS | ○ | ◎ | ○ | ◎ | ○ | ○ |
| 13 | Cookie 属性 | ◎ | ◎ | ◎ | ◎ | ○ | ○◎ |
| 14 | INP サブパート | ◎ | ◎ | ◎ | ○ | ◎ | **◎** |
| 15 | スタッキングコンテキスト | ◎ | ◎ | ◎ | ◎ | ◎ | **◎** |
| 16 | カスケード / @layer | ○ | ○ | ○ | ◎ | △ | ○ |
| 17 | Flexbox/Grid sizing | ◎ | ◎ | ◎ | ◎ | ○ | ◎ |
| 18 | XSS | ○ | ◎ | ◎ | ◎ | ○ | ○◎ |
| 19 | フォーカス管理 | ○ | ◎ | ◎ | ◎ | ○ | ○ |
| 20 | Web Worker | ○ | ◎ | △ | ◎ | ○ | △ |

**選定基準**: 総合 **◎** を中心に、分野分散と Lab 1 との補完性、難易度の幅を確保。

---

## 5. 推薦 Lab 一覧 (7 個)

各 Lab に難易度タグ・分野タグ・想定時間・前提 Lab を明示。

### Lab 2: メモリリークの稽古場 / `memory-leak`

- **難易度**: **二段** / **分野**: ブラウザランタイム / **想定時間**: 90〜120 分
- **ルート**: `/lab/memory-leak`
- **前提 Lab**: Lab 1 (DevTools Performance / Memory 導線の前提)
- **キャッチコピー**: 「GC が片付けない理由を、ヒープの増え方で目撃する」
- **学習ゴール**:
  - setInterval / EventListener / Detached DOM / Closure 各典型リークを触って再現できる
  - `performance.memory` と DevTools Memory panel の読み方を身体化できる
  - コンポーネントアンマウント時の cleanup 設計パターンを判別できる
- **推定実装工数**: M

### Lab 3: 再レンダリングの地図 / `rerender-map`

- **難易度**: **二段** / **分野**: React・Next.js / **想定時間**: 90〜120 分
- **ルート**: `/lab/rerender-map`
- **前提 Lab**: Lab 1 (フレーム概念)
- **キャッチコピー**: 「どこまで塗り直しているか、木の上で光らせて見る」
- **学習ゴール**:
  - state 更新が Component ツリーをどう伝播するかを視覚的に把握できる
  - `memo` / 参照安定性 / Context の影響範囲を実測で比較できる
  - 派生 state とキャッシュの罠を自分のコードで検出できる
- **推定実装工数**: L

### Lab 4: イベントループの内視鏡 / `event-loop`

- **難易度**: **二段** / **分野**: ブラウザランタイム / **想定時間**: 90〜120 分
- **ルート**: `/lab/event-loop`
- **前提 Lab**: Lab 1 (1 フレームの内訳)
- **キャッチコピー**: 「`console.log` の順序で、あなたの非同期モデルを試す」
- **学習ゴール**:
  - microtask / macrotask / rAF / rIC の実行順序を予想し実測で検証できる
  - `setTimeout(0)` の実態と clamp を体感できる
  - microtask 飢餓による UI 凍結を再現できる
- **推定実装工数**: M

### Lab 5: スタッキングコンテキストの森 / `stacking-context`

- **難易度**: **初段** / **分野**: CSS / **想定時間**: 60〜90 分
- **ルート**: `/lab/stacking-context`
- **前提 Lab**: なし(独立)
- **キャッチコピー**: 「`z-index: 9999` が効かない森を、文脈の木で歩く」
- **学習ゴール**:
  - 新スタッキング文脈が生成される条件一覧を触って確認できる
  - 親の文脈が子の z-index を閉じ込める現象を再現できる
  - `isolation: isolate` と Portal の使い分けを判断できる
- **推定実装工数**: S

### Lab 6: Next.js キャッシュ四重奏 / `nextjs-cache`

- **難易度**: **三段** / **分野**: React・Next.js / **想定時間**: 120〜180 分
- **ルート**: `/lab/nextjs-cache`
- **前提 Lab**: なし(独立、ただし Next.js 15+ の基礎知識前提)
- **キャッチコピー**: 「4 層のキャッシュを一気通貫で光らせる」
- **学習ゴール**:
  - Request Memo / Data / Full Route / Router の各キャッシュを hit/miss で区別できる
  - `cache`, `revalidate`, `tags`, `dynamic`, `revalidateTag` の効き所を理解できる
  - 「フォームが反映されない」実務トラブルを層ごとに診断できる
- **推定実装工数**: L

### Lab 7: Hydration の探偵 / `hydration-detective`

- **難易度**: **三段** / **分野**: React・Next.js / **想定時間**: 120〜150 分
- **ルート**: `/lab/hydration-detective`
- **前提 Lab**: Lab 3 (再レンダリング理解が望ましい)
- **キャッチコピー**: 「SSR の影と CSR の実体が、どこでズレたのか」
- **学習ゴール**:
  - ミスマッチ原因 4 分類(時刻・乱数・環境・locale)を再現できる
  - `useEffect` / `dynamic(ssr:false)` / `suppressHydrationWarning` のトレードオフを比較できる
  - Hydration の前後で起きる CLS を計測で紐付けられる
- **推定実装工数**: M

### Lab 8: INP の解剖室 / `inp-autopsy`

- **難易度**: **三段** / **分野**: パフォーマンス / **想定時間**: 120〜150 分
- **ルート**: `/lab/inp-autopsy`
- **前提 Lab**: Lab 1 + Lab 4
- **キャッチコピー**: 「1 クリックを input delay / processing / presentation に切る」
- **学習ゴール**:
  - INP の 3 フェーズを attribution API で分解して読める
  - JS 重い / 描画重い / スレッド塞がれ の各原因を実測で区別できる
  - `scheduler.yield` / `startTransition` / `requestIdleCallback` の適用範囲を判断できる
- **推定実装工数**: M

---

## 6. 「腑に落ちる」の定義と設計原則

### 6.1 認知プロセス 3 段階

「腑に落ちる」を以下 3 段階の認知プロセスに分解する。曖昧な「なんとなく分かる」状態を明示的に避け、**予想の言語化**を毎 Lab の入口に据える。

**段階 1: 既存メンタルモデルの外在化 (Externalization)**
無自覚なモデルを Hook の予想クイズで言語化させる。これをしないと正しい説明が「上書き」ではなく「併存」となり、場面で誤モデルが呼び出される。

**段階 2: モデルと実測の衝突 (Conflict)**
予想が実測に裏切られる瞬間がメンタルモデル破壊のトリガ(Piaget の disequilibration)。衝突がないと正しい説明は暗記知識に収納されるだけ。観測 API の出力をそのまま並べ(合成値を見せない)、信頼性を担保する。

**段階 3: 新モデルの再構築 + 転移 (Reconstruction & Transfer)**
- Near transfer: Playground で変数を変えたとき同じ原則が働く経験を反復
- Far transfer: 振り返りで「実務コードのどこに出現するか」を 3 つ以上の具体例で示す

### 6.2 認知負荷の配分(Sweller)

- **内在的負荷**(概念の本質的な複雑さ): 最小要素数で設計、1 ステップあたり同時操作変数 ≤3
- **外在的負荷**(UI 混乱・不要な装飾): 徹底削減、道場メタファーは装飾に留めない
- **学習関連負荷**(パターン統合の思考): 認知資源を振り向ける

### 6.3 「腑に落ちた」の行動ベース指標

自己申告ではなく行動で観測する。

1. Playground で予想値と実測値のズレを自発的に調査する
2. 振り返りクイズ(応用問題)で**別コード形**になっても正答する
3. 「もし A を B に変えたらどうなるか」を自分で予測できる

---

## 7. 標準 Lab 構成テンプレート

全 Lab 共通の 5 セクション構成。Lab 1 の 8 ステップ案を包含する上位レイヤ。

### 7.1 導入 Hook (90 秒以内)

**目的**: 既存メンタルモデルを外在化させる。

- **予想クイズ形式**: 3〜5 択 × 1〜2 問、答え合わせは実測デモ
- **驚きのデモ形式**: 直感に反する結果を出す 30 秒インタラクション
- **必須条件**: 中級者で正答率 40〜60% になる設計(RUM で事後調整可)

**Lab 1 への適用**: 「1 万個の `<div>` の `width` を変えたときと `transform` を変えたときのフレーム時間はどちらが長い? 何倍か?」

### 7.2 チュートリアル (段階的概念獲得)

**目的**: 内在的負荷を下げる順序で概念を 1 つずつ獲得させる。

- 1 ステップ = 1 新概念 + ≤2 既得概念の統合
- 1 ステップあたり同時操作変数 ≤3(認知負荷理論の Element Interactivity 制約)
- 各ステップ: **目的 → 操作指示 → 予想 → 実測 → 解説 → 進捗確認**
- 「次のステップ」遷移は**操作完了検知を優先**(固定 Next ボタンより教育効果高)
- 進捗表示は任意解除可能(自由に往復)

**Lab 1 への適用**: Step 2「Layout を走らせる」では `width` トグルのみ、FPS と Style+Layout 時間のみ観測。`background-color` も `transform` も Step 2 では触らせない。

### 7.3 プレイグラウンド (自由操作と観測)

**目的**: Near transfer を反復させる。

- 操作可能変数: 3〜6(Tutorial で登場した全変数の重ね合わせ)
- 観測指標: 2〜4(過多は視線分散)
- **予想欄**: 実行前に任意で「次に何が起こるか」書ける入力欄
- **プリセット**: 代表的問題パターン 3〜5(破綻例/理想例/罠例)
- **リセット**と**スナップショット共有**(URL hash で状態共有、nuqs で実装)

### 7.4 振り返り (持ち帰り / Far Transfer)

**目的**: 実務コードへの転移を明示設計する。

- **「実務でこう出る」コード例**: 3 つ以上の実コードスニペット(Before/After)
- **DevTools 誘導**: Chrome DevTools 該当 panel への 3〜5 ステップ手順 + スクショ
- **関連 Zenn 記事**: 同著者の長文解説へのリンク(記事 = 精読、Lab = 体感 の分業)
- **参考文献**: web.dev / MDN / Chrome for Developers 等の外部リンク

### 7.5 理解度チェック (応用問題)

**目的**: 記憶再認ではなく**状況適用**を問う。

- **悪いパターン**: 「Paint だけで済むプロパティはどれ?」(選択 = 再認)
- **良いパターン**: 「以下のコードがジャンクする理由を、観測すべきメトリクスと共に説明せよ」(状況適用)
- Phase 1 では自動採点は導入しない(非ゴール抵触)。模範解答を遅延表示で提示
- 設問数: 2〜3(多すぎると離脱)
- 難易度: Bloom の「応用」「分析」まで。「評価」「創造」は Zenn 記事の範疇

---

## 8. 各 Lab の個別構成

各 Lab について Hook 案、Tutorial ステップ、Playground 変数、誤メンタルモデル TOP 3 を提示。

### 8.1 Lab 2: メモリリークの稽古場 (二段)

**導入 Hook**:
「SPA で同一画面を 10 回マウント/アンマウントします。`performance.memory.usedJSHeapSize` はどう推移すると予想しますか? (A)初回ジャンプ後フラット (B)毎回少し増える (C)GC で時々下がるが増加トレンド (D)増減不定」
→ 実測: `setInterval` cleanup 忘れで明確な階段状増加を見せる。

**チュートリアルステップ (5 段)**:
1. `performance.memory` を読む + GC 強制(DevTools ガーベッジアイコン誘導)で減るか観察
2. Timer リーク: `setInterval` 無 cleanup vs あり cleanup の比較
3. Listener リーク: `addEventListener` without `removeEventListener`、AbortController 導入
4. Detached DOM: 削除ノードへの参照保持、`WeakRef` 適用
5. Closure リーク: 大きな配列をキャプチャする関数が外側から生存参照される例

**プレイグラウンド操作可能変数**:
- マウント/アンマウント サイクル数(1〜100)
- リーク種別(timer / listener / detached-dom / closure / 複合)
- 対策の有無(cleanup / AbortController / WeakRef / なし)
- リーク 1 回あたりのサイズ(保持配列の要素数)

**観測指標**:
- `performance.memory.usedJSHeapSize` ライブチャート(Chromium 限定、非対応は警告)
- `document.querySelectorAll('*').length` (DOM ノード数)
- 自前 Listener/Timer カウンタ

**誤メンタルモデル TOP 3**:
1. 「GC が賢いから勝手に消える」→ Step 2 で 10 秒後も増え続ける様子で破壊
2. 「React の unmount がすべて cleanup してくれる」→ Step 3 で `useEffect` return なしの実演で破壊
3. 「少しのリークは実用上問題ない」→ Step 4 の複合ケースで数分で 100MB 超える様子で破壊

### 8.2 Lab 3: 再レンダリングの地図 (二段)

**導入 Hook**:
「親の state 更新で子は再レンダリングされる。では `memo` で囲めば止まる? 以下 4 パターンで memo 化された `<Child>` が止まるのはどれ?
(A) `<Child value={42} />` (B) `<Child user={{ id: 1 }} />` (C) `<Child onClick={() => ...} />` (D) `<Child ref={ref} />`」
→ 実測: A と D のみ止まる。B, C は毎回新しい参照のため memo 失効。

**チュートリアルステップ (6 段)**:
1. 最小ツリー(Root→A→B) で state 更新 → A, B 両方 re-render、各ノードに色 flash
2. `memo` 導入: B を memo 化 → B は止まる
3. Object literal prop の罠: B に `{id:1}` を渡すと memo 失効
4. Context の伝播範囲: `Context.Provider` 配下の全 consumer が再 render、Zustand との対比
5. 派生 state の罠: state から計算した値をさらに state にしてループ、`useMemo` か計算値直接利用で解消
6. 「再 render = 悪」ではない: DOM 差分なければ commit phase は軽い、commit vs render の区別

**プレイグラウンド操作可能変数**:
- ツリー構造(深さ 1〜5、各ノード子 1〜5)
- 各ノードの memo on/off
- prop 種別(primitive / object literal / stable ref / function)
- state source(local / Context / Zustand)

**観測指標**:
- 各ノードの render 回数カウンタ
- render duration(自前 Profiler API ラッパー)
- 色 flash 可視化(render された瞬間に node が点滅)
- Commit phase 実時間と DOM mutation 件数(`MutationObserver`)

**誤メンタルモデル TOP 3**:
1. 「`memo` すれば止まる」→ Step 3 で object prop 失効を実演
2. 「Context は親子 prop 貫通だから軽い」→ Step 4 で全 consumer 再 render を可視化
3. 「派生 state は保持したほうが効率的」→ Step 5 で sync issue と無限ループリスクを実演

### 8.3 Lab 4: イベントループの内視鏡 (二段)

**導入 Hook**:
「以下の出力順を予想せよ:
```js
console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve().then(() => console.log('3'))
queueMicrotask(() => console.log('4'))
requestAnimationFrame(() => console.log('5'))
console.log('6')
```」
→ 実測順: 1, 6, 3, 4, 2, 5(rAF はフレーム境界で発火するため実装依存、多くの場合 2 より後)。

**チュートリアルステップ (5 段)**:
1. 同期 vs 非同期: `setTimeout(fn, 0)` の実測遅延が ≠ 0、nested clamp (4ms 以上) 観察
2. Microtask の位置: Promise.then / queueMicrotask / MutationObserver コールバックが現在タスク末尾にまとめて消化
3. Macrotask: setTimeout / MessageChannel / postMessage、別タスクとして切り分け
4. rAF の発火点: Style/Layout 直前 = レンダリング直前、microtask 後
5. Microtask 飢餓: `.then(() => Promise.resolve().then(...))` を繰り返すと macrotask が回らず UI 凍結

**プレイグラウンド操作可能変数**:
- 各種非同期タスクを時系列に「注入」(microtask / macrotask / rAF / rIC)
- 各タスクの仕事量(CPU spin 時間)
- ネスト深さ

**観測指標**:
- タイムライン可視化(横軸時間、色でタスク種別、自前 `performance.mark`)
- microtask queue 長さ(注入時点)
- Long task 検知(PerformanceObserver で longtask entry)
- rAF コールバックと実際の paint 時刻のズレ

**誤メンタルモデル TOP 3**:
1. 「`setTimeout(0)` は即時」→ Step 1 の clamp 実測で破壊
2. 「Promise と setTimeout の違いは遅延だけ」→ Step 2-3 で queue の別物ぶりを実演
3. 「rAF は 16.67ms ごとに正確」→ Step 4 で throttling / タブ非アクティブ時の drift 実演

### 8.4 Lab 5: スタッキングコンテキストの森 (初段)

**導入 Hook**:
「`z-index: 9999` の Modal が背後に隠れる。親に何を追加するとそうなる?
(A) `position: relative` (B) `opacity: 0.99` (C) `overflow: hidden` (D) `transform: translateZ(0)` (E) B と D」
→ 実測: B, D、さらに `filter`, `will-change`, `isolation: isolate`, `mix-blend-mode` 等でも発生。

**チュートリアルステップ (6 段)**:
1. 基本: `position: relative` + `z-index` の効果
2. 新スタッキング文脈の生成条件一覧(`opacity<1`, `transform≠none`, `filter`, `will-change`, `isolation:isolate`, `mix-blend-mode`)を個別トグルで検証
3. 親の文脈が子を閉じ込める: 子の `z-index:9999` が親文脈内でしか戦えない
4. 兄弟文脈同士の序列: 親の z-index で決まる
5. `isolation: isolate` の活用: 副作用なく文脈を作る唯一のプロパティ
6. 実務パターン: Portal (`createPortal`) で body 直下に逃がす設計

**プレイグラウンド操作可能変数**:
- 各要素の `position` / `z-index`
- 文脈生成トリガープロパティ(`opacity` / `transform` / `filter` / `will-change` / `isolation`)
- ネスト構造の編集(親子関係を変更)

**観測指標**:
- スタッキング文脈ツリーの自前描画(左: DOM ツリー、右: stacking context tree)
- 現在の重なり順(実描画と一致する z 順リスト)
- 各要素のラベル「どの文脈のどの位置」

**誤メンタルモデル TOP 3**:
1. 「z-index の数値が大きいほど前」→ Step 3 で閉じ込め現象で破壊
2. 「`position: relative` を付けないと z-index 無視」→ 正しいが Step 2 で他トリガーで文脈発生を補完
3. 「`isolation` は合成系 CSS で stacking と無関係」→ Step 5 で逆転して破壊

### 8.5 Lab 6: Next.js キャッシュ四重奏 (三段)

**導入 Hook**:
「Server Component 内で `fetch('/api/user')` を**同一リクエスト中に 2 回**呼んだら、実際にサーバへ届くのは何回?
(A)1 回 (B)2 回 (C)条件による (D)0 回(キャッシュから)」
→ 正解: (A) Request Memoization で 1 回。`cache:'no-store'` でも依然 1 回(Request Memo は cache option 無関係)。

**チュートリアルステップ (6 段)**:
1. **Request Memoization**: 同一リクエスト内の重複排除、`React.cache` 相当
2. **Data Cache**: `fetch` レベルキャッシュ、`revalidate` / `tags` / `cache:'no-store'`
3. **Full Route Cache**: 静的 vs 動的、`dynamic='force-dynamic'` の効果
4. **Router Cache**: client 側 prefetch、`<Link prefetch>` と back/forward 挙動
5. **無効化 3 方法**: `revalidate` (時間) / `revalidateTag` (タグ) / `revalidatePath` (パス)
6. **実務フロー診断**: 「フォーム送信後に一覧が更新されない」問題を 4 層のどこが悪いか切り分け

**プレイグラウンド操作可能変数**:
- fetch options (`cache`, `next.revalidate`, `next.tags`)
- Component タイプ(Server / Client)
- Route Segment config (`dynamic`, `revalidate`, `fetchCache`)
- Navigation 操作(link click / router.refresh / `revalidateTag` server action)

**観測指標**:
- 各層の hit/miss 状態(色分け、タイムライン付き)
- 実際のバックエンド到達回数(自前 mock Worker に counter)
- 各エントリの TTL 残り
- Router Cache 内容ダンプ(client 側 `localStorage` 模倣 UI)

**誤メンタルモデル TOP 3**:
1. 「Next のキャッシュは 1 種類(Data Cache)」→ Step 1 で Request Memo は別層として破壊
2. 「`cache:'no-store'` で全キャッシュ無効」→ Step 3-4 で Router Cache は client 側で生存と示す
3. 「`revalidatePath` で全キャッシュ消える」→ Step 5 で Router Cache は別制御と明示

**実装可能性の注記**: 実 Next.js cache 挙動の可視化には `instrumentation.ts` や自前 fetch ラッパーで計装が必要。バックエンドは Cloudflare Worker で mock を立てる。工数 **L**。Next バージョンアップで internal API が変わるリスクあり(プロトタイプ検証を先行させる)。

### 8.6 Lab 7: Hydration の探偵 (三段)

**導入 Hook**:
「以下のコンポーネントを本番で動かすと警告が出る。原因と、`suppressHydrationWarning` で『消した』場合の副作用を選べ。
```tsx
function Clock() {
  return <span>{new Date().toLocaleTimeString()}</span>
}
```」
→ 時刻ズレミスマッチ、suppressWarning で警告は消えるが最初の描画が SSR の古い時刻、直後に Hydration 後の時刻に瞬間差し替わり、視覚的ちらつきと CLS が発生。

**チュートリアルステップ (5 段)**:
1. Hydration の原理: SSR HTML + CSR React の「DOM 再利用」、`hydrateRoot` の役割
2. ミスマッチ 4 原因: 時刻・乱数・ブラウザ API (`window` 参照) ・locale/timezone
3. 回避策 1: `useEffect` で初期値補正 → 初回 SSR 値、マウント後に client 値
4. 回避策 2: `dynamic(Comp, { ssr: false })` or `'use client'` + state で条件描画
5. `suppressHydrationWarning` の誤用: 警告を消すだけで根本は残る、CLS 発生の実例

**プレイグラウンド操作可能変数**:
- Mismatch source (date / random / viewport / locale / none)
- 回避策 (none / useEffect / dynamic ssr:false / suppressWarning)
- SSR の on/off

**観測指標**:
- SSR HTML ダンプと CSR 初期 DOM の diff 表示(色分けハイライト)
- Hydration 警告の有無(`console.error` フック)
- CLS 実測値(web-vitals 連動)
- Hydration 完了までの時間

**誤メンタルモデル TOP 3**:
1. 「警告が消えれば正しい」→ Step 5 で suppressWarning 時の CLS で破壊
2. 「`'use client'` を付ければ Hydration しない」→ Step 4 で 'use client' でも SSR→Hydration は走る事を示す
3. 「`useState` の初期値をランダムにすれば OK」→ Step 2 で初期値関数も SSR/CSR 両方で走る事を実演

**実装可能性の注記**: SSR HTML と CSR DOM の diff 可視化は専用 API がなく自作が必要。Server Component で `renderToString`、Client Component で mount 後 DOM をキャプチャして比較。工数 **M**。

### 8.7 Lab 8: INP の解剖室 (三段)

**導入 Hook**:
「あなたのボタンの INP が 280ms。原因を切り分けるため最初に見るべきフェーズは?
(A)Input delay (B)Processing (C)Presentation (D)全部見る必要がある」
→ 正解: **全部見るのが前提**。web-vitals attribution で 3 フェーズ分解が第一手。「processing は 20ms、Input delay が 220ms」のようなケースを見せ、最適化対象の取り違えを防ぐ。

**チュートリアルステップ (5 段)**:
1. INP 定義: p75 of interaction-to-next-paint、200ms が閾値の根拠
2. 3 フェーズ: input delay / processing / presentation を `PerformanceEventTiming` で観測
3. Input delay の主因: main thread blocked、3rd party script、前の long task
4. Processing の主因: event handler の重さ、同期 setState の連鎖
5. Presentation の主因: style 再計算、layout、Lab 1 のレンダリングパイプライン

**プレイグラウンド操作可能変数**:
- クリック時の追加処理(なし / 重い JS spin / 同期 DOM 操作 / 3rd party シミュレート)
- 外部要因(main thread を他 task で塞ぐ、scheduler.yield 呼び出し点)
- 最適化(`startTransition` / `scheduler.yield` / `requestIdleCallback` / debounce)

**観測指標**:
- 各 interaction の 3 フェーズ内訳(stacked bar、過去 10 クリック並置)
- リアルタイム INP 値
- Long task との同時発生相関(Lab 1 の LoAF 連動)

**誤メンタルモデル TOP 3**:
1. 「INP = event handler の時間」→ Step 3 で input delay が支配的なケースで破壊
2. 「debounce すれば INP が下がる」→ Step 4 で debounce は計測対象外の処理を削るだけ、INP 計測対象は最初の 1 発と明示
3. 「presentation は常に軽い」→ Step 5 で重い style invalidate で 100ms 超える実例

---

## 9. Phase 割当と優先順位

### 9.1 評価軸

- **ビジネスインパクト**: SEO 流入見込み × Zenn 記事化しやすさ × 採用担当への訴求
- **実装コスト**: 観測 API の成熟度 × mock 実装の必要性 × Chromium 非対応範囲

### 9.2 Lab 別優先順位

| Lab | 難易度 | インパクト | コスト | 推奨 Phase | 理由 |
|-----|-------|----------|-------|----------|------|
| Lab 2 メモリリーク | 二段 | ◎ | M | **Phase 2** | 既存計画、Lab 1 隣接、DevTools 導線共通化 |
| Lab 5 スタッキングコンテキスト | 初段 | ○ | **S** | **Phase 2 同梱** | 独立 Lab、小コストで Phase 2 ボリューム増加 |
| Lab 3 再レンダリング | 二段 | ◎ | L | **Phase 3** | React 鬼門の王、フラッグシップ、Zenn 記事連続投稿の軸 |
| Lab 6 Next.js キャッシュ | 三段 | ◎ | L | **Phase 3** | Next 鬼門の王、採用担当訴求最大、mock 実装重い |
| Lab 4 イベントループ | 二段 | ○ | M | 正式版 | Lab 1 と Lab 8 を繋ぐ接続 Lab |
| Lab 7 Hydration 探偵 | 三段 | ○ | M | 正式版 | Lab 3 前提のため後ろ倒し |
| Lab 8 INP 解剖室 | 三段 | ○ | M | 正式版 | Lab 1 + Lab 4 前提が整ってから |

### 9.3 Phase 2 同梱の提案

Lab 2 + Lab 5 を同時リリース。Lab 5 は S 工数で Lab 2 のテスト待ち時間に完成できる。2 Lab 同時公開で Zenn 記事の弾が増える。難易度も「初段 + 二段」と幅が出て、難易度タグの効果を初公開時から示せる。

### 9.4 Phase 3 の構成変更提案

元計画の「スクロールジャンク」単独より、**Lab 3 再レンダリングを Phase 3 フラッグシップに昇格**することを推奨。スクロールジャンクは Lab 1 の性能観測系とやや重複し、再レンダリングは現代 React エンジニアの最大鬼門で訴求力が段違い。スクロールジャンクを差し替える場合、Phase 2 (メモリ)→ Phase 3 (再レンダリング)の順でパフォーマンス → React 固有 の順序が教育的にも自然。

### 9.5 難易度分布の健全性

推薦 7 Lab + Lab 1 の難易度分布:

| 難易度 | Lab |
|-------|-----|
| **初段** | Lab 1 (レンダリングパイプライン) / Lab 5 (スタッキングコンテキスト) |
| **二段** | Lab 2 (メモリリーク) / Lab 3 (再レンダリング) / Lab 4 (イベントループ) |
| **三段** | Lab 6 (Next.js キャッシュ) / Lab 7 (Hydration) / Lab 8 (INP) |

初段 2 / 二段 3 / 三段 3 とバランスが取れている。初段が入口として機能し、二段が主戦場、三段が腕試しになる。

---

## 10. 未決・要判断事項

- **Lab 6 の mock backend**: Cloudflare Worker で別オリジン mock API を立てる前提だが、Next.js Data Cache の内部挙動を外から完全に可視化できるかは未検証(バージョンアップで internal API が変わるリスク)。プロトタイプ先行検証が必要
- **Lab 7 の SSR/CSR diff**: `renderToString` と hydration 後 DOM の比較を教育目的でどこまで詳細にできるか不明。簡易版(警告一覧 + 代表的 diff)に留めるか、フル diff まで踏み込むかは実装時判断
- **INP attribution の安定性**: `web-vitals` attribution API は比較的新しく、Chromium 以外での挙動が不安定の可能性。非対応環境では「PC+Chromium 推奨」表示で逃げる判断が必要
- **難易度タグの JSON-LD mapping**: `educationalLevel` は "beginner/intermediate/advanced" しか標準語彙がない。初段/二段/三段 → intermediate 固定 + カスタム属性併記か、初段=intermediate / 二段=intermediate / 三段=advanced の mapping にするか要判断
- **Lab 横断ナビゲーション**: 前提 Lab を踏んだかの検知。ログイン不可の制約下で localStorage ベースの自己申告フラグ程度が現実解

---

## 11. R 調整要望欄

-
-
-
