# フロントエンド道場 RUM基盤アーキテクチャドラフト

最終更新: 2026-04-17 / ステータス: ドラフト

## 0. 設計原則

- **学習素材としても完成度を保つ**: サイト自体が「こう作れば良いRUMになる」という見本
- **プライバシー最優先**: 個人特定情報は一切収集しない、IPもクッキーも不要
- **無料枠内で運用**: Cloudflare Free Tier を超えない範囲で設計
- **拡張性**: Lab が増えても同じ基盤で対応できる
- **送信失敗に強い**: ネットワーク障害、ページ離脱時でも最善努力で送る

---

## 1. 全体アーキテクチャ

```
┌─────────────────────────────────────────┐
│ ブラウザ（クライアント）                 │
│                                         │
│ ┌──────────────────────────────────┐   │
│ │ RumCollector（シングルトン）      │   │
│ │  - PerformanceObserver 登録       │   │
│ │  - web-vitals 統合                │   │
│ │  - LoAF 取得                      │   │
│ │  - カスタムメトリクス受付          │   │
│ └──────────────┬───────────────────┘   │
│                │                         │
│ ┌──────────────▼───────────────────┐   │
│ │ RumBuffer（バッファ）             │   │
│ │  - イベントを一時保持              │   │
│ │  - 5秒 or 20件 で flush           │   │
│ └──────────────┬───────────────────┘   │
│                │                         │
│ ┌──────────────▼───────────────────┐   │
│ │ RumSender（送信）                  │   │
│ │  - navigator.sendBeacon 優先       │   │
│ │  - fallback: fetch with keepalive │   │
│ │  - visibilitychange で強制flush   │   │
│ └──────────────┬───────────────────┘   │
└────────────────┼────────────────────────┘
                 │ POST /api/rum/collect
                 ▼
┌─────────────────────────────────────────┐
│ Cloudflare Edge                          │
│                                         │
│ ┌──────────────────────────────────┐   │
│ │ Next.js API Route                 │   │
│ │  - CORS チェック                  │   │
│ │  - Rate Limit (Cloudflare WAF)    │   │
│ │  - バリデーション (Zod)            │   │
│ │  - D1 への Insert                 │   │
│ └──────────────┬───────────────────┘   │
└────────────────┼────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Cloudflare D1（SQLite）                 │
│  - rum_events テーブル                  │
│  - 90日経過データは Cron で削除         │
└─────────────────────────────────────────┘
                 ▲
                 │ SELECT
                 │
┌────────────────┴────────────────────────┐
│ /admin/rum（Server Components）         │
│  - 基本認証 or トークン保護             │
│  - 集計クエリ                            │
│  - グラフ表示（Recharts等）             │
└─────────────────────────────────────────┘
```

---

## 2. クライアント側の実装

### 2.1 ディレクトリ構造

```
features/rum/
├── client/
│   ├── collector.ts        # PerformanceObserver + web-vitals 統合
│   ├── buffer.ts           # イベントバッファ
│   ├── sender.ts           # 送信ロジック
│   ├── provider.tsx        # Reactプロバイダ
│   ├── useRumCustomMetric.ts  # カスタムメトリクス送信用フック
│   └── webVitals.ts        # web-vitals ラッパー
├── shared/
│   ├── schema.ts           # Zod スキーマ（クライアント・サーバ共有）
│   └── types.ts
└── index.ts
```

### 2.2 収集するメトリクス

**自動収集（web-vitals ライブラリ）**
- LCP（Largest Contentful Paint）
- INP（Interaction to Next Paint）
- CLS（Cumulative Layout Shift）
- FCP（First Contentful Paint）
- TTFB（Time to First Byte）

**自動収集（PerformanceObserver 直接）**
- Long Animation Frames（LoAF、対応ブラウザのみ）
- long task（LoAF 非対応時のフォールバック）
- resource（重要リソースの読み込み時間、絞り込み）

**カスタムメトリクス（Lab から送信）**
- `lab.render.fps`: Lab 1 のフレームレート
- `lab.render.frame_budget`: フレーム予算消費ms
- `lab.render.paint_phase`: Paint/Layout/Composite のどこまで走ったか
- `lab.memory.heap_size`: メモリ使用量（Lab 2 で使用）
- `lab.tutorial.step_duration`: 各ステップの滞在時間

**コンテキスト情報（全イベント共通）**
- `session_id`: 匿名UUID（sessionStorage、1セッションのみ）
- `page_path`: 現在のURL（クエリは除外）
- `lab_id`: 'render' 等
- `mode`: 'tutorial' / 'playground' / 'overview'
- `device_type`: 'desktop' / 'tablet' / 'mobile'
- `browser`: 'chromium' / 'safari' / 'firefox' / 'other'
- `viewport`: { width, height }
- `timestamp`: ISO8601
- `sdk_version`: RumCollector のバージョン

### 2.3 バッファリング戦略

