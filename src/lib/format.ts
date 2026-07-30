export function formatPrice(dollars: number | null | undefined): string {
  if (dollars == null) return '—'
  return `$${dollars.toLocaleString('en-US')}`
}

export function formatMileage(miles: number | null | undefined): string {
  if (miles == null) return '—'
  return `${miles.toLocaleString('en-US')} miles`
}

export function formatPhone(raw: string | null | undefined): string {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return raw
}

/** `tel:` href with non-dial characters stripped, or null when no phone. */
export function telHref(phone: string | null | undefined): string | null {
  if (!phone) return null
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const MAKE_LABELS: Record<string, string> = {
  isuzu: 'Isuzu',
  hino: 'Hino',
  freightliner: 'Freightliner',
  nissan: 'Nissan',
  volvo: 'Volvo',
  peterbilt: 'Peterbilt',
  kenworth: 'Kenworth',
  mack: 'Mack',
  international: 'International',
  other: 'Other',
}

export function makeLabel(make: string): string {
  return MAKE_LABELS[make] ?? make
}

/**
 * Main headline for a truck: the custom listing title if set, otherwise
 * "{model} {trim}". Pairs with the "{year} · {make}" eyebrow shown above it,
 * so the eyebrow keeps the factual context even when a custom title is used.
 */
export function truckHeadline(t: {
  listingTitle?: string | null
  model: string
  trim?: string | null
}): string {
  return t.listingTitle?.trim() || [t.model, t.trim].filter(Boolean).join(' ')
}

const BODY_TYPE_LABELS: Record<string, string> = {
  'box-truck': 'Box Truck',
  reefer: 'Reefer',
  'day-cab': 'Day Cab',
  'flat-bed': 'Flatbed',
  'dump-truck': 'Dump Truck',
  'tow-truck': 'Tow Truck',
}

export function bodyTypeLabel(bodyType: string): string {
  return BODY_TYPE_LABELS[bodyType] ?? bodyType
}

// Category page slug <-> bodyType value mapping
export const CATEGORY_TO_BODY_TYPE: Record<string, string> = {
  'box-trucks': 'box-truck',
  reefers: 'reefer',
  'day-cabs': 'day-cab',
  'flat-beds': 'flat-bed',
  'dump-trucks': 'dump-truck',
  'tow-trucks': 'tow-truck',
}

export const BODY_TYPE_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_TO_BODY_TYPE).map(([cat, body]) => [body, cat]),
)
