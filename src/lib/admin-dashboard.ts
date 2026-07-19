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

export interface DashboardData {
  newLeads: number
  pendingReview: number
  publishedTrucks: number
  fleetThisWeek: number
  oldestPendingDays: number | null
  publishedThisWeek: number
  newLeadsSinceYesterday: number
  fleetTotal: number
  activity: ActivityItem[]
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

  const [
    newLeads,
    pendingReview,
    publishedTrucks,
    fleetThisWeek,
    fleetTotal,
    publishedThisWeek,
    newLeadsSinceYesterday,
    oldestPending,
    recentLeads,
    recentTrucks,
  ] = await Promise.all([
    payload.count({ collection: 'leads', where: { status: { equals: 'new' } }, req }),
    payload.count({ collection: 'trucks', where: { status: { equals: 'pending-review' } }, req }),
    payload.count({ collection: 'trucks', where: { status: { equals: 'published' } }, req }),
    payload.count({
      collection: 'fleet-inquiries',
      where: { createdAt: { greater_than: weekAgo } },
      req,
    }),
    payload.count({ collection: 'fleet-inquiries', req }),
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
      where: { status: { in: ['pending-review', 'published', 'sold'] } },
      sort: '-updatedAt',
      limit: 8,
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
    const name = truckName(t)
    let text = ''
    let dot: ActivityDot = 'green'
    let tag: string | undefined
    if (status === 'pending-review') {
      text = 'Draft submitted for review'
      tag = 'DRAFT'
    } else if (status === 'published') {
      text = 'Published to inventory'
      tag = 'PUBLISHED'
    } else if (status === 'sold') {
      text = 'Marked as sold'
      dot = 'gray'
      tag = 'SOLD'
    }
    activity.push({
      id: `truck-${t.id}`,
      dot,
      text,
      truck: name,
      tag,
      when: String((status === 'sold' ? t.soldAt : t.publishedAt) ?? t.updatedAt ?? ''),
    })
  }

  activity.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())

  return {
    newLeads: newLeads.totalDocs,
    pendingReview: pendingReview.totalDocs,
    publishedTrucks: publishedTrucks.totalDocs,
    fleetThisWeek: fleetThisWeek.totalDocs,
    oldestPendingDays,
    publishedThisWeek: publishedThisWeek.totalDocs,
    newLeadsSinceYesterday: newLeadsSinceYesterday.totalDocs,
    fleetTotal: fleetTotal.totalDocs,
    activity: activity.slice(0, 12),
  }
}
