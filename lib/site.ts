export const SITE = {
  name: 'フロントエンド道場',
  nameEn: 'Frontend Dojo',
  tagline: 'フロントエンドの鬼門を、読むのではなく触って理解する。',
  description:
    'フロントエンドの鬼門を、読むのではなく触って理解する。日本語のインタラクティブラボ。レンダリングパイプライン、メモリリーク、スクロールジャンクなどを実際に動かして学べます。',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://frontend-dojo.rakurai.workers.dev',
  zenn: process.env.NEXT_PUBLIC_ZENN_URL ?? 'https://zenn.dev',
  feedbackForm: process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL ?? 'https://forms.gle/placeholder',
} as const

export const NAV_ITEMS: readonly { label: string; href: string }[] = [
  { label: '稽古場', href: '/labs' },
  { label: 'ロードマップ', href: '/roadmap' },
  { label: '道場について', href: '/about' },
] as const
