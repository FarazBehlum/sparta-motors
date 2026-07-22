/**
 * The canonical public site origin — used by canonicals, the sitemap, robots,
 * structured data, OpenGraph tags, and admin links in notification emails.
 *
 * In production this MUST come from NEXT_PUBLIC_SITE_URL. A silent
 * `http://localhost:3000` fallback shipping to prod would poison every
 * canonical, sitemap entry, and OG URL, so we fail loudly instead. In dev it
 * falls back to localhost for convenience.
 */
function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL
  if (raw) return raw.replace(/\/+$/, '')
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL is not set. Set it to the production origin ' +
        '(e.g. https://sparta-motors.com) — canonicals, sitemap, structured ' +
        'data, and OpenGraph tags all depend on it.',
    )
  }
  return 'http://localhost:3000'
}

export const SITE_URL = resolveSiteUrl()
