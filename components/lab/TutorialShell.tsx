/**
 * Lab チュートリアルの共通レイアウトシェル。
 *
 * 3 Lab で重複していた以下を集約する:
 *   - § XX/XX タイトル + Progress バー + ステップ題名のヘッダ
 *   - 左 aside（目的 / 観察ポイント / 解説 children / Quiz children）
 *   - 右カラム（VisualizationView / MetricsDisplay 等）
 *   - フッタの「前 / ステップドット / 次・道場へ」ナビ
 *   - ステップ切替時の `window.scrollTo({ top: 0 })`
 *
 * 各 Lab 固有の preset 適用ロジックや RUM context / step duration 計測は
 * 呼び出し側に残す（`useLabRumContext` と `useStepDuration` を別途呼ぶこと）。
 *
 * `step` は型が Lab ごとに異なるため、共通部分だけ参照する `StepInfo` 型で受ける。
 */

'use client'

import { ArrowLeft, ArrowRight, CheckCircle } from '@phosphor-icons/react'
import Link from 'next/link'
import { type ReactNode, useEffect, useRef } from 'react'
import { Prose } from '@/components/typography/Prose'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export type StepInfo = {
  id: number
  slug: string
  title: string
  objective: string
  observation: string
}

export type TutorialShellProps = {
  /** RUM の lab_id と同じ文字列（'render' / 'memory-leak' / 'rerender-map'） */
  labId: string
  /** Lab のベースパス（例: '/lab/render'）。最終ステップで `${labPath}/playground` にリンクする */
  labPath: string
  step: StepInfo
  stepId: number
  /** チュートリアル全体のステップ数。フッタのドット数と進捗計算に使う */
  totalSteps: number
  /** ドット 1 つ 1 つに対応するステップ id 配列 */
  stepIds: readonly number[]
  /** ステップ間の遷移トリガ（前/次/ドット直押し） */
  onStepChange: (stepId: number) => void
  /** § 解説 セクション内に Prose ラップして表示する MDX コンテンツ */
  explanation: ReactNode
  /** § 解説 セクションの下に並べる任意要素（StepQuiz など）。Prose の外側 */
  extras?: ReactNode
  /** 右カラムの主コンテンツ（VisualizationView / MetricsDisplay 等） */
  children: ReactNode
}

export function TutorialShell({
  labPath,
  step,
  stepId,
  totalSteps,
  stepIds,
  onStepChange,
  explanation,
  extras,
  children,
}: TutorialShellProps) {
  // ステップ切替時は常に画面トップへ戻す（前ステップで下部まで読んでいても、
  // 新しい目的・解説から読み始められるように）。初回マウントは top=0 想定でスキップ。
  const isFirstRenderRef = useRef(true)
  // biome-ignore lint/correctness/useExhaustiveDependencies: stepId の変化を純粋にトリガとしてのみ使用
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [stepId])

  const progress = (stepId / totalSteps) * 100
  const isLast = stepId >= totalSteps

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-ink-400">
          <span>
            § {String(step.id).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')} — Tutorial
          </span>
          <span>{step.slug}</span>
        </div>
        <Progress value={progress} aria-label="進捗" />
        <h1 className="font-mincho text-2xl tracking-tight text-ink-900 md:text-3xl">
          {step.title}
        </h1>
      </header>

      {/*
        レイアウト: 左に読み物（目的→観察ポイント→解説→クイズ）、右に観測対象（Canvas / Metrics）。
        日本語の左→右の読み順と学習フロー（理解 → 観察）に揃えている。
        lg 未満では aside が先に積まれる（stack）のでモバイルでも「読んでから観察」の順になる。

        grid の `lg:items-start` で各カラムの高さが中身ぴったりになり、
        各カラムの grid セル内で sticky が独立に効く。
        結果として:
          - 左の解説が短い → 左が先に sticky を抜け、右 Canvas が引き続き追従
          - 右 Canvas が短い → 右が先に抜け、左の解説が追従
        ユーザーがどちらを読んでいても、短い側が画面に残る自然な挙動になる。
      */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* min-w-0: grid セルが子の intrinsic 幅で押し広げられないようにする。
            これがないと Prose 内の <pre> や長いコードトークンが viewport を超え、
            ページ全体が横スクロールしてしまう（特に SP サイズ）。 */}
        <aside className="flex min-w-0 flex-col gap-6 border border-rule-dim bg-card p-5 lg:sticky lg:top-20 lg:self-start">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.24em] text-ink-400">
              § 目的 / Objective
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-900">{step.objective}</p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.24em] text-ink-400">
              § 観察ポイント / Observation
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.observation}</p>
          </section>

          <section className="border-t border-rule-dim pt-4">
            <h2 className="mb-3 text-[11px] uppercase tracking-[0.24em] text-ink-400">§ 解説</h2>
            <Prose className="text-sm">{explanation}</Prose>
          </section>

          {extras}
        </aside>

        <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-20">{children}</div>
      </div>

      {/*
        ステップ移動ナビ:
        - モバイル: 「前 / 現在位置の数字 / 次」のコンパクト表示
        - md 以上: 全ステップのドットインジケータを表示
      */}
      <nav
        aria-label="ステップ移動"
        className="flex items-center justify-between gap-3 border-t border-rule-dim pt-6"
      >
        <Button
          type="button"
          variant="ghost"
          onClick={() => onStepChange(Math.max(1, stepId - 1))}
          disabled={stepId <= 1}
        >
          <ArrowLeft size={14} weight="bold" className="mr-1 md:mr-2" />前
          <span className="hidden sm:inline">のステップ</span>
        </Button>

        <span className="tnum shrink-0 text-[11px] uppercase tracking-[0.24em] text-ink-400 md:hidden">
          {String(stepId).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
        </span>

        <div className="hidden items-center gap-1 md:flex">
          {stepIds.map((id) => (
            <button
              key={id}
              type="button"
              aria-label={`ステップ ${id} へ`}
              aria-current={id === stepId ? 'step' : undefined}
              onClick={() => onStepChange(id)}
              className="group/dot flex h-8 w-8 cursor-pointer items-center justify-center focus-visible:outline-none"
            >
              <span
                aria-hidden="true"
                className={`block h-[3px] w-7 border transition-all group-hover/dot:h-[5px] ${
                  id === stepId
                    ? 'border-vermilion bg-vermilion shadow-[0_0_8px_var(--vermilion)]'
                    : id < stepId
                      ? 'border-ink-400 bg-ink-400/70'
                      : 'border-rule-normal bg-transparent group-hover/dot:border-ink-300'
                }`}
              />
            </button>
          ))}
        </div>

        {isLast ? (
          <Button asChild>
            <Link href={`${labPath}/playground`}>
              <CheckCircle size={14} weight="bold" className="mr-1 md:mr-2" />
              道場<span className="hidden sm:inline">モードへ</span>
            </Link>
          </Button>
        ) : (
          <Button type="button" onClick={() => onStepChange(stepId + 1)}>
            次<span className="hidden sm:inline">のステップ</span>
            <ArrowRight size={14} weight="bold" className="ml-1 md:ml-2" />
          </Button>
        )}
      </nav>
    </div>
  )
}
