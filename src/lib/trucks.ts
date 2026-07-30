import { cache } from 'react'
import type { Truck } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import {
  computeFacets,
  parseFilters,
  sortTrucks,
  truckMatches,
  type TruckFilters,
} from '@/lib/trucks-shared'

// Re-export the client-safe API so server code can import everything from here.
export * from '@/lib/trucks-shared'

/**
 * All published trucks a shopper can still act on, photos populated, newest
 * first. Sold trucks are left out of every browse surface (inventory, home,
 * search, "similar trucks") but keep their own page — see getTruckBySlug.
 */
export const getPublishedTrucks = cache(async (): Promise<Truck[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'trucks',
    where: {
      and: [{ status: { equals: 'published' } }, { availability: { not_equals: 'sold' } }],
    },
    depth: 1,
    limit: 500,
    pagination: false,
    sort: '-publishedAt',
  })
  return docs
})

/** Full inventory query: filtered + sorted trucks, total published, and facets. */
export async function queryInventory(filters: TruckFilters) {
  const all = await getPublishedTrucks()
  const filtered = sortTrucks(all.filter((t) => truckMatches(t, filters)), filters.sort)
  return { trucks: filtered, total: all.length, facets: computeFacets(all) }
}

// parseFilters is re-exported above; kept here for symmetry of server imports.
export { parseFilters }

/**
 * Up to `limit` trucks for the home "Featured inventory" strip: featured ones
 * first (newest within), then filled out with the most recently published.
 */
export async function getFeaturedTrucks(limit = 6): Promise<Truck[]> {
  const all = await getPublishedTrucks() // already sorted -publishedAt
  const featured = all.filter((t) => t.featured)
  const rest = all.filter((t) => !t.featured)
  return [...featured, ...rest].slice(0, limit)
}

/**
 * Single published truck by slug (or null). Deliberately does NOT filter out
 * sold trucks: a sold listing keeps a working page (marked SOLD, with similar
 * trucks below) so saved links and search results don't 404.
 */
export const getTruckBySlug = cache(async (slug: string): Promise<Truck | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'trucks',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    depth: 1,
    limit: 1,
  })
  return docs[0] ?? null
})

/** Up to `limit` buyable trucks of the same body type, excluding the given id. */
export async function getSimilarTrucks(truck: Truck, limit = 3): Promise<Truck[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'trucks',
    where: {
      and: [
        { status: { equals: 'published' } },
        { availability: { not_equals: 'sold' } },
        { bodyType: { equals: truck.bodyType } },
        { id: { not_equals: truck.id } },
      ],
    },
    depth: 1,
    limit,
    sort: '-publishedAt',
  })
  return docs
}

/**
 * All published slugs — for generateStaticParams. Includes sold trucks on
 * purpose so their pages are still pre-rendered and resolve instead of 404ing.
 */
export async function getPublishedSlugs(): Promise<string[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'trucks',
    where: { status: { equals: 'published' } },
    depth: 0,
    limit: 500,
    pagination: false,
  })
  return docs.map((d) => d.slug).filter((s): s is string => Boolean(s))
}
