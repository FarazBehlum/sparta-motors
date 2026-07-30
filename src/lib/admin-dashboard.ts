import type { Payload, PayloadRequest } from 'payload'
import { makeLabel } from './format'

/** One week ago, ISO — used for "this week" style counts. */
function weekAgoISO(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
}

function truckName(t: {
  year?: number | null
  make?: string | null
  model?: string | null
  trim?: string | null
}): string {
  return [t.year, t.make ? makeLabel(t.make) : null, t.model, t.trim].filter(Boolean).join(' ')
}

export type ActivityDot = 'orange' | 'green' | 'gray'

export interface ActivityItem {
  id: string
  dot: ActivityDot
  text: string
  truck?: string
  tag?: string
  when: string
}

export interface LeadsDay {
  /** Single-letter weekday label, e.g. "M". */
  label: string
  /** Full label for accessibility, e.g. "Mon Jul 14". */
  full: string
  count: number
}

export interface DashboardData {
  newLeads: number
  pendingReview: number
  publishedTrucks: number
  oldestPendingDays: number | null
  publishedThisWeek: number
  newLeadsSinceYesterday: number
  activity: ActivityItem[]
  /** Leads created per day over the last 7 calendar days (oldest first). */
  leadsByDay: LeadsDay[]
}

const SOURCE_TAGS: Record<string, string> = {
  'financing-prequal': 'FINANCING',
  'truck-inquiry': 'TRUCK',
  'general-contact': 'GENERAL',
}

/**
 * Aggregates the counts and recent-activity feed shown on the custom admin
 * dashboard. Runs a handful of cheap count queries plus two small `find`s.
 * `req` is threaded through so collection access rules apply to the caller.
 */
export async function getDashboardData(
  payload: Payload,
  req: PayloadRequest,
): Promise<DashboardData> {
  const weekAgo = weekAgoISO()
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Midnight 6 days ago → the start of the 7-day window shown in the chart.
  const chartStart = new Date()
  chartStart.setHours(0, 0, 0, 0)
  chartStart.setDate(chartStart.getDate() - 6)

  const [
    newLeads,
    pendingReview,
    publishedTrucks,
    publishedThisWeek,
    newLeadsSinceYesterday,
    oldestPending,
    recentLeads,
    recentTrucks,
    chartLeads,
  ] = await Promise.all([
    payload.count({ collection: 'leads', where: { status: { equals: 'new' } }, req }),
    payload.count({ collection: 'trucks', where: { status: { equals: 'pending-review' } }, req }),
    payload.count({ collection: 'trucks', where: { status: { equals: 'published' } }, req }),
    payload.count({
      collection: 'trucks',
      where: {
        and: [{ status: { equals: 'published' } }, { publishedAt: { greater_than: weekAgo } }],
      },
      req,
    }),
    payload.count({
      collection: 'leads',
      where: { and: [{ status: { equals: 'new' } }, { createdAt: { greater_than: dayAgo } }] },
      req,
    }),
    payload.find({
      collection: 'trucks',
      where: { status: { equals: 'pending-review' } },
      sort: 'createdAt',
      limit: 1,
      depth: 0,
      req,
    }),
    payload.find({ collection: 'leads', sort: '-createdAt', limit: 8, depth: 1, req }),
    payload.find({
      collection: 'trucks',
      // Sold trucks stay `published` now — sale state lives on `availability`.
      where: { status: { in: ['pending-review', 'published'] } },
      sort: '-updatedAt',
      limit: 8,
      depth: 0,
      req,
    }),
    payload.find({
      collection: 'leads',
      where: { createdAt: { greater_than_equal: chartStart.toISOString() } },
      sort: 'createdAt',
      limit: 1000,
      depth: 0,
      req,
    }),
  ])

  let oldestPendingDays: number | null = null
  const oldest = oldestPending.docs[0] as { createdAt?: string } | undefined
  if (oldest?.createdAt) {
    oldestPendingDays = Math.floor(
      (Date.now() - new Date(oldest.createdAt).getTime()) / (24 * 60 * 60 * 1000),
    )
  }

  const activity: ActivityItem[] = []

  for (const lead of recentLeads.docs as unknown as Array<Record<string, unknown>>) {
    const truck = lead.truckOfInterest as Record<string, unknown> | null
    activity.push({
      id: `lead-${lead.id}`,
      dot: 'orange',
      text: `New lead from ${String(lead.fullName ?? 'Unknown')}`,
      truck: truck && typeof truck === 'object' ? truckName(truck) : undefined,
      tag: SOURCE_TAGS[String(lead.source)] ?? undefined,
      when: String(lead.createdAt ?? ''),
    })
  }

  for (const t of recentTrucks.docs as unknown as Array<Record<string, unknown>>) {
    const status = String(t.status)
    const availability = String(t.availability ?? 'available')
    const name = truckName(t)
    let text = ''
    let dot: ActivityDot = 'green'
    let tag: string | undefined
    // Sale state wins over the editorial state: "sold" is the newer, more
    // useful headline for a truck that is also, still, published.
    if (availability === 'sold') {
      text = 'Marked as sold'
      dot = 'gray'
      tag = 'SOLD'
    } else if (availability === 'pending') {
      text = 'Marked sale pending'
      tag = 'PENDING'
    } else if (status === 'pending-review') {
      text = 'Draft submitted for review'
      tag = 'DRAFT'
    } else if (status === 'published') {
      text = 'Published to inventory'
      tag = 'PUBLISHED'
    }
    activity.push({
      id: `truck-${t.id}`,
      dot,
      text,
      truck: name,
      tag,
      when: String((availability === 'sold' ? t.soldAt : t.publishedAt) ?? t.updatedAt ?? ''),
    })
  }

  activity.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())

  // Bucket the last 7 days into single-day counts (oldest first).
  const DAY_MS = 24 * 60 * 60 * 1000
  const leadsByDay: LeadsDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(chartStart.getTime() + i * DAY_MS)
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      full: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      count: 0,
    }
  })
  for (const lead of chartLeads.docs as Array<{ createdAt?: string }>) {
    if (!lead.createdAt) continue
    const idx = Math.floor((new Date(lead.createdAt).getTime() - chartStart.getTime()) / DAY_MS)
    if (idx >= 0 && idx < 7) leadsByDay[idx].count += 1
  }

  return {
    newLeads: newLeads.totalDocs,
    pendingReview: pendingReview.totalDocs,
    publishedTrucks: publishedTrucks.totalDocs,
    oldestPendingDays,
    publishedThisWeek: publishedThisWeek.totalDocs,
    newLeadsSinceYesterday: newLeadsSinceYesterday.totalDocs,
    activity: activity.slice(0, 12),
    leadsByDay,
  }
}
