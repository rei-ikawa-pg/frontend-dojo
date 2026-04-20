/**
 * OGP / Twitter カード画像の共通テンプレート。
 *
 * - Header コンポーネントと同じデザイン (朱色アクセント帯 + 道マーク + サイト名 + 罫線) を
 *   Satori の制約下で再現するため、Tailwind ではなく inline style で記述している。
 * - フォントは Google Fonts から text サブセットで取得する。
 *   ビルド時に実行されるため、実行時ネットワークは不要。
 * - globals.css の OKLCH 値は hex に近似している
 *   (Satori は CSS 変数を解釈しないため。小数点以下は目視確認で微調整)。
 */

import { ImageResponse } from 'next/og'
import { SITE } from '@/lib/site'

export const ogSize = { width: 1200, height: 630 } as const
export const ogContentType = 'image/png'

const COLORS = {
  bg: '#121418', // --ink-000
  panel: '#171a1f', // --ink-050
  rule: '#32363d', // --rule-dim
  ink400: '#b3b5bb', // --ink-400
  ink500: '#d1d4d9', // --ink-500
  ink900: '#f7f3ea', // --ink-900 (warm white)
  vermilion: '#dd4a2b', // --vermilion
} as const

/**
 * Google Fonts の CSS2 エンドポイントから subset されたフォントをダウンロードする。
 * text パラメータで必要なグリフのみを取得するため、日本語フォントでもペイロードが軽い。
 *
 * Satori は woff2 / woff / eot を扱えず TTF だけ受け付ける。
 * Google Fonts は User-Agent によって返す形式を切り替えるので、
 * curl UA を指定して truetype で返してもらう (2026-04 時点で確認)。
 */
const TTF_FORCING_UA = 'curl/7.68.0'

