import { APIError, type CollectionConfig, type PayloadRequest, type Where } from 'payload'
import { anyone, isAdmin, isAdminOrEmployee, isAdminOrEmployeeFieldLevel } from '../access'
import { HEARD_ABOUT_US_OPTIONS } from '../lib/options'
import { sendEmail } from '../lib/email/mailer'
import { newLeadEmail } from '../lib/email/lead-templates'
import { leadsToCsv } from '../lib/leads-csv'
import { enforcePublicSubmitLimit } from '../lib/rate-limit'

/** GET /api/leads/export-csv?status=new&days=7 — staff-only CSV of leads. */
async function exportCsvHandler(req: PayloadRequest): Promise<Response> {
  const role = (req.user as { role?: string } | null)?.role
  if (role !== 'admin' && role !== 'employee') {
    return new Response('Unauthorized', { status: 401 })
  }

  const q = (req.query ?? {}) as { status?: string; days?: string }
  const filters: Where[] = []
  if (q.status) filters.push({ status: { equals: q.status } })
  if (q.days) {
    const days = Number(q.days)
    if (Number.isFinite(days) && days > 0) {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      filters.push({ createdAt: { greater_than: since } })
    }
  }

  const { docs } = await req.payload.find({
    collection: 'leads',
    where: filters.length ? { and: filters } : undefined,
    sort: '-createdAt',
    limit: 5000,
    depth: 1,
    req,
  })

  const csv = leadsToCsv(docs as never[])
  const stamp = new Date().toISOString().slice(0, 10)
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="sparta-leads-${stamp}.csv"`,
    },
  })
}

export const Leads: CollectionConfig = {
  slug: 'leads',
  endpoints: [{ path: '/export-csv', method: 'get', handler: exportCsvHandler }],
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'source', 'status', 'phone', 'receivedAt'],
    group: 'Leads',
    listSearchableFields: ['fullName', 'phone', 'email'],
  },
  access: {
    // Public create happens through the /api/leads route using an override,
    // but allow authenticated staff to create too.
    create: anyone,
    read: isAdminOrEmployee,
    update: isAdminOrEmployee,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'fullName', type: 'text', admin: { width: '50%' } },
        { name: 'phone', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'email', type: 'email' },
    { name: 'message', type: 'textarea' },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'Truck inquiry', value: 'truck-inquiry' },
        { label: 'Financing pre-qual', value: 'financing-prequal' },
        { label: 'General contact', value: 'general-contact' },
      ],
    },
    {
      name: 'truckOfInterest',
      type: 'relationship',
      relationTo: 'trucks',
      admin: { description: 'Auto-populated for truck inquiries.' },
    },
    { name: 'financingInterest', type: 'checkbox', defaultValue: false },
    { name: 'tradeIn', type: 'checkbox', defaultValue: false },
    {
      name: 'tradeInYearMakeModel',
      type: 'text',
      admin: { condition: (data) => Boolean(data?.tradeIn) },
    },
    {
      name: 'tradeInMileage',
      type: 'number',
      admin: { condition: (data) => Boolean(data?.tradeIn) },
    },
    {
      name: 'tradeInCondition',
      type: 'text',
      admin: { condition: (data) => Boolean(data?.tradeIn) },
    },
    { name: 'heardAboutUs', type: 'select', options: HEARD_ABOUT_US_OPTIONS },
    // Spam honeypot — hidden from the admin, stripped before persist (see hook).
    // Present in the schema so it survives to the beforeValidate hook.
    {
      name: 'website',
      type: 'text',
      admin: { hidden: true, disableListColumn: true },
      access: { read: () => false },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Closed — Sold', value: 'closed-sold' },
        { label: 'Closed — Lost', value: 'closed-lost' },
      ],
      // Public submissions must not be able to set an internal pipeline status.
      access: { create: isAdminOrEmployeeFieldLevel },
      admin: { position: 'sidebar' },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: { create: isAdminOrEmployeeFieldLevel },
      admin: { position: 'sidebar' },
    },
    {
      name: 'receivedAt',
      type: 'date',
      access: { create: isAdminOrEmployeeFieldLevel },
      admin: { position: 'sidebar', readOnly: true },
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'contactedAt',
      type: 'date',
      access: { create: isAdminOrEmployeeFieldLevel },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'closedAt',
      type: 'date',
      access: { create: isAdminOrEmployeeFieldLevel },
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ req, operation, data }) => {
        if (operation === 'create') {
          // Honeypot: real users never fill the hidden `website` field; bots do.
          if (!req.user && data?.website) {
            throw new APIError('Submission rejected.', 400, undefined, true)
          }
          // No field is required on public forms except a way to reach the
          // person back — we need at least a phone or an email.
          if (!req.user && !data?.phone?.trim() && !data?.email?.trim()) {
            throw new APIError('Please provide a phone number or an email.', 400, undefined, true)
          }
          enforcePublicSubmitLimit(req, 'leads')
        }
        if (data) delete data.website // never persist the honeypot value
        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        const prev = operation === 'update' ? originalDoc?.status : undefined
        if (data.status === 'contacted' && prev !== 'contacted' && !data.contactedAt) {
          data.contactedAt = new Date().toISOString()
        }
        if (
          (data.status === 'closed-sold' || data.status === 'closed-lost') &&
          prev !== data.status &&
          !data.closedAt
        ) {
          data.closedAt = new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        const notifyTo = process.env.NOTIFICATION_TO || process.env.SMTP_FROM || ''
        if (!notifyTo) return

        let truck = null
        if (doc.truckOfInterest) {
          try {
            truck = await req.payload.findByID({
              collection: 'trucks',
              id:
                typeof doc.truckOfInterest === 'object'
                  ? doc.truckOfInterest.id
                  : doc.truckOfInterest,
              depth: 0,
              req,
            })
          } catch {
            /* best effort */
          }
        }
        const { subject, body, replyTo } = newLeadEmail(doc, truck as never)
        void sendEmail({ to: notifyTo, subject, body, replyTo })
      },
    ],
  },
}
