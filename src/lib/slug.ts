import { vinSuffix } from './vin'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Truck slug: {year}-{make}-{model}-{vin-last-4}, or -{stock number} when there
 *  is no VIN. The trailing token keeps otherwise-identical listings unique. */
export function truckSlug({
  year,
  make,
  model,
  vin,
  stockNumber,
}: {
  year: number
  make: string
  model: string
  vin?: string | null
  stockNumber?: string | null
}): string {
  const suffix = vin ? vinSuffix(vin) : (stockNumber ?? '')
  return slugify(`${year}-${make}-${model}-${suffix}`)
}
