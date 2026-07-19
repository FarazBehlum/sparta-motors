import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Setting } from '@/payload-types'

/**
 * A single, memoized Payload instance for use in Server Components.
 * `cache` dedupes calls within one request; the Payload local API is reused
 * across requests by Payload's own internal singleton.
 */
export const getPayloadClient = cache(async () => {
  return getPayload({ config: await config })
})

/**
 * The Settings global — phone, address, hours, socials.
 * Used site-wide (nav, footer, contact, about, structured data).
 */
export const getSettings = cache(async (): Promise<Setting> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'settings' })
})
