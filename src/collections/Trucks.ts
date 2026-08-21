import { revalidatePath } from 'next/cache'
import { APIError, type CollectionConfig, type PayloadRequest, type Where } from 'payload'
import { isAdmin, isAdminOrEmployee, isAdminOrEmployeeFieldLevel } from '../access'
import { isValidVin, normalizeVin } from '../lib/vin'
import { makeLabel } from '../lib/format'
import { truckSlug } from '../lib/slug'
import { parseVideoUrl } from '../lib/video'
import { sendEmail } from '../lib/email/mailer'
import {
  draftPublishedEmail,
  draftSentBackEmail,
  draftSubmittedEmail,
} from '../lib/email/templates'

const MAKE_OPTIONS = [
  'Isuzu',
  'Hino',
  'Freightliner',
  'Nissan',
  'Volvo',
  'Peterbilt',
  'Kenworth',
  'Mack',
  'International',
  'Other',
].map((m) => ({ label: m, value: m.toLowerCase() }))

const BODY_TYPE_OPTIONS = [
  { label: 'Box Truck', value: 'box-truck' },
  { label: 'Reefer', value: 'reefer' },
  { label: 'Landscaper', value: 'landscaper' },
  { label: '26ft Box Truck', value: '26ft-box-truck' },
  { label: 'Dump Truck', value: 'dump-truck' },
  { label: 'Tow Truck', value: 'tow-truck' },
  { label: 'Tank Truck', value: 'tank-truck' },
  { label: 'Garbage Truck', value: 'garbage-truck' },
  { label: 'Specialty Truck', value: 'specialty-truck' },
]

async function nextStockNumber(req: PayloadRequest): Promise<string> {
  // Single scan for the true max stock number (stock numbers can have gaps, and
  // the newest row isn't always the highest). At Phase-1 volume (~20 trucks)
  // this is trivial. Two admins creating trucks in the same instant could in
  // theory collide — acceptable here since stockNumber isn't a unique key and
  // the slug (which carries the VIN, or the stock number when there's no VIN) is
  // what disambiguates listings.
  const { docs } = await req.payload.find({
    collection: 'trucks',
    limit: 0,
    depth: 0,
    pagination: false,
    req,
  })
  let max = 1000
  for (const d of docs) {
    const n = parseInt(String((d as { stockNumber?: string }).stockNumber ?? '').replace('SM-', ''), 10)
    if (!Number.isNaN(n) && n > max) max = n
  }
  return `SM-${max + 1}`
}

/**
 * Refresh the statically-cached pages that show truck data after any create /
 * update / delete, so the home "on the lot" count + featured grid, the sitemap,
 * and the truck's own detail page reflect changes without waiting for a rebuild.
 * (/inventory and category pages are dynamic, so they're always fresh.)
 * revalidatePath throws outside a Next request (seed/CLI) — safe to ignore there.
 */
function revalidateTruckPaths(slug?: string | null, prevSlug?: string | null) {
  try {
    revalidatePath('/')
    revalidatePath('/sitemap.xml')
    if (slug) revalidatePath(`/trucks/${slug}`)
    if (prevSlug && prevSlug !== slug) revalidatePath(`/trucks/${prevSlug}`)
  } catch {
    /* not in a request scope (e.g. a CLI script) — nothing to revalidate */
  }
}

