import type { Setting } from '@/payload-types'

// Fallback coords ≈ 890 S Irwin Ave, Spartanburg, SC (also set by the seed).
const FALLBACK_COORDS = { lat: 34.9377, lng: -81.9187 }

/** Address as display lines, e.g. ["890 S Irwin Ave", "Spartanburg, SC 29306"]. */
export function addressLines(settings: Setting): string[] {
  const a = settings.address
  if (!a) return []
  const cityState = [a.city, a.state].filter(Boolean).join(', ')
  const cityStateZip = [cityState, a.zip].filter(Boolean).join(' ')
  return [a.line1, a.line2, cityStateZip].filter((l): l is string => Boolean(l && l.trim()))
}

/** Marker coordinates from Settings, falling back to the Spartanburg lot. */
export function coords(settings: Setting): { lat: number; lng: number } {
  const a = settings.address
  if (a?.latitude != null && a?.longitude != null) {
    return { lat: a.latitude, lng: a.longitude }
  }
  return FALLBACK_COORDS
}
