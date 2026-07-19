import type { Media, Truck } from '@/payload-types'

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
  const alt = `${truck.year} ${truck.make} ${truck.model}`
  return (truck.photos ?? [])
    .map((p) => mediaPhoto(p.image, size, alt))
    .filter((p): p is Photo => p !== null)
}

/** First usable photo for a truck (for cards). */
export function truckPrimaryPhoto(truck: Truck, size: SizeName = 'card'): Photo | null {
  return truckPhotos(truck, size)[0] ?? null
}
