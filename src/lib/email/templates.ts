import { formatDateTime, formatMileage, formatPrice, makeLabel } from '../format'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const adminUrl = (path: string) => `${siteUrl}/admin${path}`

interface TruckLike {
  id: string | number
  year: number
  make: string
  model: string
  trim?: string | null
  mileage: number
  condition?: string | null
  price: number
  vin: string
  stockNumber?: string | null
  slug?: string | null
  photos?: unknown[] | null
  specSheet?: unknown
}

function truckName(t: TruckLike): string {
  return [t.year, makeLabel(t.make), t.model, t.trim].filter(Boolean).join(' ')
}

export function draftSubmittedEmail(
  truck: TruckLike,
  employee: { firstName?: string; lastName?: string },
): { subject: string; body: string } {
  const name = truckName(truck)
  const who = [employee.firstName, employee.lastName].filter(Boolean).join(' ') || 'An employee'
  return {
    subject: `[DRAFT REVIEW] ${name} from ${who}`,
    body: `NEW DRAFT READY FOR REVIEW

Submitted by: ${who}
Submitted at: ${formatDateTime(new Date())}

TRUCK
${name}
Stock #${truck.stockNumber ?? '—'}
${formatMileage(truck.mileage)} · ${truck.condition ?? '—'} · ${formatPrice(truck.price)}
${truck.photos?.length ?? 0} photos attached
Spec sheet: ${truck.specSheet ? 'Yes' : 'No'}

---
Review this draft: ${adminUrl(`/collections/trucks/${truck.id}`)}`,
  }
}

export function draftPublishedEmail(truck: TruckLike): { subject: string; body: string } {
  const name = truckName(truck)
  return {
    subject: `Your listing is live: ${name}`,
    body: `Your truck listing is now live on the public site.

TRUCK
${name}
Stock #${truck.stockNumber ?? '—'}
Public URL: ${siteUrl}/trucks/${truck.slug ?? ''}

Great work — customers can now see this listing and inquire about it.

--
Sparta Motors admin`,
  }
}

export function draftSentBackEmail(
  truck: TruckLike,
  reviewNote: string,
): { subject: string; body: string } {
  const name = truckName(truck)
  return {
    subject: `Changes needed on draft: ${name}`,
    body: `Your draft needs some changes before it can be published.

TRUCK
${name}
Stock #${truck.stockNumber ?? '—'}

NOTES FROM ADMIN
${reviewNote}

Edit your draft: ${adminUrl(`/collections/trucks/${truck.id}`)}

--
Sparta Motors admin`,
  }
}
