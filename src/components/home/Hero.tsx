'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion'

/**
 * The signature scroll-driven hero (build-brief/hero-video.md + pages/home.md).
 *
 * A 250vh section with a 100vh sticky viewport. As the user scrolls, the truck
 * disassembles: we draw an image sequence onto a <canvas>, one exact frame per
 * scroll position. (Scrubbing a <video> via currentTime only lands on sparse
 * keyframes, so the teardown appeared frozen — the canvas sequence fixes that.)
 * Three text phases fade in/out at scroll depths. No GSAP.
 * Reduced-motion users get the first (assembled) frame + instant phase swaps.
 *
 * Frames are built by scripts/build-hero-frames.mjs. Keep FRAME_COUNT in sync.
 */

const FRAME_COUNT = 120
const framePath = (i: number) => `/hero/frames/${String(i + 1).padStart(4, '0')}.webp`

const PHASES = [
  {
    kicker: '01 · THE TRUCK',
    title: 'Used commercial trucks for working businesses.',
    lead: 'Box trucks, reefers, day cabs, dump trucks, tow rigs. Every truck inspected before it goes on the lot.',
  },
  {
    kicker: '02 · THE INSPECTION',
    title: 'Inspected inside and out. Every truck.',
    lead: "If it doesn't run right, we don't sell it. Real mileage, real photos, real condition notes.",
  },
  {
    kicker: '03 · THE PROMISE',
    title: 'You see everything — before you buy.',
    lead: null,
  },
] as const

// Phase opacity as a function of scroll progress (0..1). Ranges from the brief.
function phaseOpacity(index: number, p: number): number {
  const ramp = (from: number, to: number) => (p - from) / (to - from)
  if (index === 0) {
    if (p <= 0.25) return 1
    if (p >= 0.35) return 0
    return 1 - ramp(0.25, 0.35)
  }
  if (index === 1) {
    if (p < 0.35 || p >= 0.7) return 0
    if (p < 0.45) return ramp(0.35, 0.45)
    if (p < 0.6) return 1
    return 1 - ramp(0.6, 0.7)
  }
  // index === 2
  if (p < 0.7) return 0
  if (p >= 0.8) return 1
  return ramp(0.7, 0.8)
}