async function loadGoogleFont(fontSpec: string, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${fontSpec.replace(/ /g, '+')}&text=${encodeURIComponent(text)}&display=swap`
  const css = await fetch(url, {
    headers: { 'User-Agent': TTF_FORCING_UA },
  }).then((r) => r.text())
  const match = css.match(/src:\s*url\((.+?)\)\s*format\('truetype'\)/)
  if (!match) {
    throw new Error(
      `OGP: could not parse truetype URL from Google Fonts for ${fontSpec}. CSS: ${css.slice(0, 200)}`,
    )
  }
  const fontRes = await fetch(match[1])
  if (!fontRes.ok) {
    throw new Error(`OGP: failed to download font ${fontSpec}: ${fontRes.status}`)
  }
  return fontRes.arrayBuffer()
}

export type OgConfig = {
  /** 例: "§ 01 — Lab" */
  section?: string
  /** 大見出し */
  title: string
  /** 見出し下の説明文 */
  description?: string
}

/**
 * すべての OGP 画像はこの関数経由で生成する。
 * opengraph-image.tsx はこの関数を呼ぶだけの薄いラッパーにする。
 */
export async function generateOgImage({ section, title, description }: OgConfig) {
  // Shippori Mincho の subset 用テキスト。画面に出る可能性のある文字をまとめる。
  const minchoText =
    `${SITE.name}${title}${description ?? ''}${section ?? ''}` +
    '道§—-/|.,: abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  // Instrument Serif (italic) は英字のみで十分
  const serifText = `${SITE.nameEn} abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`

  const [minchoRegular, minchoBold, serifItalic] = await Promise.all([
    loadGoogleFont('Shippori Mincho:wght@500', minchoText),
    loadGoogleFont('Shippori Mincho:wght@700', minchoText),
    loadGoogleFont('Instrument Serif:ital@1', serifText),
  ])

  const host = new URL(SITE.url).host
  // タイトル文字数で段階的にフォントサイズを調整 (1056px 幅に収めるため):
  // - 10 文字以下: 72px (短い Lab 名)
  // - 11〜20 文字: 60px (ほとんどの Lab 名)
  // - 21 文字以上: 48px (タグライン等)
  const titleSize = title.length <= 10 ? 72 : title.length <= 20 ? 60 : 48

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: COLORS.bg,
        fontFamily: 'Mincho',
        color: COLORS.ink900,
        position: 'relative',
      }}
    >
      {/* 背景の dotted grid (globals.css の body 後ろのと同じパターン) */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.04,
          backgroundImage: `radial-gradient(circle at 1px 1px, ${COLORS.ink900} 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* 朱色アクセント帯 (Header の h-[2px] bg-ink-050 + w-1/12 vermilion を再現) */}
      <div
        style={{
          display: 'flex',
          height: '6px',
          backgroundColor: COLORS.panel,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100px',
            height: '6px',
            backgroundColor: COLORS.vermilion,
          }}
        />
      </div>

      {/* ヘッダー行 (道マーク + サイト名) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
          padding: '40px 72px',
          borderBottom: `1px solid ${COLORS.rule}`,
          flexShrink: 0,
        }}
      >
        {/* 道マーク (BrandMark の 44px 四角を 96px に拡大) */}
        <div
          style={{
            display: 'flex',
            width: '96px',
            height: '96px',
            border: `1px solid ${COLORS.vermilion}`,
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.vermilion,
            fontSize: '60px',
            fontFamily: 'Mincho',
            fontWeight: 700,
            position: 'relative',
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          道{/* コーナーマーカー (右上 + 左下) */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: '-1px',
              right: '-1px',
              width: '14px',
              height: '14px',
              borderTop: `1px solid ${COLORS.vermilion}`,
              borderRight: `1px solid ${COLORS.vermilion}`,
            }}
          />
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: '-1px',
              left: '-1px',
              width: '14px',
              height: '14px',
              borderBottom: `1px solid ${COLORS.vermilion}`,
              borderLeft: `1px solid ${COLORS.vermilion}`,
            }}
          />
        </div>

        {/* サイト名ブロック (英字セリフ体 + 和文明朝体) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Serif',
              fontStyle: 'italic',
              fontSize: '52px',
              color: COLORS.ink900,
              lineHeight: 1,
            }}
          >
            {SITE.nameEn}
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Mincho',
              fontSize: '24px',
              color: COLORS.ink400,
              lineHeight: 1,
            }}
          >
            {SITE.name}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '64px 72px 56px',
          gap: '28px',
          justifyContent: 'center',
        }}
      >
        {section && (
          <div
            style={{
              display: 'flex',
              fontSize: '20px',
              color: COLORS.ink400,
              textTransform: 'uppercase',
              letterSpacing: '8px',
              fontFamily: 'Mincho',
            }}
          >
            {section}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            fontFamily: 'Mincho',
            fontWeight: 700,
            fontSize: `${titleSize}px`,
            lineHeight: 1.25,
            color: COLORS.ink900,
            letterSpacing: '-0.01em',
            maxWidth: '1056px',
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              display: 'flex',
              fontSize: '26px',
              lineHeight: 1.55,
              color: COLORS.ink500,
              fontFamily: 'Mincho',
              maxWidth: '1056px',
            }}
          >
            {description}
          </div>
        )}
      </div>

      {/* フッター (ブランド + URL) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 72px',
          borderTop: `1px solid ${COLORS.rule}`,
          fontSize: '18px',
          color: COLORS.ink400,
          flexShrink: 0,
          letterSpacing: '4px',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ display: 'flex' }}>Frontend / Dojo</div>
        <div style={{ display: 'flex', color: COLORS.vermilion, letterSpacing: '2px' }}>{host}</div>
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: 'Mincho', data: minchoRegular, weight: 500, style: 'normal' },
        { name: 'Mincho', data: minchoBold, weight: 700, style: 'normal' },
        { name: 'Serif', data: serifItalic, weight: 400, style: 'italic' },
      ],
    },
  )
}
