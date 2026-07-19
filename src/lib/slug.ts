import { vinSuffix } from './vin'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Truck slug: {year}-{make}-{model}-{vin-last-4} */
export function truckSlug({
  year,
  make,
  model,
  vin,
}: {
  year: number
  make: string
  model: string
  vin: string
}): string {
  return slugify(`${year}-${make}-${model}-${vinSuffix(vin)}`)
}
