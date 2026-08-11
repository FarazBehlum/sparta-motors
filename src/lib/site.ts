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
  if (raw) {
    const url = raw.replace(/\/+$/, '')
    // Set-but-wrong is as damaging as unset and much easier to miss: a dev .env
    // copied to the server passes the "is it set?" check below and then bakes
    // http://localhost:3000 into every canonical, sitemap entry and OG URL.
    // Those are read at BUILD time, so the mistake stays invisible until Google
    // has indexed it.
    //
    // A warning rather than a throw, deliberately: `next build` runs with
    // NODE_ENV=production, so throwing here would break the ordinary local
    // "does it still compile?" build that every developer runs. The deploy
    // runbook has the operator read this build output, which is where this
    // lands.
    if (
      process.env.NODE_ENV === 'production' &&
      /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|$|\/)/i.test(url)
    ) {
      console.warn(
        `\n⚠️  NEXT_PUBLIC_SITE_URL is "${url}" in a production build.\n` +
          '   If this build is going live, stop: every canonical tag, sitemap\n' +
          '   URL, OpenGraph image URL and JSON-LD id will point at localhost.\n' +
          '   Set the real origin in .env and rebuild.\n',
      )
    }
    return url
  }
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
