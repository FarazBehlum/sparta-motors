// VIN = 17 chars, alphanumeric, excluding I, O, Q
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/

export function isValidVin(vin: string): boolean {
  return VIN_REGEX.test(vin.toUpperCase())
}

export function normalizeVin(vin: string): string {
  return vin.toUpperCase().trim()
}

export function vinSuffix(vin: string): string {
  return vin.slice(-4).toLowerCase()
}
