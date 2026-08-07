'use client'

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Maximize,
  Minimize,
  Play,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import type { Photo } from '@/lib/media'
import type { TruckVideo } from '@/lib/video'

/** `photoIndex` is the slide's position in the original `photos` array — the
 *  slide list has the video spliced into it, so the two indexes diverge. The
 *  lightbox works in photo indexes; the main stage works in slide indexes. */
type Slide =
  | { kind: 'photo'; photo: Photo; photoIndex: number }
  | { kind: 'video'; video: TruckVideo }

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

/** False on the server and through hydration, true immediately after. The
 *  lightbox portals into document.body, which doesn't exist until then. Same
 *  useSyncExternalStore shape as lib/use-reduced-motion.ts, which keeps it out
 *  of an effect (setState in an effect body trips the React Compiler rule). */
const noopSubscribe = () => () => {}
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}

const OVERLAY_BTN =
  'rounded-full bg-sparta-black/60 p-2 text-bone transition hover:bg-orange hover:text-sparta-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange'

/**
 * Full-viewport photo viewer. Two levels deliberately:
 *
 *  1. This overlay — covers the page, shows the photo `object-contain` rather
 *     than the stage's `object-cover`, so nothing is cropped. Works everywhere,
 *     including iOS.
 *  2. True browser fullscreen on top of it, via the Fullscreen API — the
 *     YouTube-style button. Hidden where the browser doesn't allow it (notably
 *     iOS Safari, which only does fullscreen for <video>), so the button never
 *     appears and then does nothing.
 */
