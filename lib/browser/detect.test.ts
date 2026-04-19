import { describe, expect, it } from 'vitest'
import { classifyUserAgent, detectBrowser, detectDeviceType, detectOs, isChromium } from './detect'

describe('detectBrowser', () => {
  it.each([
    ['Mozilla/5.0 (Macintosh) Chrome/120.0.0.0 Safari/537.36', 'chromium'],
    ['Mozilla/5.0 (Windows) Edg/120.0.0.0', 'chromium'],
    ['Mozilla/5.0 (iPhone) CriOS/120.0.0.0', 'chromium'],
    ['Mozilla/5.0 (Macintosh) Safari/605.1.15 Version/17.0', 'safari'],
    ['Mozilla/5.0 (Windows) Firefox/120.0', 'firefox'],
    ['Mozilla/5.0 (Mobile) FxiOS/120.0', 'firefox'],
    ['SomeBot/1.0', 'other'],
    ['', 'other'],
  ])('detects %s as %s', (ua, expected) => {
    expect(detectBrowser(ua)).toBe(expected)
  })
})

describe('detectDeviceType', () => {
  it.each([
    ['Mozilla/5.0 (Macintosh) Chrome/120.0.0.0', 'desktop'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile Safari/605.1.15', 'mobile'],
    ['Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Chrome/120.0.0.0', 'mobile'],
    ['Mozilla/5.0 (iPad; CPU OS 17_0) Safari/605.1.15', 'tablet'],
    ['Mozilla/5.0 (Linux; Android 14; Tablet) Chrome/120.0.0.0', 'tablet'],
    ['', 'desktop'],
  ])('detects %s as %s', (ua, expected) => {
    expect(detectDeviceType(ua)).toBe(expected)
  })
})

describe('isChromium', () => {
  it('returns true for Chrome', () => {
    expect(isChromium('Chrome/120.0.0.0 Safari/537.36')).toBe(true)
  })
  it('returns false for Safari', () => {
    expect(isChromium('Version/17.0 Safari/605.1.15')).toBe(false)
  })
})

describe('detectOs', () => {
  it.each([
    ['Mozilla/5.0 (Windows NT 10.0) Chrome/120.0.0.0', 'windows'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Safari/605.1.15', 'macos'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile Safari/605.1.15', 'ios'],
    ['Mozilla/5.0 (iPad; CPU OS 17_0) Safari/605.1.15', 'ios'],
    ['Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Chrome/120.0.0.0', 'android'],
    ['Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0', 'linux'],
    ['SomeBot/1.0', 'other'],
    ['', 'other'],
  ])('detects %s as %s', (ua, expected) => {
    expect(detectOs(ua)).toBe(expected)
  })
})

describe('classifyUserAgent', () => {
  it('returns all three labels from a Chrome on macOS UA', () => {
    expect(classifyUserAgent('Mozilla/5.0 (Macintosh) Chrome/120.0.0.0 Safari/537.36')).toEqual({
      browser: 'chromium',
      os: 'macos',
      device_type: 'desktop',
    })
  })
  it('falls back to other / desktop on null input', () => {
    expect(classifyUserAgent(null)).toEqual({
      browser: 'other',
      os: 'other',
      device_type: 'desktop',
    })
  })
})
