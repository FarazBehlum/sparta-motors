import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminFieldLevel } from '../access'
import { SITE_URL } from '../lib/site'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    cookies: {
      // Payload's default is `secure: false`. Without this the admin session
      // cookie is sent over plaintext on any http:// request that hits the
      // origin before nginx redirects — enough for someone on the same network
      // to capture a full admin session.
      //
      // Keyed off the site's own scheme rather than NODE_ENV on purpose. A
      // production build is also served over plain http on the office LAN so
      // staff can enter listings from a phone (see the CORS note in
      // payload.config.ts); a NODE_ENV check would mark the cookie Secure
      // there too and lock them out, because a bare LAN IP is not a secure
      // context. Browsers do treat http://localhost as secure, so that keeps
      // working either way.
      secure: SITE_URL.startsWith('https://'),
      sameSite: 'Lax',
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'role'],
    group: 'Team',
  },
  access: {
    create: isAdmin,
    read: ({ req: { user } }) => {
      // Deny anonymous outright. Falling through returned `{ id: { equals:
      // undefined } }`, which only happened to match zero rows because the
      // driver coerces it to `id = NULL` — and it answered 200 with an empty
      // list where 403 is correct. Don't rely on that coercion.
      if (!user) return false
      if ((user as { role?: string })?.role === 'admin') return true
      // Non-admins can only read their own record
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if ((user as { role?: string })?.role === 'admin') return true
      return { id: { equals: user.id } }
    },
    delete: isAdmin,
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'employee',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Employee', value: 'employee' },
      ],
      access: {
        // Only admins can set or change a role
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
      admin: {
        description: 'Admins can publish trucks and manage everything. Employees create drafts.',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Optional. Internal contact only.',
      },
    },
  ],
}
