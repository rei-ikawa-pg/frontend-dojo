import { beforeEach, describe, expect, it } from 'vitest'
import {
  ELEMENT_COUNT_DEFAULT,
  ELEMENT_COUNT_MAX,
  ELEMENT_COUNT_MIN,
  usePlaygroundStore,
} from './playgroundStore'

describe('playgroundStore', () => {
  beforeEach(() => {
    usePlaygroundStore.getState().reset()
  })

  it('starts with default values', () => {
    const s = usePlaygroundStore.getState()
    expect(s.elementCount).toBe(ELEMENT_COUNT_DEFAULT)
    expect(s.isRunning).toBe(false)
    expect(Array.from(s.enabledProps)).toEqual(['transform'])
  })

  it('clamps element count to range', () => {
    const { setElementCount } = usePlaygroundStore.getState()
    setElementCount(50)
    expect(usePlaygroundStore.getState().elementCount).toBe(ELEMENT_COUNT_MIN)
    setElementCount(99999)
    expect(usePlaygroundStore.getState().elementCount).toBe(ELEMENT_COUNT_MAX)
  })

  it('toggleProp adds and removes', () => {
    const { toggleProp } = usePlaygroundStore.getState()
    toggleProp('opacity')
    expect(usePlaygroundStore.getState().enabledProps.has('opacity')).toBe(true)
    toggleProp('opacity')
    expect(usePlaygroundStore.getState().enabledProps.has('opacity')).toBe(false)
  })

  it('start/stop flips isRunning', () => {
    usePlaygroundStore.getState().start()
    expect(usePlaygroundStore.getState().isRunning).toBe(true)
    usePlaygroundStore.getState().stop()
    expect(usePlaygroundStore.getState().isRunning).toBe(false)
  })

  it('reset returns to defaults', () => {
    const s = usePlaygroundStore.getState()
    s.setElementCount(1500)
    s.toggleProp('width')
    s.start()
    s.reset()
    const after = usePlaygroundStore.getState()
    expect(after.elementCount).toBe(ELEMENT_COUNT_DEFAULT)
    expect(after.isRunning).toBe(false)
    expect(Array.from(after.enabledProps)).toEqual(['transform'])
  })
})
