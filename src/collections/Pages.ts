import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '../access'
import { pageBlocks } from '../blocks'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
    group: 'Content',
  },
  access: {
    create: isAdmin,
    read: anyone,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'slug',
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'Home', value: 'home' },
        { label: 'About', value: 'about' },
        { label: 'Financing', value: 'financing' },
        { label: 'Fleet', value: 'fleet' },
        { label: 'Contact', value: 'contact' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'title', type: 'text', required: true },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: { description: 'For SEO. ~150-160 characters.' },
    },
    {
      type: 'collapsible',
      label: 'Hero',
      fields: [
        {
          name: 'heroLabel',
          type: 'text',
          admin: { description: 'Small label above the title, e.g. "ABOUT SPARTA MOTORS".' },
        },
        {
          name: 'heroTitle',
          type: 'textarea',
          admin: { description: 'Big display title. Line breaks are respected.' },
        },
        { name: 'heroSubtitle', type: 'textarea' },
      ],
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: pageBlocks,
    },
  ],
}
