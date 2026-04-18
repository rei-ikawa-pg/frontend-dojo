import { describe, expect, it } from 'vitest'
import { getQuiz, QUIZZES } from './quizzes'
import { TUTORIAL_STEPS } from './steps'

describe('quizzes', () => {
  it('全ステップ分のクイズが用意されている', () => {
    for (const step of TUTORIAL_STEPS) {
      expect(getQuiz(step.id), `step ${step.id} のクイズが未定義`).not.toBeNull()
    }
  })

  it('各クイズに正解選択肢が含まれている', () => {
    for (const quiz of QUIZZES) {
      const correct = quiz.options.find((o) => o.id === quiz.correctId)
      expect(correct, `quiz ${quiz.stepId} の correctId が選択肢に存在しない`).toBeDefined()
    }
  })

  it('各クイズは最低 2 つの選択肢を持つ', () => {
    for (const quiz of QUIZZES) {
      expect(quiz.options.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('不正解選択肢はすべてヒントを持つ', () => {
    for (const quiz of QUIZZES) {
      for (const opt of quiz.options) {
        if (opt.id === quiz.correctId) continue
        expect(opt.hint, `quiz ${quiz.stepId} / option ${opt.id} にヒントがない`).toBeTruthy()
      }
    }
  })
})
