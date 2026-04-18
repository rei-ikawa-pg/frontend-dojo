#!/usr/bin/env node
/**
 * app/icon.svg を 180×180 PNG にラスタライズして app/apple-icon.png を生成する。
 * iOS Safari は Apple Touch Icon を PNG でしか受け付けないため、PNG に変換する。
 *
 * 実行: pnpm icon:export
 */
import { readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const INPUT = resolve(ROOT, 'app/icon.svg')
const OUTPUT = resolve(ROOT, 'app/apple-icon.png')
const SIZE = 180

// SVG 内の prefers-color-scheme による条件分岐はラスタライズ時に評価されないため、
// 背景を常にダーク (#0B0C0E) で固定した一時 SVG を作ってから描画する。
const rawSvg = readFileSync(INPUT, 'utf-8')
const flattenedSvg = rawSvg
  .replace(/@media[^}]*\{[^}]*\}\s*/g, '')
  .replace(/\.bg\s*\{[^}]*\}/, '.bg { fill: #0B0C0E; }')

await sharp(Buffer.from(flattenedSvg), { density: 512 })
  .resize(SIZE, SIZE, { fit: 'contain', background: { r: 11, g: 12, b: 14, alpha: 1 } })
  .png({ compressionLevel: 9 })
  .toFile(OUTPUT)

console.log(`✓ wrote ${OUTPUT} (${SIZE}×${SIZE}, ${statSync(OUTPUT).size} bytes)`)
