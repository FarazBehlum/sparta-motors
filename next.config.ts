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
  //
  // Day Cabs / Flat Beds were likewise replaced by Landscapers / 26ft Box Trucks.
  // These slugs were live and are in the sitemap, so send them on rather than 404.
  async redirects() {
    return [
      { source: '/fleet', destination: '/parts', statusCode: 301 },
      { source: '/inventory/day-cabs', destination: '/inventory/landscapers', statusCode: 301 },
      {
        source: '/inventory/flat-beds',
        destination: '/inventory/26ft-box-trucks',
        statusCode: 301,
      },

      // ---- Legacy WordPress/WooCommerce URLs ------------------------------
      //
      // This site replaces a live WordPress + WooCommerce site on the SAME
      // domain. Its 37 indexed URLs (taken from
      // https://sparta-motors.com/wp-sitemap.xml) use a completely different
      // scheme — /shop/, /product/<slug>/, /product-category/<make>/ — and
      // every one of them would 404 the moment DNS moves, throwing away the
      // domain's accumulated ranking and dead-ending anyone arriving from a
      // Google result or a bookmark.
      //
      // 03-sitemap-routing.md proposed putting these in Cloudflare page rules.
      // They live here instead: the free Cloudflare plan allows only three page
      // rules, these are pattern-based rather than one-to-one, and in the repo
      // they are version-controlled and testable. Nothing stops moving them to
      // the edge later.
      //
      // Every old path carried a trailing slash. `trailingSlash: false` strips
      // it with a 308 first, so these sources are written without one.

      // Storefront and account
      { source: '/shop', destination: '/inventory', statusCode: 301 },
      { source: '/my-account', destination: '/contact', statusCode: 301 },

      // WooCommerce make categories -> the make filter
      { source: '/product-category/isuzu', destination: '/inventory?make=isuzu', statusCode: 301 },
      { source: '/product-category/hino', destination: '/inventory?make=hino', statusCode: 301 },
      {
        source: '/product-category/freightliner',
        destination: '/inventory?make=freightliner',
        statusCode: 301,
      },
      {
        source: '/product-category/international',
        destination: '/inventory?make=international',
        statusCode: 301,
      },
      {
        source: '/product-category/nissan',
        destination: '/inventory?make=nissan',
        statusCode: 301,
      },
      { source: '/make/isuzu', destination: '/inventory?make=isuzu', statusCode: 301 },
      {
        source: '/make/international',
        destination: '/inventory?make=international',
        statusCode: 301,
      },

      // Body-style archives -> the matching category page.
      // "town-truck" is the old site's typo for tow truck; it is indexed, so it
      // gets a redirect rather than a correction.
      {
        source: '/styles/26ft-box-truck',
        destination: '/inventory/26ft-box-trucks',
        statusCode: 301,
      },
      { source: '/styles/dump-truck', destination: '/inventory/dump-trucks', statusCode: 301 },
      { source: '/styles/town-truck', destination: '/inventory/tow-trucks', statusCode: 301 },

      // Attribute archives -> the equivalent filter. Note the old site's "gas"
      // is "gasoline" in this data model.
      { source: '/fuel-type/diesel', destination: '/inventory?fuel=diesel', statusCode: 301 },
      { source: '/fuel-type/gas', destination: '/inventory?fuel=gasoline', statusCode: 301 },
      {
        source: '/years/2020-2025',
        destination: '/inventory?year_min=2020&year_max=2025',
        statusCode: 301,
      },
      // No title-status or mileage-band filter exists publicly — send to the
      // full list rather than invent a filter that does nothing.
      { source: '/title/:status', destination: '/inventory', statusCode: 301 },
      { source: '/miles/:band', destination: '/inventory', statusCode: 301 },

      // Individual truck listings. The old stock is gone, so these cannot map
      // one-to-one; each goes to the category page for its body type, which is
      // both the closest match for a shopper and a live page for Google. Body
      // type is read off the old slug.
      {
        source: '/product/2000-nissan-ud2300-tow-truck-platform-118k-miles-5338',
        destination: '/inventory/tow-trucks',
        statusCode: 301,
      },
      {
        source: '/product/2009-isuzu-fxr-12ft-dump-truck-163k-miles-0216',
        destination: '/inventory/dump-trucks',
        statusCode: 301,
      },
      {
        source: '/product/2018-hino-195-12ft-dump-truck-non-cdl-52k-miles-8240',
        destination: '/inventory/dump-trucks',
        statusCode: 301,
      },
      {
        source: '/product/2022-isuzu-nrr-12ft-dump-truck-0682',
        destination: '/inventory/dump-trucks',
        statusCode: 301,
      },
      {
        source: '/product/2015-isuzu-npr-16ft-box-truck-153k-miles-4787',
        destination: '/inventory/box-trucks',
        statusCode: 301,
      },
      {
        source: '/product/2016-isuzu-npr-18ft-box-truck-w-liftgate-150k-miles-3538',
        destination: '/inventory/box-trucks',
        statusCode: 301,
      },
      {
        source: '/product/2016-isuzu-nrr-22ft-box-truck-w-liftgate-1670',
        destination: '/inventory/box-trucks',
        statusCode: 301,
      },
      {
        source: '/product/2023-international-mv607-26ft-box-truck-w-liftgate-8563',
        destination: '/inventory/26ft-box-trucks',
        statusCode: 301,
      },
      {
        source: '/product/2020-hino-16ft-reefer-van-wliftgate-8641',
        destination: '/inventory/reefers',
        statusCode: 301,
      },
      {
        source: '/product/2021-isuzu-nrr-16fr-reefer-van-w-liftgate-150k-miles-0181',
        destination: '/inventory/reefers',
        statusCode: 301,
      },
      // Catch-all for the remaining listings and anything added to the old site
      // between now and cutover. Must stay LAST — Next matches in order.
      { source: '/product/:slug', destination: '/inventory', statusCode: 301 },

      // Default WordPress content that was indexed but has no counterpart.
      { source: '/hello-world', destination: '/', statusCode: 301 },
      { source: '/category/:slug', destination: '/', statusCode: 301 },
      { source: '/author/:slug', destination: '/', statusCode: 301 },
    ]
  },
  // Baseline security headers. The site and /admin share an origin, so
  // clickjacking protection here also covers the admin panel. A full CSP is
  // deliberately not attempted in Phase 1: Payload's admin needs
  // 'unsafe-inline' and 'unsafe-eval', which would water it down to little
  // more than these four give already.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // HSTS closes the window where a first plaintext request could leak
          // the admin session cookie.
          //
          // Deliberately conservative, because this launches onto a domain that
          // is already in use. `includeSubDomains` is OMITTED: sparta-motors.com
          // has live subdomains outside this deployment (ftp. on a different
          // host, autodiscover. on Hostinger mail), and asserting HTTPS for all
          // of them would break anything among them still served over http — in
          // every browser that had already loaded the apex, for the full
          // max-age. HSTS is close to irreversible: undoing it means serving
          // max-age=0 and waiting for every visitor to come back.
          //
          // max-age starts at one day so a cutover problem is recoverable
          // within a day rather than a year. Once the site has been live and
          // fully HTTPS for a week or two, raise it to 31536000 — and only add
          // includeSubDomains after confirming every subdomain does HTTPS.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=86400',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // SAMEORIGIN, not DENY: the site frames Google Maps and YouTube, but
          // nothing should ever frame us.
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
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
