import type { MetadataRoute } from 'next'
import { SITE_URL as siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // /api/media/file/* must stay crawlable: every truck photo is served from
      // there, and those exact URLs appear in each listing's OpenGraph image and
      // in its Product JSON-LD `image` array. Blanket-disallowing /api told
      // Google it may not fetch them, which costs the product rich result and
      // keeps the whole inventory out of Google Images. The longer, more
      // specific Allow wins over the Disallow in Google's matcher.
      allow: ['/', '/api/media/file/'],
      disallow: ['/admin', '/api'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
