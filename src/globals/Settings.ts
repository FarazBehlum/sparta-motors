import type { GlobalConfig } from 'payload'
import { anyone, isAdmin } from '../access'

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: { group: 'Content' },
  access: {
    read: anyone,
    update: isAdmin,
  },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'Sparta Motors' },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', admin: { width: '50%' } },
        { name: 'email', type: 'email', admin: { width: '50%' } },
      ],
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'line1', type: 'text' },
        { name: 'line2', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'city', type: 'text', admin: { width: '50%' } },
            { name: 'state', type: 'text', admin: { width: '25%' } },
            { name: 'zip', type: 'text', admin: { width: '25%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'latitude', type: 'number', admin: { width: '50%' } },
            { name: 'longitude', type: 'number', admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'hoursMonFri', type: 'text', admin: { width: '33%' }, defaultValue: '8am – 6pm' },
        { name: 'hoursSat', type: 'text', admin: { width: '33%' }, defaultValue: '9am – 3pm' },
        { name: 'hoursSun', type: 'text', admin: { width: '34%' }, defaultValue: 'Closed' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'socialFacebook', type: 'text', admin: { width: '50%' } },
        { name: 'socialInstagram', type: 'text', admin: { width: '50%' } },
      ],
    },
  ],
}
