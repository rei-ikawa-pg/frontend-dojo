import { describe, expect, it } from 'vitest'
import { issueAdminCookieValue, verifyAdminCookieValue } from './cookie'

const TOKEN = 'test-admin-token-1234567890'

describe('issueAdminCookieValue / verifyAdminCookieValue', () => {
  it('発行した Cookie 値は同じトークンで検証に成功する', async () => {
    const now = 1_700_000_000_000
    const issued = await issueAdminCookieValue(TOKEN, 3600, now)
    expect(issued.value).toMatch(/^\d+\.[0-9a-f]+$/)
    await expect(verifyAdminCookieValue(issued.value, TOKEN, now + 1)).resolves.toBe(true)
  })

  it('異なるトークンでは検証に失敗する', async () => {
    const issued = await issueAdminCookieValue(TOKEN, 3600, 1_700_000_000_000)
    await expect(verifyAdminCookieValue(issued.value, 'different-token')).resolves.toBe(false)
  })

  it('期限切れ Cookie は検証に失敗する', async () => {
    const now = 1_700_000_000_000
    const issued = await issueAdminCookieValue(TOKEN, 3600, now)
    // 期限後のタイムスタンプで検証
    await expect(verifyAdminCookieValue(issued.value, TOKEN, now + 3600 * 1000 + 1)).resolves.toBe(
      false,
    )
  })

  it('改ざんされた署名は検証に失敗する', async () => {
    const issued = await issueAdminCookieValue(TOKEN, 3600, 1_700_000_000_000)
    const tampered = `${issued.value.slice(0, -1)}0`
    await expect(verifyAdminCookieValue(tampered, TOKEN)).resolves.toBe(false)
  })

  it('dot を含まない値は無効', async () => {
    await expect(verifyAdminCookieValue('no-dot-here', TOKEN)).resolves.toBe(false)
  })

  it('expiry 部分が数値でなければ無効', async () => {
    await expect(verifyAdminCookieValue('abc.def', TOKEN)).resolves.toBe(false)
  })
})
