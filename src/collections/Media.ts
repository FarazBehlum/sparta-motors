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
    // MP4/WebM only for video — .mov straight off an iPhone does not play in
    // every browser, so the client exports to MP4 first (see the Trucks video
    // field description). `imageSizes` below are skipped for non-images.
    mimeTypes: ['image/*', 'application/pdf', 'video/mp4', 'video/webm'],
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
