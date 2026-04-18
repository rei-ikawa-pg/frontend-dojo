// Cloudflare Workers のシークレット（wrangler secret put で登録）を型に追加する。
// `cloudflare-env.d.ts` は wrangler.jsonc と .dev.vars からのみ生成されるため、
// CI のようにローカル .dev.vars が無い環境では欠落する。declaration merging で補う。

declare namespace Cloudflare {
  interface Env {
    /** 管理者ダッシュボード保護用トークン（`wrangler secret put ADMIN_TOKEN`） */
    ADMIN_TOKEN: string
  }
}
