import { NextResponse, type NextRequest } from 'next/server'
import { CATEGORY_TO_BODY_TYPE } from '@/lib/format'

/**
 * Reject unknown inventory category slugs with a real HTTP 404.
 *
 * /inventory/[category] reads searchParams for its filters, which makes it a
 * fully dynamic route. Next streams dynamic responses, so the status line is
 * already sent by the time the page's own `notFound()` runs — the result was
 * HTTP 200 carrying 404 content. That is a soft 404: Google treats the URL as
 * a real page, so /inventory/<anything> was an unbounded set of indexable junk
 * URLs all rendering the same "not found" body.
 *
 * `export const dynamicParams = false` does not fix it — that only governs
 * statically generated routes, and this one is dynamic either way. This proxy
 * (Next 16's rename of middleware) runs before rendering begins, so it is the
 * last place a status can still be set. It rewrites to Next's not-found route
 * so the visitor still gets the branded page from src/app/not-found.tsx.
 *
 * The matcher is deliberately narrow — exactly one path segment under
 * /inventory. It must never sit in front of /admin, /api or static assets.
 */
const VALID_CATEGORIES = new Set(Object.keys(CATEGORY_TO_BODY_TYPE))

/** Retired slugs that next.config.ts redirects; let those rules run. */
const REDIRECTED = new Set(['day-cabs', 'flat-beds'])

export function proxy(req: NextRequest) {
  const segments = req.nextUrl.pathname.split('/').filter(Boolean)
  if (segments.length !== 2 || segments[0] !== 'inventory') return NextResponse.next()

  let category: string
  try {
    category = decodeURIComponent(segments[1]!)
  } catch {
    category = segments[1]! // malformed escape — cannot be a valid slug anyway
  }

  if (VALID_CATEGORIES.has(category) || REDIRECTED.has(category)) return NextResponse.next()

  // Rewrite, not redirect: the URL stays where the visitor typed it, which is
  // what a 404 should do, while the status comes from here.
  return NextResponse.rewrite(new URL('/_not-found', req.url), { status: 404 })
}

export const config = {
  matcher: '/inventory/:category',
}
