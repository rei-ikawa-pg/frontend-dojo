/**
 * RUM データの定期削除 Worker（Cron Trigger）。
 * - 毎日 3AM UTC（= 12:00 JST）に 90 日超のイベントを削除
 * - D1 のストレージ枠圧迫を防ぐ
 * - 削除件数はログに残す（Workers の Logs タブで確認）
 *
 * 設定例 (wrangler.jsonc):
 *   triggers: { crons: ["0 3 * * *"] }
 */

export interface Env {
  DB: D1Database
  /** 保持日数（上書き可能、未設定時 90 日） */
  RETENTION_DAYS?: string
}

export default {
  async scheduled(_event: ScheduledController, env: Env, _ctx: ExecutionContext): Promise<void> {
    const retentionDays = Number(env.RETENTION_DAYS ?? '90') || 90
    const threshold = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString()

    try {
      const result = await env.DB.prepare('DELETE FROM rum_events WHERE created_at < ?')
        .bind(threshold)
        .run()

      console.log(
        JSON.stringify({
          event: 'rum_cleanup.ok',
          threshold,
          retention_days: retentionDays,
          deleted: result.meta?.changes ?? null,
        }),
      )
    } catch (err) {
      console.error(JSON.stringify({ event: 'rum_cleanup.failed', error: String(err) }))
      throw err
    }
  },
} satisfies ExportedHandler<Env>