function Lightbox({
  photos,
  index,
  setIndex,
  onClose,
}: {
  photos: Photo[]
  index: number
  setIndex: (updater: (i: number) => number) => void
  onClose: () => void
}) {
  const shellRef = useRef<HTMLDivElement>(null)
  const [isFs, setIsFs] = useState(false)
  const count = photos.length
  const canFs = typeof document !== 'undefined' && document.fullscreenEnabled

  const go = useCallback(
    (dir: number) => setIndex((i) => (count ? (i + dir + count) % count : 0)),
    [count, setIndex],
  )

  // Mirror the browser's own fullscreen state — the user can leave fullscreen
  // with Esc or F11 without going through our button.
  useEffect(() => {
    const sync = () => setIsFs(Boolean(document.fullscreenElement))
    sync()
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  // Leaving fullscreen behind after the overlay unmounts would strand the page
  // in a fullscreen view of nothing.
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    }
  }, [])

  // Stop the page behind the overlay scrolling under it.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // In fullscreen the browser consumes Esc to exit it. Closing the
        // overlay as well would collapse both levels on one press.
        if (!document.fullscreenElement) onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  const toggleFs = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {})
    } else {
      void shellRef.current?.requestFullscreen().catch(() => {})
    }
  }

  const [touchX, setTouchX] = useState<number | null>(null)
  const onTouchEnd = (endX: number) => {
    if (touchX == null) return
    const dx = endX - touchX
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
    setTouchX(null)
  }

  const photo = photos[index]
  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <div
      ref={shellRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${count}, enlarged`}
      className="fixed inset-0 z-[100] flex flex-col bg-sparta-black/95 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX)}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 p-3 md:p-4" onClick={stop}>
        <span className="font-mono text-xs text-bone md:text-sm">
          {index + 1} / {count}
        </span>
        <div className="flex items-center gap-2">
          {canFs && (
            <button
              type="button"
              onClick={toggleFs}
              aria-label={isFs ? 'Exit full screen' : 'Full screen'}
              className={OVERLAY_BTN}
            >
              {isFs ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          )}
          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label="Close enlarged photo"
            className={OVERLAY_BTN}
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* The padding is a real backdrop region — clicking it closes. The inner
          box holds the photo and swallows the click so viewing it doesn't. */}
      <div className="relative min-h-0 flex-1 p-3 md:p-8">
        <div className="relative h-full w-full" onClick={stop}>
          {photo && (
            <Image
              key={photo.url}
              src={photo.url}
              alt={photo.alt}
              fill
              sizes="100vw"
              priority
              className="object-contain"
            />
          )}
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              stop(e)
              go(-1)
            }}
            aria-label="Previous photo"
            className={`absolute left-3 top-1/2 -translate-y-1/2 md:left-5 ${OVERLAY_BTN}`}
          >
            <ChevronLeft size={26} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              stop(e)
              go(1)
            }}
            aria-label="Next photo"
            className={`absolute right-3 top-1/2 -translate-y-1/2 md:right-5 ${OVERLAY_BTN}`}
          >
            <ChevronRight size={26} />
          </button>
        </>
      )}
    </div>
  )
}

/**
 * Truck photo gallery. Large main photo with prev/next arrows + counter, a
 * thumbnail strip, arrow-key navigation, and touch swipe on mobile. An optional
 * walkaround video sits second in the strip, so the lead photo still loads first.
 *
 * Zoom is click-to-arm, not hover-to-fire: the magnifier only engages after the
 * visitor turns it on (clicking the photo, or the zoom button), and clicking
 * again turns it off. Hover-zoom used to trigger on its own, which grabbed the
 * photo whenever the pointer crossed it on the way to something else.
 *
 * "Expand" opens a <Lightbox> — the uncropped, full-viewport view, with a real
 * browser-fullscreen button inside it.
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
  const hydrated = useIsHydrated()

  const slides = useMemo<Slide[]>(() => {
    const list: Slide[] = photos.map((photo, photoIndex) => ({ kind: 'photo', photo, photoIndex }))
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

  // Zoom is mouse-only. Touch devices fire a synthetic mouseenter on tap but
  // never a mouseleave, so on a phone the magnifier would latch on at the first
  // tap and leave the visitor dragging around a 2x photo with no way out.
  // Phones get the lightbox instead, which is the better answer there anyway.
  const [canHover, setCanHover] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setCanHover(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // `zoomOn` is the armed/disarmed toggle; `hovering` is whether the pointer is
  // actually over the stage right now. Magnification needs both, so moving the
  // pointer away relaxes the photo without disarming the mode.
  const [zoomOn, setZoomOn] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const originFrom = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  // While the pointer is over the gallery, let ← / → arrow keys change photos
  // (scoped to hover so it never hijacks arrow-key scrolling elsewhere, and
  // suspended under the lightbox so one press doesn't advance both).
  useEffect(() => {
    if (!hovering || count < 2 || lightboxIndex != null) return
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
  }, [hovering, count, go, lightboxIndex])

  if (!count) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-[10px] bg-warm-white font-mono text-sm uppercase tracking-widest text-concrete">
        No photos
      </div>
    )
  }

  const active = slides[index]
  const isVideo = active.kind === 'video'
  const lead = photos[0] ?? null
  // Zoom and the expand button are photo-only — both would fight the player's
  // own controls, and the video already has its own fullscreen.
  const canZoom = canHover && !isVideo
  const zooming = canZoom && zoomOn && hovering

  const openLightbox = () => {
    if (active.kind === 'photo') setLightboxIndex(active.photoIndex)
  }

  // Closing returns the main stage to whichever photo they navigated to inside
  // the lightbox, so the two views don't disagree.
  const closeLightbox = () => {
    if (lightboxIndex != null) {
      const slideIndex = slides.findIndex(
        (s) => s.kind === 'photo' && s.photoIndex === lightboxIndex,
      )
      if (slideIndex >= 0) setIndex(slideIndex)
    }
    setLightboxIndex(null)
  }

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
          } else if (e.key === 'Escape' && zoomOn) {
            setZoomOn(false)
          }
        }}
        onTouchStart={isVideo ? undefined : (e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={isVideo ? undefined : (e) => onTouchEnd(e.changedTouches[0].clientX)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={canZoom && zoomOn ? originFrom : undefined}
        // Clicking the photo arms/disarms the magnifier. The controls layered
        // over it stop propagation so they don't toggle it as a side effect.
        onClick={
          canZoom
            ? (e) => {
                originFrom(e)
                setZoomOn((v) => !v)
              }
            : undefined
        }
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
              transform: zooming ? 'scale(2)' : 'scale(1)',
              transformOrigin: `${origin.x}% ${origin.y}%`,
              cursor: canZoom ? (zoomOn ? 'zoom-out' : 'zoom-in') : undefined,
            }}
          />
        )}
        <span className="pointer-events-none absolute left-3 top-3 rounded bg-sparta-black/85 px-2.5 py-1 font-barlow text-xs font-bold uppercase tracking-wider text-bone">
          {badge}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded bg-sparta-black/70 px-2.5 py-1 font-mono text-xs text-bone backdrop-blur-sm">
          {index + 1} / {count}
        </span>

        {/* Bottom-right controls, YouTube-style. The zoom toggle is the
            keyboard-reachable equivalent of clicking the photo, and it makes an
            otherwise invisible mode discoverable. */}
        {!isVideo && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {canHover && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setZoomOn((v) => !v)
                }}
                aria-pressed={zoomOn}
                aria-label={zoomOn ? 'Turn off zoom' : 'Turn on zoom — then hover the photo'}
                title={zoomOn ? 'Turn off zoom' : 'Zoom'}
                className={
                  zoomOn
                    ? 'rounded-full bg-orange p-2 text-sparta-black transition'
                    : OVERLAY_BTN
                }
              >
                {zoomOn ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                openLightbox()
              }}
              aria-label="View photo full screen"
              title="View larger"
              className={OVERLAY_BTN}
            >
              <Expand size={18} />
            </button>
          </div>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                go(-1)
              }}
              aria-label="Previous photo"
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${OVERLAY_BTN}`}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                go(1)
              }}
              aria-label="Next photo"
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${OVERLAY_BTN}`}
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

      {/* Portalled to <body>: the overlay has to clear the sticky z-50 header,
          and a `fixed` child of a transformed ancestor would be trapped. */}
      {hydrated &&
        lightboxIndex != null &&
        createPortal(
          <Lightbox
            photos={photos}
            index={lightboxIndex}
            setIndex={(updater) => setLightboxIndex((i) => (i == null ? i : updater(i)))}
            onClose={closeLightbox}
          />,
          document.body,
        )}
    </div>
  )
}
