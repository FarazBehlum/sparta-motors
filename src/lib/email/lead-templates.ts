import { formatDateTime, formatMileage, formatPrice, makeLabel } from '../format'
import { SITE_URL as siteUrl } from '../site'

interface LeadLike {
  id: string | number
  fullName: string
  phone: string
  email: string
  message?: string | null
  source: string
  financingInterest?: boolean | null
  tradeIn?: boolean | null
  tradeInYearMakeModel?: string | null
  tradeInMileage?: number | null
  tradeInCondition?: string | null
  heardAboutUs?: string | null
}

interface TruckLike {
  year: number
  make: string
  model: string
  stockNumber?: string | null
  vin: string
  price: number
  mileage: number
}

const SOURCE_FLAGS: Record<string, string> = {
  'truck-inquiry': 'TRUCK INQUIRY',
  'financing-prequal': 'FINANCING PRE-QUAL',
  'general-contact': 'GENERAL CONTACT',
}

export function newLeadEmail(
  lead: LeadLike,
  truck?: TruckLike | null,
): { subject: string; body: string; replyTo: string } {
  const flag = SOURCE_FLAGS[lead.source] ?? lead.source.toUpperCase()
  const truckName = truck
    ? `${truck.year} ${makeLabel(truck.make)} ${truck.model}`
    : 'General inquiry'

  let subject = `[NEW LEAD] ${flag} - ${truckName}`
  if (lead.financingInterest) subject += ' · FINANCING'
  if (lead.tradeIn) subject += ' · TRADE-IN'

  const truckBlock = truck
    ? `${truck.year} ${makeLabel(truck.make)} ${truck.model}
Stock #${truck.stockNumber ?? '—'} · VIN ${truck.vin} · ${formatPrice(truck.price)} · ${formatMileage(
        truck.mileage,
      )}`
    : 'None specified'

  const tradeInBlock = lead.tradeIn
    ? `
  Year/Make/Model: ${lead.tradeInYearMakeModel ?? '—'}
  Mileage: ${lead.tradeInMileage ?? '—'}
  Condition: ${lead.tradeInCondition ?? '—'}`
    : ''

  const body = `NEW LEAD

Source: ${flag}
Received: ${formatDateTime(new Date())}

CONTACT
${lead.fullName}
${lead.phone}
${lead.email}

TRUCK OF INTEREST
${truckBlock}

MESSAGE
${lead.message || 'No message provided'}

FLAGS
Financing: ${lead.financingInterest ? 'Yes' : 'No'}
Trade-in: ${lead.tradeIn ? 'Yes' : 'No'}${tradeInBlock}
Heard about us: ${lead.heardAboutUs || 'Not specified'}

---
View this lead in admin: ${siteUrl}/admin/collections/leads/${lead.id}
Reply-to: ${lead.email}`

  return { subject, body, replyTo: lead.email }
}

interface FleetInquiryLike {
  id: string | number
  companyName: string
  contactName: string
  phone: string
  email: string
  fleetSize: string
  timeline: string
  trucksNeeded: string
  heardAboutUs?: string | null
}

const FLEET_SIZE_LABELS: Record<string, string> = {
  '1-3': '1–3',
  '4-10': '4–10',
  '10-plus': '10+',
}

const TIMELINE_LABELS: Record<string, string> = {
  asap: 'ASAP',
  '1-3-months': '1–3 months',
  '3-6-months': '3–6 months',
  ongoing: 'Ongoing',
}

export function newFleetInquiryEmail(inq: FleetInquiryLike): {
  subject: string
  body: string
  replyTo: string
} {
  const size = FLEET_SIZE_LABELS[inq.fleetSize] ?? inq.fleetSize
  const timeline = TIMELINE_LABELS[inq.timeline] ?? inq.timeline
  return {
    subject: `[FLEET INQUIRY] ${inq.companyName} - ${size} trucks, ${timeline}`,
    body: `NEW FLEET INQUIRY

Received: ${formatDateTime(new Date())}

COMPANY
${inq.companyName}
Contact: ${inq.contactName}
${inq.phone}
${inq.email}

REQUIREMENTS
Fleet size: ${size}
Timeline: ${timeline}

TRUCKS NEEDED
${inq.trucksNeeded}

Heard about us: ${inq.heardAboutUs || 'Not specified'}

---
View this inquiry in admin: ${siteUrl}/admin/collections/fleet-inquiries/${inq.id}
Reply-to: ${inq.email}`,
    replyTo: inq.email,
  }
}
