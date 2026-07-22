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

// Origins allowed to call the API / log in to the admin. The production origin
// comes from NEXT_PUBLIC_SITE_URL; localhost + the LAN IP are added only outside
// production so the admin keeps working on the real domain (was hardcoded).
const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '')
const devOrigins =
  process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:3000', 'http://192.168.12.30:3000']
const allowedOrigins = [...(siteOrigin ? [siteOrigin] : []), ...devOrigins]

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