export const Trucks: CollectionConfig = {
  slug: 'trucks',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'stockNumber', 'status', 'availability', 'price', 'mileage'],
    group: 'Inventory',
    listSearchableFields: ['model', 'vin', 'stockNumber'],
  },
  access: {
    create: isAdminOrEmployee,
    read: ({ req: { user } }) => {
      const u = user as { role?: string; id?: string | number } | null
      if (u?.role === 'admin') return true
      if (u?.role === 'employee') {
        // Employees see all published trucks + their own drafts/pending
        const where: Where = {
          or: [
            { status: { equals: 'published' } },
            { assignedEmployee: { equals: u.id } },
          ],
        }
        return where
      }
      // Public API: only published
      const publishedOnly: Where = { status: { equals: 'published' } }
      return publishedOnly
    },
    update: ({ req: { user } }) => {
      const u = user as { role?: string; id?: string | number } | null
      if (u?.role === 'admin') return true
      if (u?.role === 'employee') {
        // Employees can only edit their own draft/pending-review trucks
        const where: Where = {
          and: [
            { assignedEmployee: { equals: u.id } },
            { status: { in: ['draft', 'pending-review'] } },
          ],
        }
        return where
      }
      return false
    },
    delete: isAdmin,
  },
  fields: [
    // Virtual title for admin list/useAsTitle
    {
      name: 'title',
      type: 'text',
      admin: { hidden: true },
      hooks: {
        beforeChange: [({ siblingData }) => {
          delete siblingData.title
        }],
        afterRead: [({ data }) => {
          if (!data) return ''
          if (typeof data.listingTitle === 'string' && data.listingTitle.trim()) {
            return data.listingTitle.trim()
          }
          return [data.year, data.make ? makeLabel(data.make) : '', data.model, data.trim]
            .filter(Boolean)
            .join(' ')
        }],
      },
    },
    // Invisible helper: sets the edit-view header to "Add a New Truck" on the
    // create page (where the composed title is empty and Payload shows
    // "[Untitled]"). Renders nothing. See TruckTitleField.
    {
      name: 'titleHeader',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/TruckTitleField#default',
        },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basic Info',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'year', type: 'number', required: true, admin: { width: '33%' } },
                {
                  name: 'make',
                  type: 'select',
                  required: true,
                  options: MAKE_OPTIONS,
                  admin: { width: '33%' },
                },
                { name: 'model', type: 'text', required: true, admin: { width: '34%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'trim',
                  type: 'text',
                  admin: { width: '50%', description: 'e.g. "16FT Box"' },
                },
                {
                  name: 'bodyType',
                  type: 'select',
                  required: true,
                  options: BODY_TYPE_OPTIONS,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'listingTitle',
              type: 'text',
              label: 'Listing title',
              admin: {
                description:
                  'Optional. Custom headline for this listing (shown on the card and detail page). Leave blank to use "{year} {make} {model} {trim}".',
              },
            },
            {
              name: 'vin',
              type: 'text',
              unique: true,
              admin: {
                description: 'Optional. If provided, must be 17 characters — validated on save.',
                components: {},
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  required: true,
                  admin: { width: '50%', description: 'Whole US dollars' },
                },
                {
                  name: 'condition',
                  type: 'select',
                  // Internal reference only — no longer shown on the public site.
                  // Field-level read keeps it out of the anonymous REST response
                  // too; without it "internal only" was still public JSON.
                  access: { read: isAdminOrEmployeeFieldLevel },
                  options: [
                    { label: 'Excellent', value: 'excellent' },
                    { label: 'Good', value: 'good' },
                    { label: 'Fair', value: 'fair' },
                  ],
                  admin: { width: '50%', description: 'Internal only — not shown on the site.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'titleStatus',
                  type: 'select',
                  options: [
                    { label: 'Clean', value: 'clean' },
                    { label: 'Rebuilt', value: 'rebuilt' },
                    { label: 'Salvage', value: 'salvage' },
                    { label: 'Lien / loan', value: 'lien' },
                  ],
                  admin: { width: '50%', description: 'Shown on the listing to build buyer trust.' },
                },
                {
                  name: 'owners',
                  type: 'number',
                  min: 0,
                  admin: { width: '50%', description: 'Number of previous owners. Leave blank if unknown.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Key Specs',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'mileage', type: 'number', required: true, admin: { width: '50%' } },
                {
                  name: 'fuelType',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Diesel', value: 'diesel' },
                    { label: 'Gasoline', value: 'gasoline' },
                  ],
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'gvwr',
                  type: 'number',
                  admin: { width: '50%', description: 'Gross vehicle weight rating (lb)' },
                },
                {
                  name: 'payloadClass',
                  type: 'select',
                  options: ['class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8'].map(
                    (c) => ({ label: c.replace('-', ' ').toUpperCase(), value: c }),
                  ),
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Mechanical',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'engine',
                  type: 'text',
                  admin: { width: '50%', description: 'e.g. "5.2L Diesel I4"' },
                },
                {
                  name: 'transmission',
                  type: 'text',
                  admin: { width: '50%', description: 'e.g. "Auto · 6-spd"' },
                },
              ],
            },
            {
              name: 'drivetrain',
              type: 'select',
              options: [
                { label: 'RWD', value: 'RWD' },
                { label: '4WD', value: '4WD' },
                { label: 'AWD', value: 'AWD' },
              ],
            },
          ],
        },
        {
          label: 'Inspection',
          fields: [
            {
              name: 'inspection',
              type: 'group',
              label: 'Inspection & condition',
              admin: {
                description:
                  'Shown as an inspection block on the listing. Only filled-in items appear — leave blank what you did not check.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'inspectedDate',
                      type: 'date',
                      admin: { width: '50%', description: 'When it was inspected' },
                    },
                    {
                      name: 'inspectedBy',
                      type: 'text',
                      admin: { width: '50%', description: 'Technician or shop name' },
                    },
                  ],
                },
                {
                  name: 'summary',
                  type: 'textarea',
                  admin: { description: 'Overall condition summary (optional).' },
                },
                {
                  name: 'points',
                  type: 'array',
                  labels: { singular: 'Inspection point', plural: 'Inspection points' },
                  admin: {
                    description:
                      'One row per system you checked. The rating sets the color shown on the listing.',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'area',
                          type: 'select',
                          required: true,
                          options: [
                            { label: 'Engine', value: 'engine' },
                            { label: 'Transmission', value: 'transmission' },
                            { label: 'Brakes', value: 'brakes' },
                            { label: 'Tires', value: 'tires' },
                            { label: 'Suspension', value: 'suspension' },
                            { label: 'Electrical', value: 'electrical' },
                            { label: 'Frame & rust', value: 'frame' },
                            { label: 'Emissions (DPF/DEF)', value: 'emissions' },
                            { label: 'Interior / cab', value: 'interior' },
                            { label: 'Body / exterior', value: 'body' },
                          ],
                          admin: { width: '40%' },
                        },
                        {
                          name: 'rating',
                          type: 'select',
                          required: true,
                          options: [
                            { label: 'Good', value: 'good' },
                            { label: 'Fair', value: 'fair' },
                            { label: 'Needs attention', value: 'attention' },
                          ],
                          admin: { width: '30%' },
                        },
                        {
                          name: 'note',
                          type: 'text',
                          admin: { width: '30%', description: 'Optional detail' },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Photos & Video',
          fields: [
            {
              name: 'photos',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: {
                description:
                  'Upload or select multiple photos at once (drag several files straight in). Drag to reorder — the first photo is the main one. At least one required to publish.',
              },
            },
            {
              name: 'videoUrl',
              type: 'text',
              label: 'Walkaround video — YouTube or Vimeo link',
              admin: {
                description:
                  'Paste a YouTube or Vimeo link. Preferred: it plays fast on phones and uses no site storage. If this is filled in it is used instead of an uploaded file.',
              },
              validate: (value: string | null | undefined) => {
                if (!value) return true
                return parseVideoUrl(value)
                  ? true
                  : 'Not a YouTube or Vimeo link. Example: https://youtu.be/dQw4w9WgXcQ'
              },
            },
            {
              name: 'videoFile',
              type: 'upload',
              relationTo: 'media',
              label: 'Or upload a video file',
              filterOptions: { mimeType: { in: ['video/mp4', 'video/webm'] } },
              admin: {
                description:
                  'MP4 or WebM, 64MB max. Use only when a link is not practical — uploaded video is served exactly as-is, so keep clips short and compress before uploading.',
              },
            },
            {
              name: 'specSheet',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Optional PDF spec sheet' },
            },
          ],
        },
        {
          label: 'Description',
          fields: [
            {
              name: 'description',
              type: 'textarea',
              required: true,
              admin: {
                description: 'Customer-facing narrative. Short sentences, specs before adjectives.',
              },
            },
          ],
        },
      ],
    },
    // Sidebar / status fields
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Pending Review', value: 'pending-review' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      access: {
        // Employees may move draft <-> pending-review only (enforced in hook too);
        // full control belongs to admin. Field stays visible so employees see state.
        update: ({ req: { user } }) => {
          const role = (user as { role?: string })?.role
          return role === 'admin' || role === 'employee'
        },
      },
      admin: {
        position: 'sidebar',
        description:
          'Whether this listing is live on the website. To mark a truck sold, use Availability below — not this field.',
      },
    },
    {
      // Sale state, kept separate from the editorial `status` above: `status`
      // controls whether the listing exists publicly at all, this controls what
      // a shopper is told about it.
      name: 'availability',
      type: 'select',
      required: true,
      defaultValue: 'available',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Sale Pending', value: 'pending' },
        { label: 'Sold', value: 'sold' },
      ],
      access: {
        update: ({ req: { user } }) => {
          const role = (user as { role?: string })?.role
          return role === 'admin' || role === 'employee'
        },
      },
      admin: {
        position: 'sidebar',
        description:
          'Sold trucks stay in inventory marked SOLD for 7 days, then come off the public site automatically — the listing stays here and old links redirect to inventory. Sale Pending stays listed and keeps taking inquiries.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Featured trucks show in the home Featured Inventory section, sort first in the inventory (default order), and get a “Featured” badge on their card.',
      },
    },
    {
      name: 'reviewNote',
      type: 'textarea',
      access: {
        update: ({ req: { user } }) => (user as { role?: string })?.role === 'admin',
        // "Not shown publicly" has to be enforced, not just intended — this was
        // being served to anyone who called GET /api/trucks.
        read: isAdminOrEmployeeFieldLevel,
      },
      admin: {
        position: 'sidebar',
        description: 'Note to the employee when sending a draft back. Not shown publicly.',
        condition: (data) => data?.status === 'draft' || data?.status === 'pending-review',
      },
    },
    {
      name: 'stockNumber',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'slug',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
      index: true,
    },
    {
      name: 'assignedEmployee',
      type: 'relationship',
      relationTo: 'users',
      // Which staff member owns a listing is internal; it has no public use and
      // exposed a users-table id to anonymous API callers.
      access: { read: isAdminOrEmployeeFieldLevel },
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar', readOnly: true } },
    {
      name: 'soldAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Stamped automatically when marked Sold. The listing leaves the public site 7 days after this date.',
        condition: (data) => data?.availability === 'sold',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // VIN is optional. Normalize when provided; store NULL (not '') when blank
        // so the unique index allows any number of VIN-less trucks.
        if (data && typeof data.vin === 'string') {
          const v = normalizeVin(data.vin)
          data.vin = v.length ? v : null
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // VIN format validation
        if (data.vin && !isValidVin(data.vin)) {
          throw new APIError(
            'VIN must be 17 characters, letters and numbers only (no I, O, or Q).',
            400,
            undefined,
            true,
          )
        }

        if (operation === 'create') {
          if (req.user) data.assignedEmployee = data.assignedEmployee || req.user.id
          if (!data.stockNumber) data.stockNumber = await nextStockNumber(req)
          if (!data.slug && data.year && data.make && data.model) {
            data.slug = truckSlug({
              year: data.year,
              make: data.make,
              model: data.model,
              vin: data.vin,
              stockNumber: data.stockNumber,
            })
          }
        }

        // Photo requirement enforced at publish time
        const newStatus = data.status
        const prevStatus = originalDoc?.status
        if (newStatus === 'published') {
          const photoCount = Array.isArray(data.photos) ? data.photos.length : 0
          if (photoCount < 1) {
            throw new APIError(
              'A truck must have at least one photo before it can be published. Add a photo on the Photos tab, then publish.',
              400,
              undefined,
              true,
            )
          }
          if (prevStatus !== 'published') data.publishedAt = new Date().toISOString()
        }
        if (data.availability === 'sold' && originalDoc?.availability !== 'sold') {
          data.soldAt = new Date().toISOString()
        } else if (
          data.availability &&
          data.availability !== 'sold' &&
          originalDoc?.availability === 'sold'
        ) {
          // Un-sold — the sale fell through, or it's being relisted. Drop the
          // timestamp so the record doesn't carry a sale date it no longer has,
          // and so a later sale starts a clean grace window.
          data.soldAt = null
        }
        return data
      },
    ],
    afterChange: [
      ({ doc, previousDoc }) => {
        revalidateTruckPaths(doc.slug, previousDoc?.slug)
      },
      async ({ doc, previousDoc, req, operation }) => {
        const prev = operation === 'update' ? previousDoc?.status : undefined
        const now = doc.status
        if (prev === now) return

        const notifyTo = process.env.NOTIFICATION_TO || process.env.SMTP_FROM || ''

        // Draft submitted for review -> notify admin
        if (prev === 'draft' && now === 'pending-review' && notifyTo) {
          let employee = { firstName: '', lastName: '' }
          try {
            const emp = await req.payload.findByID({
              collection: 'users',
              id:
                typeof doc.assignedEmployee === 'object'
                  ? doc.assignedEmployee?.id
                  : doc.assignedEmployee,
              depth: 0,
              req,
            })
            employee = { firstName: emp.firstName as string, lastName: emp.lastName as string }
          } catch {
            /* best effort */
          }
          const { subject, body } = draftSubmittedEmail(doc, employee)
          void sendEmail({ to: notifyTo, subject, body })
        }

        // Published -> notify assigned employee
        if (prev === 'pending-review' && now === 'published') {
          const empEmail = await resolveEmployeeEmail(req, doc.assignedEmployee)
          if (empEmail) {
            const { subject, body } = draftPublishedEmail(doc)
            void sendEmail({ to: empEmail, subject, body })
          }
        }

        // Sent back -> notify assigned employee
        if (prev === 'pending-review' && now === 'draft' && doc.reviewNote) {
          const empEmail = await resolveEmployeeEmail(req, doc.assignedEmployee)
          if (empEmail) {
            const { subject, body } = draftSentBackEmail(doc, doc.reviewNote)
            void sendEmail({ to: empEmail, subject, body })
          }
        }
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidateTruckPaths(doc.slug)
      },
    ],
  },
}

async function resolveEmployeeEmail(
  req: PayloadRequest,
  assignedEmployee: unknown,
): Promise<string | null> {
  try {
    if (assignedEmployee && typeof assignedEmployee === 'object') {
      return (assignedEmployee as { email?: string }).email ?? null
    }
    if (assignedEmployee) {
      const emp = await req.payload.findByID({
        collection: 'users',
        id: assignedEmployee as string | number,
        depth: 0,
        req,
      })
      return (emp.email as string) ?? null
    }
  } catch {
    /* best effort */
  }
  return null
}
