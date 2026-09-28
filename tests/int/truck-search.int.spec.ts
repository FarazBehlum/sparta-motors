import { describe, expect, it } from 'vitest'
import type { Field, Where } from 'payload'
import { normalizeTruckSearch } from '../../src/lib/truck-search'

const fields: Field[] = [
  { type: 'tabs', tabs: [{ label: 'Details', fields: [
    { name: 'make', type: 'select', options: ['isuzu', 'hino'] },
    { name: 'bodyType', type: 'select', options: [{ label: 'Box Truck', value: 'box-truck' }] },
    { name: 'description', type: 'textarea' },
    { name: 'gvwr', type: 'number' },
    { name: 'inspection', type: 'group', fields: [
      { name: 'points', type: 'array', fields: [
        { name: 'rating', type: 'select', options: [{ label: 'Needs attention', value: 'attention' }] },
      ] },
    ] },
  ] }] },
]

describe('truck inventory search', () => {
  it('does not match empty numeric specs when searching text', () => {
    expect(normalizeTruckSearch({ gvwr: { like: 'isuzu' } }, fields)).toEqual({ gvwr: { in: [] } })
    expect(normalizeTruckSearch({ gvwr: { like: '26,000' } }, fields)).toEqual({ gvwr: { in: [26000] } })
  })
  it('matches makes without case sensitivity and preserves filters and description search', () => {
    const where: Where = { and: [{ status: { equals: 'published' } }, { or: [
      { make: { like: 'ISUZU' } }, { description: { like: 'ISUZU' } },
    ] }] }
    expect(normalizeTruckSearch(where, fields)).toEqual({ and: [
      { status: { equals: 'published' } },
      { or: [{ make: { in: ['isuzu'] } }, { description: { like: 'ISUZU' } }] },
    ] })
    expect(where.and?.[1]).toEqual({ or: [{ make: { like: 'ISUZU' } }, { description: { like: 'ISUZU' } }] })
  })
  it('matches partial makes and readable category labels', () => {
    expect(normalizeTruckSearch({ make: { like: 'isu' }, bodyType: { like: 'box truck' } }, fields))
      .toEqual({ make: { in: ['isuzu'] }, bodyType: { in: ['box-truck'] } })
  })
  it('handles nested inspection labels and excludes unmatched enums', () => {
    expect(normalizeTruckSearch({ 'inspection.points.rating': { like: 'needs attention' }, make: { like: 'liftgate' } }, fields))
      .toEqual({ 'inspection.points.rating': { in: ['attention'] }, make: { in: [] } })
  })
})