個別イベントを毎回送信すると、ネットワーク負荷と D1 書き込み負荷が跳ね上がるので、**バッチ送信**します。

**Flush トリガー**
- 20件 溜まったら即時flush
- 5秒 経過したらflush
- `visibilitychange` イベントで `hidden` になったら強制flush
- `beforeunload` で最後のflush

**使用API優先順位**
1. `navigator.sendBeacon`（ページ離脱時でも送信される）
2. `fetch` with `keepalive: true`（sendBeacon 未対応時）
3. 通常の `fetch`（最後の手段）

### 2.4 送信タイミングの工夫

**初期ロード時**
- ページロード直後の LCP / FCP / TTFB は page load イベント後に一括送信
- 重い初期処理を邪魔しないよう、`requestIdleCallback` で遅延

**ユーザー操作時**
- INP イベントは発生後に即座にバッファ追加（flush は上記トリガーに従う）

**Lab 起動時**
- FPS 等のカスタムメトリクスは 1秒おきに集計してバッファ追加

### 2.5 サンプリング

**MVP段階**: 100%（全イベント収集）

理由: ユーザー数が少ない初期は全データが貴重。サンプリングは DB 容量か Worker 実行回数が制約になってから導入。

**将来のサンプリング戦略（参考）**
- デイリーアクティブユーザーが 1000 を超えたら 50% サンプリング
- 5000 超えたら 10%

### 2.6 プライバシー保護

- IP アドレスは Worker で受信時に即破棄（ログにも残さない）
- User-Agent は保存するが生データは保持せず、ブラウザ種別のみ抽出
- session_id は sessionStorage に保存、タブを閉じたら消える
- Cookie は一切使わない
- プライバシーポリシーで明記する項目を `/privacy` に記載

---

## 3. サーバ側の実装

### 3.1 API Route の構造

```typescript
// app/api/rum/collect/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rumEventArraySchema } from '@/features/rum/shared/schema'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  // 1. CORS チェック（Origin ヘッダ検証）
  const origin = request.headers.get('origin')
  if (!isAllowedOrigin(origin)) {
    return new Response('Forbidden', { status: 403 })
  }

  // 2. Content-Type チェック
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return new Response('Bad Request', { status: 400 })
  }

  // 3. ペイロード解析
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  // 4. バリデーション（Zod）
  const parsed = rumEventArraySchema.safeParse(body)
  if (!parsed.success) {
    return new Response('Validation Error', { status: 400 })
  }

  // 5. D1 へ一括 Insert
  const env = getCloudflareContext().env
  const stmt = env.DB.prepare(
    'INSERT INTO rum_events (session_id, lab_id, mode, metric_name, metric_value, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  const batch = parsed.data.map(event =>
    stmt.bind(event.session_id, event.lab_id, event.mode, event.metric_name, event.metric_value, JSON.stringify(event.metadata), event.timestamp)
  )
  await env.DB.batch(batch)

  return new Response(null, { status: 204 })
}
```

### 3.2 バリデーション（Zod スキーマ）

クライアント・サーバ共有。

```typescript
// features/rum/shared/schema.ts
import { z } from 'zod'

export const rumEventSchema = z.object({
  session_id: z.string().uuid(),
  page_path: z.string().max(200),
  lab_id: z.string().max(50).nullable(),
  mode: z.enum(['tutorial', 'playground', 'overview', 'other']),
  device_type: z.enum(['desktop', 'tablet', 'mobile']),
  browser: z.enum(['chromium', 'safari', 'firefox', 'other']),
  metric_name: z.string().max(100),
  metric_value: z.number().finite(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  timestamp: z.string().datetime(),
  sdk_version: z.string().max(20),
})

export const rumEventArraySchema = z.array(rumEventSchema).max(50)
```

### 3.3 レート制限

**MVP段階**: Cloudflare の無料 WAF ルールで IP ベースの制限

- 1 IP あたり 600 req/分 まで
- 超過したら 429 返却
- Cloudflare ダッシュボードから設定

**将来**: Durable Objects でセッション単位のレート制限（必要になったら）

### 3.4 CORS 設定

- 本番: `Access-Control-Allow-Origin: https://frontend-dojo.pages.dev`
- 開発: `Access-Control-Allow-Origin: http://localhost:3000`
- 環境変数で切り替え

---

## 4. D1 データベース設計

### 4.1 スキーマ

```sql
CREATE TABLE rum_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  lab_id TEXT,
  mode TEXT NOT NULL,
  device_type TEXT NOT NULL,
  browser TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  metadata TEXT,  -- JSON
  created_at TEXT NOT NULL,  -- ISO8601
  inserted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rum_created_at ON rum_events(created_at);
CREATE INDEX idx_rum_lab_metric ON rum_events(lab_id, metric_name);
CREATE INDEX idx_rum_session ON rum_events(session_id);
```

### 4.2 容量見積もり

