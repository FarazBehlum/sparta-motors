'use client'

import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { MapInnerProps } from './MapInner'

// Leaflet touches `window` on init, so load the map client-only, lazily.
const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => <MapPlaceholder />,
})

function MapPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-warm-white">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-concrete">
        Map loading…
      </span>
    </div>
  )
}

type LocationMapProps = MapInnerProps & { height?: number | string }

/**
 * Reusable location map (Leaflet + CartoDB Positron). Mounts the heavy Leaflet
 * bundle only once the container scrolls into view. Pulls coords/address/phone
 * from Settings via props. See build-brief/integrations/leaflet-map.md.
 */
export function LocationMap({ height = 440, ...inner }: LocationMapProps) {
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

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Map showing Sparta Motors location"
      className="overflow-hidden rounded-[10px] border border-chalk"
      style={{ height }}
    >
      {inView ? <MapInner {...inner} /> : <MapPlaceholder />}
    </div>
  )
}
