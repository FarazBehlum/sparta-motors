import { APIError, type CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEmployee, isAdminOrEmployeeFieldLevel } from '../access'
import { HEARD_ABOUT_US_OPTIONS } from '../lib/options'
import { sendEmail } from '../lib/email/mailer'
import { newFleetInquiryEmail } from '../lib/email/lead-templates'
import { enforcePublicSubmitLimit } from '../lib/rate-limit'

export const FleetInquiries: CollectionConfig = {
  slug: 'fleet-inquiries',
  admin: {
    useAsTitle: 'companyName',
    defaultColumns: ['companyName', 'contactName', 'status', 'fleetSize', 'receivedAt'],
    group: 'Leads',
    listSearchableFields: ['companyName', 'contactName', 'email', 'phone'],
  },
  access: {
    // The Fleet feature was retired: /fleet 301s to /parts, there is no public
    // fleet form anywhere on the site, and this collection is hidden from the
    // admin nav. `create: anyone` therefore left an anonymous write endpoint at
    // POST /api/fleet-inquiries that nothing legitimate calls and that fires a
    // notification email per request — spam surface with no business purpose.
    // If Phase 3 revives the B2B form, change this back to `anyone`.
    create: isAdminOrEmployee,
    read: isAdminOrEmployee,
    update: isAdminOrEmployee,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'companyName', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'contactName', type: 'text', required: true, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'fleetSize',
          type: 'select',
          required: true,
          options: [
            { label: '1–3', value: '1-3' },
            { label: '4–10', value: '4-10' },
            { label: '10+', value: '10-plus' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'timeline',
          type: 'select',
          required: true,
          options: [
            { label: 'ASAP', value: 'asap' },
            { label: '1–3 months', value: '1-3-months' },
            { label: '3–6 months', value: '3-6-months' },
            { label: 'Ongoing', value: 'ongoing' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'trucksNeeded', type: 'textarea', required: true },
    { name: 'heardAboutUs', type: 'select', options: HEARD_ABOUT_US_OPTIONS },
    // Spam honeypot — hidden, stripped before persist (see hook).
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
        { label: 'Sourcing', value: 'sourcing' },
        { label: 'Presented', value: 'presented' },
        { label: 'Closed — Sold', value: 'closed-sold' },
        { label: 'Closed — Lost', value: 'closed-lost' },
      ],
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
  ],
  hooks: {
    beforeValidate: [
      ({ req, operation, data }) => {
        if (operation === 'create') {
          if (!req.user && data?.website) {
            throw new APIError('Submission rejected.', 400, undefined, true)
          }
          enforcePublicSubmitLimit(req, 'fleet-inquiries')
        }
        if (data) delete data.website
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        if (operation !== 'create') return
        const notifyTo = process.env.NOTIFICATION_TO || process.env.SMTP_FROM || ''
        if (!notifyTo) return
        const { subject, body, replyTo } = newFleetInquiryEmail(doc)
        void sendEmail({ to: notifyTo, subject, body, replyTo })
      },
    ],
  },
}