- 1イベントあたり約 300 バイト
- 仮に 1日 10,000 イベント（初期想定） → 3MB/日 = 約 270MB/90日
- D1 無料枠: 5GB（十分）

### 4.3 データ削除（Cron Trigger）

```typescript
// workers/rum-cleanup/src/index.ts
export default {
  async scheduled(event, env) {
    const threshold = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    await env.DB.prepare('DELETE FROM rum_events WHERE created_at < ?').bind(threshold).run()
  }
}
```

- 毎日1回 Cron 実行（`0 3 * * *` = 毎日 3 AM UTC）
- 90日以前のデータを削除

---

## 5. 管理ダッシュボード `/admin/rum`

### 5.1 アクセス保護

**MVP**: 環境変数ベースの簡易トークン認証

- `?token=XXX` でアクセス
- 環境変数 `ADMIN_TOKEN` と比較
- 一致しなければ 404 相当を返す

**将来**: Cloudflare Access（無料枠あり）でメール認証、Google SSO 等

### 5.2 表示する指標

- デイリー PV / UU（直近30日の折れ線）
- LCP / INP / CLS の分布（ヒストグラム）
- Lab 別アクセス数（棒グラフ）
- Lab 1 の FPS 分布（Lab公開後）
- ブラウザ別シェア（円グラフ）
- 直近のRUMイベント（最新20件をテーブル表示、デバッグ用）

### 5.3 データ取得

- Server Component でクエリ実行
- TanStack Query でリフレッシュ対応（auto-refresh 5分）
- グラフは Recharts（shadcn/ui と相性が良い）

---

## 6. カスタムメトリクス送信API（Lab から呼ぶ）

Lab のコードから計測値を送る標準インターフェース。

```typescript
// features/rum/client/useRumCustomMetric.ts
export function useRumCustomMetric() {
  return useCallback((name: string, value: number, metadata?: Record<string, unknown>) => {
    window.__RUM__?.emit({
      metric_name: name,
      metric_value: value,
      metadata,
      timestamp: new Date().toISOString(),
    })
  }, [])
}

// features/lab-render/hooks/useFrameMetrics.ts での使用例
const sendMetric = useRumCustomMetric()

useEffect(() => {
  const interval = setInterval(() => {
    sendMetric('lab.render.fps', currentFps, { lab_id: 'render', mode: 'playground' })
  }, 1000)
  return () => clearInterval(interval)
}, [currentFps])
```

---

## 7. エラー処理と復旧

- 送信失敗時はバッファに戻す（最大3回リトライ）
- 3回失敗したら破棄（ユーザーのブラウザに無限蓄積させない）
- オフライン検知: `navigator.onLine === false` の時は送信を保留
- オンライン復帰時（`online` イベント）に溜まったイベントを flush

---

## 8. 受け入れ条件

- [ ] クライアントから RumCollector 経由でイベントが送信できる
- [ ] web-vitals の LCP / INP / CLS が自動送信される
- [ ] LoAF 対応ブラウザで long animation frames が送信される
- [ ] カスタムメトリクスを Lab から送信できる
- [ ] D1 にイベントが正しく保存される
- [ ] `/admin/rum` で基本指標が見られる
- [ ] 90日経過データが Cron で自動削除される
- [ ] CORS / レート制限が機能している
- [ ] プライバシーポリシーに収集項目が記載されている

---

## 9. 主要な判断ポイント（R調整要望）

### 9.1 sessionId を URL でシェアされた時のトラッキング

例: Zenn記事から直接 `/lab/render/tutorial?step=3` に来た人の session を、別ページから来た人と区別するか。

**推奨**: 純粋にブラウザセッション単位で付与。流入元は `document.referrer` で別途記録（プライバシー配慮で trim）。

### 9.2 自前RUMとCloudflare Web Analyticsの重複

Cloudflare Web Analytics も PV や Web Vitals を取得する。重複する部分があるが、**役割を明確に分ける**ことで共存可能。

- Cloudflare: ざっくりしたビジネス指標、管理画面で見る
- 自前RUM: 技術指標、カスタムメトリクス、公開ダッシュボードの可能性

**推奨**: 重複を許容、役割で使い分ける

### 9.3 RUMデータの公開可否

管理者だけが見られる状態から始めるか、将来的に **公開ダッシュボード（`/dashboard`）** を作ってユーザーにも見せるか。

- 公開するメリット: サイト自体の透明性、コンテンツとしての魅力（「このサイトのLCPは◯ms」と見せる）
- 公開するデメリット: プライバシー配慮、スケールした時の計算負荷

**推奨**: Phase 1 は管理者のみ。将来検討。

### 9.4 sdk_version を厳密に管理するか

`sdk_version` をデータに含めると、RUMロジックを変更した時に新旧データを区別できる。

**推奨**: 最初から含める。SemVer で管理。

---

## 10. R調整要望欄

- 
- 
- 
