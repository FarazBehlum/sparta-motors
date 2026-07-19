import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminFieldLevel } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'role'],
    group: 'Team',
  },
  access: {
    create: isAdmin,
    read: ({ req: { user } }) => {
      if ((user as { role?: string })?.role === 'admin') return true
      // Non-admins can only read their own record
      return { id: { equals: user?.id } }
    },
    update: ({ req: { user } }) => {
      if ((user as { role?: string })?.role === 'admin') return true
      return { id: { equals: user?.id } }
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
