import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { RenderEngine } from './renderer'

describe('RenderEngine', () => {
  let container: HTMLDivElement
  let engine: RenderEngine

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    engine = new RenderEngine({ container })
  })

  afterEach(() => {
    engine.destroy()
    container.remove()
  })

  it('creates the requested number of elements', () => {
    engine.setElementCount(10)
    expect(container.children).toHaveLength(10)
  })

  it('grows by diff (no destruction of existing nodes)', () => {
    engine.setElementCount(3)
    const firstNode = container.children[0]
    engine.setElementCount(7)
    expect(container.children).toHaveLength(7)
    expect(container.children[0]).toBe(firstNode)
  })

  it('shrinks by diff', () => {
    engine.setElementCount(8)
    engine.setElementCount(3)
    expect(container.children).toHaveLength(3)
  })

  it('clamps negative count to 0', () => {
    engine.setElementCount(5)
    engine.setElementCount(-10)
    expect(container.children).toHaveLength(0)
  })

  it('destroy clears the container', () => {
    engine.setElementCount(5)
    engine.destroy()
    expect(container.children).toHaveLength(0)
  })

  it('isRunning reflects start/stop', () => {
    expect(engine.isRunning()).toBe(false)
    engine.start()
    expect(engine.isRunning()).toBe(true)
    engine.stop()
    expect(engine.isRunning()).toBe(false)
  })

  it('changing enabled properties resets element styles', () => {
    engine.setElementCount(2)
    const el = container.children[0] as HTMLElement
    el.setAttribute('style', 'background: red')
    engine.setEnabledProperties(['transform'])
    expect(el.getAttribute('style')).toBeNull()
  })
})
