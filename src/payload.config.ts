import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Trucks } from './collections/Trucks'
import { Leads } from './collections/Leads'
import { FleetInquiries } from './collections/FleetInquiries'
import { Pages } from './collections/Pages'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Origins allowed to call the API / log in to the admin. The real production
// origin comes from NEXT_PUBLIC_SITE_URL. localhost + the LAN IP are ALSO always
// allowed so the admin works when a production build is served locally (e.g.
// entering listings from a phone over the office WiFi). This is safe on a real
// public deploy: a private IP / localhost can't be the origin of a cross-site
// request against the live domain. Set ALLOWED_ORIGINS (comma-separated) to add
// more without a code change — e.g. if this Mac's LAN IP changes.
const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '')
const localOrigins = ['http://localhost:3000', 'http://192.168.12.30:3000']
const extraOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean)
const allowedOrigins = [
  ...new Set([...(siteOrigin ? [siteOrigin] : []), ...localOrigins, ...extraOrigins]),
]

export default buildConfig({
  admin: {
    user: Users.slug,
    // Lock the admin to the light theme (no dark/auto toggle).
    theme: 'light',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '· Sparta Motors',
    },
    components: {
      beforeNavLinks: [
        '/components/admin/AdminBrand#default',
        '/components/admin/NavUser#default',
        '/components/admin/AdminNavLinks#default',
      ],
      views: {
        dashboard: {
          Component: '/components/admin/Dashboard#default',
        },
        draftReview: {
          Component: '/components/admin/DraftReview#default',
          path: '/draft-review',
        },
      },
    },
  },
  // Order drives the admin nav group order (grouped by first appearance):
  // Inventory → Leads → Content → Team. The Inventory group itself is rendered
  // by the custom AdminNavLinks sidebar and hidden from the auto-nav via CSS.
  collections: [Trucks, Leads, FleetInquiries, Media, Pages, Users],
  globals: [Settings],
  cors: allowedOrigins,
  csrf: allowedOrigins,
  // Cap uploads at 64MB. Photos never come close; the limit exists to stop a
  // raw, untranscoded phone video (often 200MB+) from being uploaded and then
  // served at full size to every visitor on mobile data.
  upload: {
    limits: { fileSize: 64 * 1024 * 1024 },
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
