import type { Truck } from '@/payload-types'

/**
 * Client-safe inventory types, constants, and pure helpers. Contains NO Payload
 * / server imports so it can be used from client components. Server-only query
 * functions live in `@/lib/trucks`.
 */

export type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'mileage-asc'
export type ViewKey = 'grid' | 'list'

export const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Mileage: Low to High', value: 'mileage-asc' },
]

export type TruckFilters = {
  body: string[]
  make: string[]
  fuel: string[]
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
  mileageMin?: number
  mileageMax?: number
  q?: string
  sort: SortKey
  view: ViewKey
}

export type RawParams = Record<string, string | string[] | undefined>

export type Facets = {
  body: Record<string, number>
  make: Record<string, number>
  fuel: Record<string, number>
  yearRange: [number, number]
  priceRange: [number, number]
  mileageRange: [number, number]
}

function csv(v: string | string[] | undefined): string[] {
  if (!v) return []
  const s = Array.isArray(v) ? v.join(',') : v
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}

function num(v: string | string[] | undefined): number | undefined {
  const s = Array.isArray(v) ? v[0] : v
  if (s == null || s === '') return undefined
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

const VALID_SORTS: SortKey[] = ['featured', 'newest', 'price-asc', 'price-desc', 'mileage-asc']

/** Parse Next.js searchParams into a normalized filter object. */
export function parseFilters(params: RawParams, lockedBody?: string): TruckFilters {
  const sortRaw = (Array.isArray(params.sort) ? params.sort[0] : params.sort) as SortKey
  const viewRaw = Array.isArray(params.view) ? params.view[0] : params.view
  const q = Array.isArray(params.q) ? params.q[0] : params.q
  return {
    body: lockedBody ? [lockedBody] : csv(params.body),
    make: csv(params.make),
    fuel: csv(params.fuel),
    yearMin: num(params.year_min),
    yearMax: num(params.year_max),
    priceMin: num(params.price_min),
    priceMax: num(params.price_max),
    mileageMin: num(params.mileage_min),
    mileageMax: num(params.mileage_max),
    q: q?.trim() || undefined,
    sort: VALID_SORTS.includes(sortRaw) ? sortRaw : 'featured',
    view: viewRaw === 'list' ? 'list' : 'grid',
  }
}

export function truckMatches(t: Truck, f: TruckFilters): boolean {
  if (f.body.length && !f.body.includes(t.bodyType)) return false
  if (f.make.length && !f.make.includes(t.make)) return false
  if (f.fuel.length && !f.fuel.includes(t.fuelType)) return false
  if (f.yearMin != null && t.year < f.yearMin) return false
  if (f.yearMax != null && t.year > f.yearMax) return false
  if (f.priceMin != null && t.price < f.priceMin) return false
  if (f.priceMax != null && t.price > f.priceMax) return false
  if (f.mileageMin != null && t.mileage < f.mileageMin) return false
  if (f.mileageMax != null && t.mileage > f.mileageMax) return false
  if (f.q) {
    const hay = `${t.year} ${t.make} ${t.model} ${t.trim ?? ''} ${t.vin} ${t.stockNumber ?? ''}`.toLowerCase()
    if (!hay.includes(f.q.toLowerCase())) return false
  }
  return true
}

export function sortTrucks(trucks: Truck[], sort: SortKey): Truck[] {
  const out = [...trucks]
  switch (sort) {
    case 'price-asc':
      return out.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return out.sort((a, b) => b.price - a.price)
    case 'mileage-asc':
      return out.sort((a, b) => a.mileage - b.mileage)
    case 'newest':
      return out.sort((a, b) => +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0))
    case 'featured':
    default:
      return out.sort((a, b) => {
        const fa = a.featured ? 1 : 0
        const fb = b.featured ? 1 : 0
        if (fa !== fb) return fb - fa
        return +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0)
      })
  }
}

function tally(trucks: Truck[], key: (t: Truck) => string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const t of trucks) out[key(t)] = (out[key(t)] ?? 0) + 1
  return out
}

/** Facet counts + numeric ranges over a set of trucks. */
export function computeFacets(all: Truck[]): Facets {
  const years = all.map((t) => t.year)
  const prices = all.map((t) => t.price)
  const miles = all.map((t) => t.mileage)
  const range = (arr: number[], fallback: [number, number]): [number, number] =>
    arr.length ? [Math.min(...arr), Math.max(...arr)] : fallback
  return {
    body: tally(all, (t) => t.bodyType),
    make: tally(all, (t) => t.make),
    fuel: tally(all, (t) => t.fuelType),
    yearRange: range(years, [2010, new Date().getFullYear()]),
    priceRange: range(prices, [0, 150000]),
    mileageRange: range(miles, [0, 300000]),
  }
}
