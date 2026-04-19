# レート制限 / ボット対策（Cloudflare 側設定）

最終更新: 2026-04-19

Workers コード側には意図的にレート制限を実装せず、Cloudflare WAF の **Rate Limiting Rules** と **Super Bot Fight Mode** で境界層に寄せる。理由は以下。

- D1 書き込みが発生する前にリクエストを落とせる → Workers 実行枠・D1 書き込み枠の両方を節約
- WAF の設定値はダッシュボードから即時変更できる → インシデント対応が速い
- コードに埋め込むと「緩めたい」時にデプロイが必要になり遅い

## 対象エンドポイント

| パス | 想定 | 想定される乱用 |
|---|---|---|
| `/api/rum/collect` | RUM 書き込み（認証なし） | 偽の RUM メトリクスで集計汚染、D1 容量圧迫 |
| `/api/feedback` | Good / Bad 投稿 | スパム投稿（画面内での埋没攻撃） |
| `/api/contact` | お問い合わせ | スパム送信、D1 容量圧迫 |
| `/admin/login` | 管理画面ログイン | ブルートフォース |

## 推奨レート制限値（初期値）

Cloudflare Dashboard → `frontend-dojo` → Security → WAF → Rate limiting rules。

| Rule 名 | 対象 | 条件 | 閾値 | 継続時間 | アクション |
|---|---|---|---|---|---|
| `rum-ingest` | `(http.request.uri.path eq "/api/rum/collect")` | IP | 60 req / 1 min | 1 min | Block |
| `feedback-ingest` | `(http.request.uri.path eq "/api/feedback")` | IP | 10 req / 1 min | 5 min | Block |
| `contact-ingest` | `(http.request.uri.path eq "/api/contact")` | IP | 5 req / 1 min | 10 min | Managed Challenge |
| `admin-login-bruteforce` | `(http.request.uri.path eq "/admin/login" and http.request.method eq "POST")` | IP | 5 req / 5 min | 30 min | Managed Challenge |

※ RUM は 1 リクエストで最大 50 イベント送れる（Zod スキーマ側の制限）。60 req/min でも 3000 events/min まで届くので通常利用に支障はない。

## Super Bot Fight Mode

Cloudflare Dashboard → `frontend-dojo` → Security → Bots → Super Bot Fight Mode。

| 項目 | 設定 |
|---|---|
| Definitely automated | Block |
| Likely automated | Managed Challenge |
| Verified bots | Allow（Googlebot / Bingbot 等のクロールは通す） |
| Static resources | Allow（CSS/JS/画像は除外） |

## 変更フロー

1. Dashboard から Rule を編集
2. 「ログ」タブで数分観測し、正規ユーザが弾かれていないか確認
3. 閾値を調整

## 監視

- Dashboard → Security → Events で「Rate Limit」「Bot Fight」のブロックログを確認
- D1 の `rum_events` 件数・`feedback` / `contact_messages` 件数の急増もアプリ側シグナル

## 将来の検討

- `/admin/login` は将来 Cloudflare Access（ゼロトラスト）に移行予定（docs/05 §5.1）。移行後は Access 側で IP allowlist / IdP 認証を使うため、この rule は縮退可能。
- Cloudflare Turnstile を `/contact` に組み込むと honeypot 併用でスパム耐性がさらに上がる（現状は honeypot + Zod のみ）。
