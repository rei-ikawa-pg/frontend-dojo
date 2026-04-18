/**
 * 匿名セッション ID を sessionStorage で管理する。
 *
 * プライバシー方針:
 * - Cookie 不使用（タブを閉じたら消える = タブ単位の短いセッション）
 * - UUID v4 のみ。IP やユーザーエージェントは保存しない
 * - sessionStorage が使えない環境（プライベートブラウジング等）では都度 UUID を生成し、
 *   集計単位は「そのページロード」になる（プライバシー側に倒した挙動）
 */

const STORAGE_KEY = 'fd.rum.session'

function randomUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // crypto.randomUUID 非対応の極レア環境向けフォールバック（UUID v4 を手書き生成）
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  // v4 識別 (バージョン4 / バリアント RFC 4122) のビット整形
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80
  const hex = Array.from(bytes, (n) => n.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function getOrCreateSessionId(): string {
  if (typeof sessionStorage === 'undefined') return randomUuid()
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY)
    if (existing) return existing
    const next = randomUuid()
    sessionStorage.setItem(STORAGE_KEY, next)
    return next
  } catch {
    // プライベートモード等で sessionStorage に触れない場合、UUID は揮発でよい
    return randomUuid()
  }
}
