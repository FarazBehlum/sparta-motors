'use client'

import React, { useEffect, useRef, useState } from 'react'

export type LocationMapProps = {
  lat: number
  lng: number
  addressLines: string[]
  /**
   * Business name. Querying by name + address resolves the embed to the Google
   * Business Profile, so the pin opens the real listing — reviews, hours,
   * photos, call button — instead of a bare coordinate. Defaults rather than
   * threading `settings.siteName` through three call sites; change it here if
   * the business is ever renamed.
   */
  businessName?: string
  height?: number | string
}

function MapPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-warm-white">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-concrete">
        Map loading…
      </span>
    </div>
  )
}

/**
 * Location map — a standard Google Maps embed.
 *
 * This replaced Leaflet + CartoDB tiles (see build-brief/leaflet-map.md, now
 * superseded). The client asked for Google specifically because it's what
 * customers recognise, and recognition was the whole point: the embed gives
 * them Street View, the satellite toggle, and a Directions button they already
 * know how to use.
 *
 * Deliberately the **embed**, not the Maps JavaScript API. The embed is free
 * and unlimited with no API key, no Google Cloud project, and no card on file;
 * the JS API would need all three and meter map loads. The only thing the JS
 * API would buy us is a custom-coloured pin, which is not worth a billing
 * account on a site with one location.
 *
 * The iframe pulls roughly a megabyte of Google's own JS, so it is still
 * mounted only once it scrolls near the viewport — same IntersectionObserver
 * that was here for Leaflet's bundle.
 */
export function LocationMap({
  lat,
  lng,
  addressLines,
  businessName = 'Sparta Motors',
  height = 440,
}: LocationMapProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Fall back to raw coordinates when no address is set yet — a name-only query
  // would drop the pin on whatever Google thinks is the closest match.
  const query = addressLines.length ? [businessName, ...addressLines].join(', ') : `${lat},${lng}`
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`

  return (
    <div
      ref={ref}
      role="region"
      aria-label={`Map showing ${businessName}`}
      className="overflow-hidden rounded-[10px] border border-chalk"
      style={{ height }}
    >
      {inView ? (
        <iframe
          src={src}
          title={`Google Map showing ${businessName}`}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <MapPlaceholder />
      )}
    </div>
  )
}
