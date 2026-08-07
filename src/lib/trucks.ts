import { cache } from 'react'
import type { Truck } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import {
  computeFacets,
  isSoldGraceActive,
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

/**
 * Published trucks that sold within the last SOLD_VISIBLE_DAYS — still shown in
 * the grid, badged SOLD, so the lot reads as one that moves stock. Past the
 * window they drop out of here and their page stops resolving publicly.
 *
 * The grace check runs in JS rather than SQL because it has to treat a missing
 * `soldAt` as "still visible" (see isSoldGraceActive), which is awkward to
 * express as a date predicate.
 */
export const getRecentlySoldTrucks = cache(async (): Promise<Truck[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'trucks',
    where: {
      and: [{ status: { equals: 'published' } }, { availability: { equals: 'sold' } }],
    },
    depth: 1,
    limit: 500,
    pagination: false,
    sort: '-soldAt',
  })
  return docs.filter((t) => isSoldGraceActive(t))
})

/**
 * Full inventory query: filtered + sorted trucks, total published, and facets.
 *
 * Recently-sold trucks are appended AFTER the sorted buyable ones rather than
 * mixed in, so whichever sort is active, a shopper never opens the page to a
 * truck they can't buy. `total` and the facet counts stay buyable-only — "In
 * stock" has to mean what it says, and a filter promising 3 box trucks should
 * not be counting one that's gone.
 */
export async function queryInventory(filters: TruckFilters) {
  const [all, recentlySold] = await Promise.all([getPublishedTrucks(), getRecentlySoldTrucks()])
  const filtered = sortTrucks(all.filter((t) => truckMatches(t, filters)), filters.sort)
  const soldMatching = recentlySold.filter((t) => truckMatches(t, filters))
  return {
    trucks: [...filtered, ...soldMatching],
    total: all.length,
    facets: computeFacets(all),
  }
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
 * Single published truck by slug (or null). Deliberately does NOT apply the
 * sold grace period — it returns sold trucks whether or not their window has
 * lapsed, and the page decides what to do. That split is on purpose: the page
 * needs to tell "no such truck" (404) apart from "sold and retired" (redirect
 * to inventory), and it can't if this collapses both to null.
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
 * purpose: inside the grace window their page still resolves, and past it the
 * page issues its own redirect. Either way the route needs to exist rather
 * than 404 at the router level.
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
