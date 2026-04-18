/**
 * PipelineDiagram の点灯ロジックに絞ったユニットテスト。
 * motion アニメーションは jsdom で実行しても副作用ゼロなのでそのまま流す。
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PipelineDiagram } from './PipelineDiagram'

describe('PipelineDiagram', () => {
  describe('variant="full"', () => {
    it('全ての段階が表示される（走らない段階も枠は描画される）', () => {
      render(<PipelineDiagram />)
      // JS / Style / Display は常時 active
      expect(screen.getByLabelText('JS: 走る')).toBeInTheDocument()
      expect(screen.getByLabelText('Style: 走る')).toBeInTheDocument()
      expect(screen.getByLabelText('Display: 走る')).toBeInTheDocument()
      // props / impact 未指定なら L/P/C は全て非 active
      expect(screen.getByLabelText('Layout: 走らない')).toBeInTheDocument()
      expect(screen.getByLabelText('Paint: 走らない')).toBeInTheDocument()
      expect(screen.getByLabelText('Composite: 走らない')).toBeInTheDocument()
    })

    it('impact.layout=true のとき Layout だけが走るとラベル付けされる', () => {
      render(<PipelineDiagram impact={{ layout: true, paint: false, composite: false }} />)
      expect(screen.getByLabelText('Layout: 走る')).toBeInTheDocument()
      expect(screen.getByLabelText('Paint: 走らない')).toBeInTheDocument()
      expect(screen.getByLabelText('Composite: 走らない')).toBeInTheDocument()
    })

    it('transform プロパティを渡すと Composite のみ active', () => {
      render(<PipelineDiagram props={['transform']} />)
      expect(screen.getByLabelText('Layout: 走らない')).toBeInTheDocument()
      expect(screen.getByLabelText('Paint: 走らない')).toBeInTheDocument()
      expect(screen.getByLabelText('Composite: 走る')).toBeInTheDocument()
    })

    it('width プロパティを渡すと 3 段階 全て active（Layout + Paint + Composite）', () => {
      render(<PipelineDiagram props={['width']} />)
      expect(screen.getByLabelText('Layout: 走る')).toBeInTheDocument()
      expect(screen.getByLabelText('Paint: 走る')).toBeInTheDocument()
      expect(screen.getByLabelText('Composite: 走る')).toBeInTheDocument()
    })

    it('background-color を渡すと Paint + Composite だけ active、Layout は skip', () => {
      render(<PipelineDiagram props={['background-color']} />)
      expect(screen.getByLabelText('Layout: 走らない')).toBeInTheDocument()
      expect(screen.getByLabelText('Paint: 走る')).toBeInTheDocument()
      expect(screen.getByLabelText('Composite: 走る')).toBeInTheDocument()
    })

    it('複数プロパティは aggregate される（transform + width → 3 段階 active）', () => {
      render(<PipelineDiagram props={['transform', 'width']} />)
      expect(screen.getByLabelText('Layout: 走る')).toBeInTheDocument()
      expect(screen.getByLabelText('Paint: 走る')).toBeInTheDocument()
      expect(screen.getByLabelText('Composite: 走る')).toBeInTheDocument()
    })

    it('impact は props より優先される', () => {
      render(
        <PipelineDiagram
          props={['width']}
          impact={{ layout: false, paint: false, composite: true }}
        />,
      )
      // impact だけを採用するので Layout は非 active のはず
      expect(screen.getByLabelText('Layout: 走らない')).toBeInTheDocument()
      expect(screen.getByLabelText('Composite: 走る')).toBeInTheDocument()
    })

    it('active な phase に aria-current が付く', () => {
      render(<PipelineDiagram props={['transform']} />)
      const composite = screen.getByLabelText('Composite: 走る')
      expect(composite).toHaveAttribute('aria-current', 'true')
      const layout = screen.getByLabelText('Layout: 走らない')
      expect(layout).not.toHaveAttribute('aria-current')
    })
  })

  describe('variant="compact"', () => {
    it('L / P / C の 3 つだけが表示される', () => {
      render(<PipelineDiagram variant="compact" props={['transform']} />)
      expect(screen.getByLabelText('Layout: 走らない')).toBeInTheDocument()
      expect(screen.getByLabelText('Paint: 走らない')).toBeInTheDocument()
      expect(screen.getByLabelText('Composite: 走る')).toBeInTheDocument()
      // full 版にしかない JS / Style / Display は出ない
      expect(screen.queryByLabelText('JS: 走る')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Display: 走る')).not.toBeInTheDocument()
    })

    it('width を渡すと L/P/C 3 つ全て active', () => {
      render(<PipelineDiagram variant="compact" props={['width']} />)
      expect(screen.getByLabelText('Layout: 走る')).toBeInTheDocument()
      expect(screen.getByLabelText('Paint: 走る')).toBeInTheDocument()
      expect(screen.getByLabelText('Composite: 走る')).toBeInTheDocument()
    })
  })
})
