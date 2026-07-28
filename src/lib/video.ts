import type { Media, Truck } from '@/payload-types'

/**
 * Truck walkaround video. Two supported sources:
 *  - `embed` — a YouTube/Vimeo link pasted into the CMS (preferred; the host
 *    handles compression and quality switching, and costs us no bandwidth).
 *  - `file`  — a video uploaded straight into the Media library, served from
 *    our own disk. Convenient, but untranscoded: see the size cap in
 *    `payload.config.ts` and the guidance on the CMS field.
 */
export type TruckVideo =
  | { kind: 'embed'; provider: 'youtube' | 'vimeo'; embedUrl: string }
  | { kind: 'file'; url: string; mimeType: string }

type ParsedUrl = { provider: 'youtube' | 'vimeo'; id: string }

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/
const VIMEO_ID = /^\d+$/

/**
 * Pull the video id out of the URL shapes people actually paste — a browser
 * address bar, a mobile "Share" sheet, or an existing embed snippet.
 */
export function parseVideoUrl(input: string): ParsedUrl | null {
  const raw = input.trim()
  if (!raw) return null

  let url: URL
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase()
  const parts = url.pathname.split('/').filter(Boolean)

  if (host === 'youtu.be') {
    const id = parts[0]
    return id && YOUTUBE_ID.test(id) ? { provider: 'youtube', id } : null
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    // /watch?v=ID, plus the /embed/ID, /shorts/ID and /live/ID path forms.
    const fromQuery = url.searchParams.get('v')
    const fromPath = ['embed', 'shorts', 'live', 'v'].includes(parts[0]) ? parts[1] : null
    const id = fromQuery ?? fromPath
    return id && YOUTUBE_ID.test(id) ? { provider: 'youtube', id } : null
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    // The numeric id is the last purely-numeric path segment, which covers
    // /123, /channels/staff/123 and /video/123 alike.
    const id = [...parts].reverse().find((p) => VIMEO_ID.test(p))
    return id ? { provider: 'vimeo', id } : null
  }

  return null
}

/** Player URL for an already-parsed link. Autoplays because it only loads on click. */
function embedUrl({ provider, id }: ParsedUrl): string {
  if (provider === 'youtube') {
    // youtube-nocookie avoids setting tracking cookies until the visitor plays.
    const q = 'autoplay=1&rel=0&modestbranding=1&playsinline=1'
    return `https://www.youtube-nocookie.com/embed/${id}?${q}`
  }
  const q = 'autoplay=1&title=0&byline=0&portrait=0'
  return `https://player.vimeo.com/video/${id}?${q}`
}

/**
 * Resolve whichever video source a truck has. A pasted link wins over an
 * uploaded file when both are filled in, since it is cheaper to serve.
 */
export function truckVideo(truck: Truck): TruckVideo | null {
  const parsed = truck.videoUrl ? parseVideoUrl(truck.videoUrl) : null
  if (parsed) {
    return { kind: 'embed', provider: parsed.provider, embedUrl: embedUrl(parsed) }
  }

  const file = truck.videoFile as Media | number | null | undefined
  if (file && typeof file === 'object' && file.url) {
    return { kind: 'file', url: file.url, mimeType: file.mimeType ?? 'video/mp4' }
  }

  return null
}
