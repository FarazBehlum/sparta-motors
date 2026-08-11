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
  // Payload's own public address. Used for absolute URLs, and sanitize.ts also
  // appends it to `csrf` below.
  //
  // ⚠️ THE ADMIN CANNOT BE USED OVER PLAIN http:// ON A NON-LOCALHOST HOST.
  // This is a property of browsers, not a bug to fix here, and it cost a long
  // debugging session — so: the site MUST be on https before anyone tries to
  // log in to /admin from anything other than localhost.
  //
  // Why. node_modules/payload/dist/auth/extractJWT.js accepts a session cookie
  // when the request's `Origin` is in `csrf`, OR when `csrf` is empty, OR when
  // `Sec-Fetch-Site` is same-origin/same-site/none. A browser sends no Origin on
  // a same-origin GET — every admin page load and every "who am I?" call — so
  // everything rests on Sec-Fetch-Site. Browsers only send `Sec-Fetch-*` headers
  // in a SECURE CONTEXT: https, or http://localhost. Over http:// to a bare IP
  // or a LAN address they are omitted entirely, Payload finds nothing it can
  // trust, and the cookie is discarded.
  //
  // The symptom is badly misleading: login answers "Authentication Passed",
  // writes a real users_sessions row and sets a valid cookie, and then every
  // subsequent request is anonymous, so the admin returns to the login screen
  // with no error shown. It looks exactly like a wrong password.
  //
  // Measured on the server against one token, varying a single header:
  //     no Origin, no Sec-Fetch-Site        -> {"user":null}
  //     Origin: <this site>                 -> authenticated
  //     Sec-Fetch-Site: same-origin         -> authenticated
  //     Sec-Fetch-Site: cross-site          -> {"user":null}
  //
  // The LAN-over-http note above therefore no longer holds for the admin:
  // listing the LAN origin in `csrf` does not help, because the failing requests
  // carry no origin at all. Staff on the office network must use the https
  // domain.
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || siteOrigin || '',
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