function activePhase(p: number): number {
  if (p < 0.35) return 0
  if (p < 0.7) return 1
  return 2
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const loadedRef = useRef<boolean[]>([])
  const drawnRef = useRef(-1)
  const progressRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return

    const images: HTMLImageElement[] = new Array(FRAME_COUNT)
    const loaded: boolean[] = new Array(FRAME_COUNT).fill(false)
    imagesRef.current = images
    loadedRef.current = loaded
    drawnRef.current = -1

    const frameForProgress = (p: number) => Math.round(p * (FRAME_COUNT - 1))

    // Cover-fit the given (loaded) frame onto the canvas, honoring devicePixelRatio.
    const drawFrame = (index: number) => {
      const img = images[index]
      if (!img || !loaded[index]) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const dpr = window.devicePixelRatio || 1
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      if (cw === 0 || ch === 0) return
      if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
        canvas.width = Math.round(cw * dpr)
        canvas.height = Math.round(ch * dpr)
      }
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      const dw = img.naturalWidth * scale
      const dh = img.naturalHeight * scale
      const dx = (cw - dw) / 2
      const dy = (ch - dh) * 0.55 // matches object-position: center 55%
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(img, dx, dy, dw, dh)
      drawnRef.current = index
    }

    // If the exact target frame hasn't loaded yet, draw the closest one that has.
    const drawNearest = (target: number) => {
      if (loaded[target]) return drawFrame(target)
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (target - d >= 0 && loaded[target - d]) return drawFrame(target - d)
        if (target + d < FRAME_COUNT && loaded[target + d]) return drawFrame(target + d)
      }
    }

    // Load frames. Frame 0 first (immediate paint / poster), then the rest.
    const loadFrame = (i: number) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        loaded[i] = true
        const target = reduce ? 0 : frameForProgress(progressRef.current)
        // Repaint if this frame is now the best available for where we are.
        if (i === target || (drawnRef.current === -1 && i === 0)) drawNearest(target)
      }
      img.src = framePath(i)
      images[i] = img
    }

    if (reduce) {
      loadFrame(0) // assembled truck, no scrubbing
    } else {
      loadFrame(0)
      for (let i = 1; i < FRAME_COUNT; i++) loadFrame(i)
    }

    let raf = 0
    const update = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const p = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0
      progressRef.current = p
      setProgress(p)
      if (!reduce) drawNearest(frameForProgress(p))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onResize = () => {
      // Force a redraw at the new size.
      const idx = drawnRef.current
      drawnRef.current = -1
      if (idx >= 0) drawFrame(idx)
      onScroll()
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduce])

  const active = activePhase(progress)
  // Reduced motion → snap to whichever phase we're in, no cross-fades.
  const opacityFor = (i: number) => (reduce ? (i === active ? 1 : 0) : phaseOpacity(i, progress))

  return (
    <section
      ref={sectionRef}
      aria-label="Sparta Motors"
      className="relative bg-hero-warm"
      style={{ height: '250vh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* SPARTA watermark, very low opacity, behind everything */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-barlow font-extrabold uppercase leading-none tracking-tighter text-sparta-black/[0.04]"
          style={{ fontSize: 'min(38vw, 520px)' }}
        >
          Sparta
        </span>

        {/* Poster behind the canvas — shown instantly while frames load. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 h-full w-full bg-cover"
          style={{ backgroundImage: 'url(/hero/poster.jpg)', backgroundPosition: 'center 55%' }}
        />

        {/* Scrubbed truck disassembly — one exact frame per scroll position. */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />

        {/* Bottom fade for text legibility */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[260px]"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--color-hero-warm))' }}
        />

        {/* Top-left: establishment */}
        <div className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.25em] text-orange md:left-10 md:top-8">
          EST. 2018 · Spartanburg, SC
        </div>

        {/* Top-right: phase indicator dots */}
        <div className="absolute right-5 top-5 flex gap-2 md:right-10 md:top-8" aria-hidden="true">
          {PHASES.map((_, i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-full border transition-colors duration-200"
              style={{
                backgroundColor: i === active ? 'var(--color-orange)' : 'rgba(0,0,0,0.12)',
                borderColor: i === active ? 'var(--color-orange)' : 'rgba(0,0,0,0.3)',
              }}
            />
          ))}
        </div>

        {/* Text phases */}
        <div className="absolute inset-x-0 bottom-0 pb-16 md:pb-24">
          <div className="mx-auto grid max-w-[1400px] px-5 md:px-10">
            {PHASES.map((phase, i) => (
              <div
                key={i}
                aria-hidden={active !== i}
                className="col-start-1 row-start-1 max-w-3xl"
                style={{
                  opacity: opacityFor(i),
                  transition: reduce ? 'none' : 'opacity 200ms linear',
                  pointerEvents: active === i ? 'auto' : 'none',
                }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange">
                  <span aria-hidden="true">◆ </span>
                  {phase.kicker}
                </p>
                <h1 className="mt-3 font-barlow font-extrabold uppercase leading-[0.95] tracking-tight text-sparta-black text-[clamp(2.5rem,7vw,4.25rem)]">
                  {phase.title}
                </h1>
                {phase.lead && (
                  <p className="mt-4 max-w-xl font-inter text-base leading-relaxed text-iron md:text-lg">
                    {phase.lead}
                  </p>
                )}
                {i === 2 && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/inventory"
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded bg-orange px-6 py-3 font-barlow text-sm font-bold uppercase tracking-wider text-sparta-black transition-all duration-150 hover:scale-[1.02] hover:brightness-105 motion-reduce:hover:scale-100"
                    >
                      Browse inventory →
                    </Link>
                    <Link
                      href="/fleet"
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded border border-sparta-black px-6 py-3 font-barlow text-sm font-bold uppercase tracking-wider text-sparta-black transition-colors duration-150 hover:bg-sparta-black hover:text-bone"
                    >
                      Fleet inquiries
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom-right: scroll hint, fades once scrolling starts */}
        <div
          aria-hidden="true"
          className="absolute bottom-6 right-5 flex flex-col items-center gap-1 font-mono text-[10px] uppercase tracking-[0.3em] text-iron transition-opacity duration-300 md:right-10"
          style={{ opacity: progress > 0.02 ? 0 : 1 }}
        >
          Scroll
          <span className="text-orange">↓</span>
        </div>
      </div>
    </section>
  )
}
