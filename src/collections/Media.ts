import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isAdminOrEmployee } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
  },
  access: {
    create: isAdminOrEmployee,
    read: anyone,
    update: isAdmin,
    delete: isAdmin,
  },
  upload: {
    staticDir: process.env.MEDIA_DIR || undefined,
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'hero', width: 1600, height: 1200, position: 'centre' },
    ],
    // `full` size = the original upload, used for the lightbox
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Describe the photo for accessibility and SEO (e.g. "2019 Isuzu NPR-HD front 3/4 view").',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
}
