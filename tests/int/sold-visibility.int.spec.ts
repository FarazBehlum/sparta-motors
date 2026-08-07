import { describe, it, expect } from 'vitest'
import {
  SOLD_VISIBLE_DAYS,
  isBuyable,
  isPubliclyVisible,
  isSoldGraceActive,
} from '@/lib/trucks-shared'

const NOW = new Date('2026-08-06T12:00:00Z').getTime()
const DAY = 86_400_000
/** A soldAt `days` before NOW. */
const soldDaysAgo = (days: number) => new Date(NOW - days * DAY).toISOString()

describe('sold grace period', () => {
  it('keeps a truck sold today visible', () => {
    const t = { availability: 'sold' as const, soldAt: soldDaysAgo(0) }
    expect(isSoldGraceActive(t, NOW)).toBe(true)
    expect(isPubliclyVisible(t, NOW)).toBe(true)
  })

  it('keeps it visible right up to the last day of the window', () => {
    const t = { availability: 'sold' as const, soldAt: soldDaysAgo(SOLD_VISIBLE_DAYS - 0.01) }
    expect(isPubliclyVisible(t, NOW)).toBe(true)
  })

  it('retires it once the window has fully elapsed', () => {
    const t = { availability: 'sold' as const, soldAt: soldDaysAgo(SOLD_VISIBLE_DAYS) }
    expect(isSoldGraceActive(t, NOW)).toBe(false)
    expect(isPubliclyVisible(t, NOW)).toBe(false)
  })

  it('keeps it retired well past the window', () => {
    const t = { availability: 'sold' as const, soldAt: soldDaysAgo(90) }
    expect(isPubliclyVisible(t, NOW)).toBe(false)
  })

  // The exact boundary, to the millisecond, in both directions.
  it('flips exactly at the 7-day mark', () => {
    const justInside = { availability: 'sold' as const, soldAt: new Date(NOW - (SOLD_VISIBLE_DAYS * DAY - 1)).toISOString() }
    const justOutside = { availability: 'sold' as const, soldAt: new Date(NOW - SOLD_VISIBLE_DAYS * DAY).toISOString() }
    expect(isSoldGraceActive(justInside, NOW)).toBe(true)
    expect(isSoldGraceActive(justOutside, NOW)).toBe(false)
  })
})

describe('non-sold states are never affected by the window', () => {
  it.each(['available', 'pending'] as const)('%s stays visible and buyable', (availability) => {
    // Even carrying a stale soldAt from a sale that fell through.
    const t = { availability, soldAt: soldDaysAgo(400) }
    expect(isBuyable(t)).toBe(true)
    expect(isPubliclyVisible(t, NOW)).toBe(true)
    expect(isSoldGraceActive(t, NOW)).toBe(false)
  })
})

describe('missing or unusable soldAt fails open', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['unparseable', 'not-a-date'],
  ])('sold with %s soldAt stays visible', (_label, soldAt) => {
    const t = { availability: 'sold' as const, soldAt: soldAt as string | null | undefined }
    expect(isSoldGraceActive(t, NOW)).toBe(true)
    expect(isPubliclyVisible(t, NOW)).toBe(true)
  })

  it('is not buyable even though it is visible', () => {
    const t = { availability: 'sold' as const, soldAt: null }
    expect(isBuyable(t)).toBe(false)
  })
})
