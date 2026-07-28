'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import type { Photo } from '@/lib/media'
import type { TruckVideo } from '@/lib/video'

type Slide = { kind: 'photo'; photo: Photo } | { kind: 'video'; video: TruckVideo }

/**
 * The video slide shows the lead photo as a still until the visitor actually
 * hits play. Nothing from YouTube/Vimeo — and none of an uploaded file's bytes
 * — is fetched before that click, so adding a video costs page speed nothing.
 */
function VideoSlide({ video, poster }: { video: TruckVideo; poster: Photo | null }) {
  const [playing, setPlaying] = useState(false)

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label="Play walkaround video"
        className="group absolute inset-0 h-full w-full"
      >
        {poster ? (
          <Image src={poster.url} alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
        ) : (
          <span className="absolute inset-0 bg-charcoal" />
        )}
        <span className="absolute inset-0 bg-sparta-black/45 transition-colors group-hover:bg-sparta-black/30" />
        <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange text-sparta-black shadow-lg transition-transform group-hover:scale-105">
          <Play size={26} fill="currentColor" className="ml-1" />
        </span>
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-barlow text-sm font-bold uppercase tracking-widest text-bone">
          Watch walkaround
        </span>
      </button>
    )
  }

  if (video.kind === 'file') {
    return (
      <video
        className="absolute inset-0 h-full w-full bg-sparta-black object-contain"
        controls
        autoPlay
        playsInline
        preload="metadata"
        poster={poster?.url}
      >
        <source src={video.url} type={video.mimeType} />
      </video>
    )
  }

  return (
    <iframe
      src={video.embedUrl}
      title="Truck walkaround video"
      className="absolute inset-0 h-full w-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

/**
 * Truck photo gallery. Large main photo with prev/next arrows + counter, a
 * thumbnail strip, arrow-key navigation, and touch swipe on mobile. An optional
 * walkaround video sits second in the strip, so the lead photo still loads first.
 */
export function Gallery({
  photos,
  badge,
  video,
}: {
  photos: Photo[]
  badge: string
  video?: TruckVideo | null
}) {
  const [index, setIndex] = useState(0)

  const slides = useMemo<Slide[]>(() => {
    const list: Slide[] = photos.map((photo) => ({ kind: 'photo', photo }))
    if (video) list.splice(photos.length ? 1 : 0, 0, { kind: 'video', video })
    return list
  }, [photos, video])

  const count = slides.length

  const go = useCallback(
    (dir: number) => setIndex((i) => (count ? (i + dir + count) % count : 0)),
    [count],
  )

  // Touch swipe
  const [touchX, setTouchX] = useState<number | null>(null)
  const onTouchEnd = (endX: number) => {
    if (touchX == null) return
    const dx = endX - touchX
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
    setTouchX(null)
  }

  // Hover-zoom (desktop): magnify into the area under the cursor.
  const [zoom, setZoom] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const onZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin({ x, y })
  }

  // While the pointer is over the gallery, let ← / → arrow keys change photos
  // (scoped to hover so it never hijacks arrow-key scrolling elsewhere).
  useEffect(() => {
    if (!zoom || count < 2) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom, count, go])

  if (!count) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-[10px] bg-warm-white font-mono text-sm uppercase tracking-widest text-concrete">
        No photos
      </div>
    )
  }

  const active = slides[index]
  const isVideo = active.kind === 'video'
  // Swipe and hover-zoom would fight the player's own controls, so they only
  // apply while a photo is showing.
  const lead = photos[0] ?? null

  return (
    <div>
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-warm-white"
        role="group"
        aria-roledescription="carousel"
        aria-label={`Truck media — ${count} items. Use arrow keys to navigate.`}
        tabIndex={0}
        onKeyDown={(e) => {
          // Scoped to the gallery (was a global window listener that hijacked
          // arrow keys anywhere on the page).
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            go(-1)
          } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            go(1)
          }
        }}
        onTouchStart={isVideo ? undefined : (e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={isVideo ? undefined : (e) => onTouchEnd(e.changedTouches[0].clientX)}
        onMouseEnter={isVideo ? undefined : () => setZoom(true)}
        onMouseLeave={isVideo ? undefined : () => setZoom(false)}
        onMouseMove={isVideo ? undefined : onZoomMove}
      >
        {active.kind === 'video' ? (
          <VideoSlide video={active.video} poster={lead} />
        ) : (
          <Image
            key={active.photo.url}
            src={active.photo.url}
            alt={active.photo.alt}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition-transform duration-200 ease-out will-change-transform"
            style={{
              transform: zoom ? 'scale(2)' : 'scale(1)',
              transformOrigin: `${origin.x}% ${origin.y}%`,
              cursor: zoom ? 'zoom-in' : undefined,
            }}
          />
        )}
        <span className="pointer-events-none absolute left-3 top-3 rounded bg-sparta-black/85 px-2.5 py-1 font-barlow text-xs font-bold uppercase tracking-wider text-bone">
          {badge}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded bg-sparta-black/70 px-2.5 py-1 font-mono text-xs text-bone backdrop-blur-sm">
          {index + 1} / {count}
        </span>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-sparta-black/60 p-2 text-bone transition hover:bg-orange hover:text-sparta-black"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-sparta-black/60 p-2 text-bone transition hover:bg-orange hover:text-sparta-black"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {slides.map((s, i) => (
            <button
              type="button"
              key={s.kind === 'video' ? 'video' : s.photo.url}
              onClick={() => setIndex(i)}
              aria-label={s.kind === 'video' ? 'View walkaround video' : `View photo ${i + 1}`}
              aria-current={i === index}
              className={`relative h-[60px] w-20 shrink-0 overflow-hidden rounded border-2 transition ${
                i === index ? 'border-orange' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {s.kind === 'video' ? (
                <>
                  {lead && <Image src={lead.url} alt="" fill sizes="80px" className="object-cover" />}
                  <span className="absolute inset-0 flex items-center justify-center bg-sparta-black/55">
                    <Play size={18} fill="currentColor" className="ml-0.5 text-bone" />
                  </span>
                </>
              ) : (
                <Image src={s.photo.url} alt="" fill sizes="80px" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
