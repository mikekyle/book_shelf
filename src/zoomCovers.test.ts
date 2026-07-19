import { describe, expect, it } from 'vitest'
import { coverCounterScale } from './zoomCovers'

describe('coverCounterScale', () => {
  it('is 1 when the feature is disabled', () => {
    expect(coverCounterScale(2, false)).toBe(1)
    expect(coverCounterScale(0.5, false)).toBe(1)
  })

  it('counter-scales only when zoomed in (k > 1)', () => {
    expect(coverCounterScale(1)).toBe(1)
    expect(coverCounterScale(2)).toBe(0.5)
    expect(coverCounterScale(4)).toBe(0.25)
  })

  it('does not enlarge covers when zoomed out', () => {
    expect(coverCounterScale(0.5)).toBe(1)
    expect(coverCounterScale(0.4)).toBe(1)
  })
})
