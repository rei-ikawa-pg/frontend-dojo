/**
 * サイト内 path / URL のバリデーションスキーマ。
 * RUM / feedback / contact など複数のエンドポイントで共通利用する。
 */

import { z } from 'zod'

/**
 * サイト内 path。`/` で始まり、空白・クエリ・フラグメントを含まないこと。
 * 例: `/labs`, `/lab/render/tutorial`
 *
 * 前後のクエリ / フラグメントを持ち込ませない理由:
 *   - 管理画面のテーブル表示でノイズになる
 *   - 集計時に path 単位のグルーピングを安定させる
 */
export const sitePathSchema = z
  .string()
  .max(200)
  .regex(/^\/[^\s?#]*$/, { message: 'must be an absolute path starting with /' })
