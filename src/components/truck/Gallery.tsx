'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Photo } from '@/lib/media'

/**
 * Truck photo gallery. Large main photo with prev/next arrows + counter, a
 * thumbnail strip, arrow-key navigation, and touch swipe on mobile.
 */
export function Gallery({ photos, badge }: { photos: Photo[]; badge: string }) {
  const [index, setIndex] = useState(0)
  const count = photos.length

  const go = useCallback(
    (dir: number) => setIndex((i) => (count ? (i + dir + count) % count : 0)),
    [count],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // Touch swipe
  const [touchX, setTouchX] = useState<number | null>(null)
  const onTouchEnd = (endX: number) => {
    if (touchX == null) return
    const dx = endX - touchX
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
    setTouchX(null)
  }

  if (!count) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-[10px] bg-warm-white font-mono text-sm uppercase tracking-widest text-concrete">
        No photos
      </div>
    )
  }

  const active = photos[index]

  return (
    <div>
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-warm-white"
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX)}
      >
        <Image
          key={active.url}
          src={active.url}
          alt={active.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
        <span className="absolute left-3 top-3 rounded bg-sparta-black/85 px-2.5 py-1 font-barlow text-xs font-bold uppercase tracking-wider text-bone">
          {badge}
        </span>
        <span className="absolute right-3 top-3 rounded bg-sparta-black/70 px-2.5 py-1 font-mono text-xs text-bone backdrop-blur-sm">
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
          {photos.map((p, i) => (
            <button
              type="button"
              key={p.url}
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === index}
              className={`relative h-[60px] w-20 shrink-0 overflow-hidden rounded border-2 transition ${
                i === index ? 'border-orange' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={p.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
