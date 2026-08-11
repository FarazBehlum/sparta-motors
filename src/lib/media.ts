import type { Media, Truck } from '@/payload-types'
import { makeLabel } from '@/lib/format'

type SizeName = 'thumbnail' | 'card' | 'hero'

export type Photo = { url: string; alt: string; width?: number; height?: number }

/** Resolve a Media relation to a usable URL at the requested size (falls back to original). */
export function mediaPhoto(
  image: number | Media | null | undefined,
  size: SizeName,
  fallbackAlt = '',
): Photo | null {
  if (!image || typeof image !== 'object') return null
  const url = image.sizes?.[size]?.url ?? image.url
  if (!url) return null
  return {
    url,
    alt: image.alt ?? fallbackAlt,
    width: image.sizes?.[size]?.width ?? image.width ?? undefined,
    height: image.sizes?.[size]?.height ?? image.height ?? undefined,
  }
}

/** All resolvable photos for a truck at a given size. */
export function truckPhotos(truck: Truck, size: SizeName): Photo[] {
  // `make` is stored lowercased ("hino"), so the raw value produced alt text
  // reading "2019 hino 195". Photos rarely have an alt set in the CMS, so this
  // fallback is what screen readers and Google Images actually get.
  const alt = `${truck.year} ${makeLabel(truck.make)} ${truck.model}`
  return (truck.photos ?? [])
    .map((img) => mediaPhoto(img, size, alt))
    .filter((p): p is Photo => p !== null)
}

/** First usable photo for a truck (for cards). */
export function truckPrimaryPhoto(truck: Truck, size: SizeName = 'card'): Photo | null {
  return truckPhotos(truck, size)[0] ?? null
}
