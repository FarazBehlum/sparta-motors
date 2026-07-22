import type { MetadataRoute } from 'next'
import { getPublishedTrucks } from '@/lib/trucks'
import { CATEGORY_TO_BODY_TYPE } from '@/lib/format'
import { SITE_URL as siteUrl } from '@/lib/site'

/** Public, indexable routes and their relative priority. */
const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/inventory', priority: 0.9, changeFrequency: 'daily' },
  { path: '/financing', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/parts', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  const categoryEntries: MetadataRoute.Sitemap = Object.keys(CATEGORY_TO_BODY_TYPE).map((slug) => ({
    url: `${siteUrl}/inventory/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  let truckEntries: MetadataRoute.Sitemap = []
  try {
    const trucks = await getPublishedTrucks()
    truckEntries = trucks
      .filter((t) => t.slug)
      .map((t) => ({
        url: `${siteUrl}/trucks/${t.slug}`,
        lastModified: t.updatedAt ? new Date(t.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
  } catch {
    // If the DB is unreachable at build/request time, still emit the static map.
  }

  return [...staticEntries, ...categoryEntries, ...truckEntries]
}
