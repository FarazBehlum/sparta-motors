import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// If media is served from an absolute production origin (same domain in Phase 1),
// whitelist it for next/image so photos don't throw. Relative same-origin URLs
// are already covered by `localPatterns` below.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
const remoteImagePatterns = (() => {
  if (!siteUrl) return []
  try {
    const u = new URL(siteUrl)
    return [
      {
        protocol: u.protocol.replace(':', '') as 'http' | 'https',
        hostname: u.hostname,
        pathname: '/api/media/**',
      },
    ]
  } catch {
    return []
  }
})()

const nextConfig: NextConfig = {
  trailingSlash: false,
  // The Fleet feature was retired and replaced by Parts. Permanently redirect the
  // old URL so existing links / search results land on the new page.
  async redirects() {
    return [{ source: '/fleet', destination: '/parts', statusCode: 301 }]
  },
  // Allow loading the dev server from other devices on the LAN (e.g. a phone at
  // http://192.168.12.30:3000). Without this, Next 16 blocks its /_next/* dev
  // assets for non-localhost origins, breaking client-side JS (hero, map, admin).
  allowedDevOrigins: ['192.168.12.30'],
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    remotePatterns: remoteImagePatterns,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
