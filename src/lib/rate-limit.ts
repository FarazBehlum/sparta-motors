import { APIError, type PayloadRequest } from 'payload'

/**
 * Minimal in-memory fixed-window rate limiter. Suited to the Phase-1
 * single-VPS deployment — no Redis, no external store, zero cost. State is
 * per-process: it resets on restart and is not shared across instances, which
 * is acceptable for one small node. Swap for a shared store if we ever scale
 * horizontally.
 */
const buckets = new Map<string, { count: number; resetAt: number }>()

// Occasionally evict expired buckets so the map can't grow unbounded.
function sweep(now: number): void {
  if (buckets.size < 500) return
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}

/** Best-effort client IP from proxy headers, falling back to a shared bucket. */
export function clientIp(req: PayloadRequest): string {
  const headers = req.headers
  const fwd = headers?.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return headers?.get('x-real-ip') ?? 'unknown'
}

/**
 * Throws a user-facing error if the public submission rate is exceeded.
 * No-op for authenticated staff (they create records through the admin).
 * Default: 5 submissions per 10 minutes per IP + collection.
 */
export function enforcePublicSubmitLimit(
  req: PayloadRequest,
  scope: string,
  limit = 5,
  windowMs = 10 * 60 * 1000,
): void {
  if (req.user) return
  const { allowed } = checkRateLimit(`${scope}:${clientIp(req)}`, limit, windowMs)
  if (!allowed) {
    throw new APIError(
      'Too many submissions from your connection. Please try again in a few minutes.',
      429,
      undefined,
      true,
    )
  }
}
