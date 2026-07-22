'use client'

import React, { useEffect, useRef } from 'react'
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

const FRAME_COUNT = 160
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
  // Text phases, dots and the scroll hint are updated imperatively (via these
  // refs) inside the scroll rAF — so scrolling never triggers a React re-render.
  const phaseRefs = useRef<(HTMLDivElement | null)[]>([])
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([])
  const hintRef = useRef<HTMLDivElement>(null)
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
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
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

    // Load a single frame. `done` frees a slot in the concurrency pool below,
    // firing on both success and error so one bad frame can't stall loading.
    const loadFrame = (i: number, done?: () => void) => {
      const img = new Image()
      img.decoding = 'async'
      const ready = () => {
        loaded[i] = true
        const target = reduce ? 0 : frameForProgress(progressRef.current)
        // Repaint if this frame is now the best available for where we are.
        if (i === target || (drawnRef.current === -1 && i === 0)) drawNearest(target)
        done?.()
      }
      img.onload = () => {
        // Pre-decode so the first drawImage of this frame never stalls the main
        // thread mid-scroll. If decode() isn't available/rejects, mark it ready
        // anyway (decode then happens synchronously on first draw, as before).
        if (typeof img.decode === 'function') img.decode().then(ready, ready)
        else ready()
      }
      img.onerror = () => done?.()
      img.src = framePath(i)
      images[i] = img
    }

    if (reduce) {
      loadFrame(0) // assembled truck, no scrubbing
    } else {
      // Don't fire all 160 requests at once (that competes with LCP and hammers
      // the connection). Instead load through a small concurrency pool in a
      // priority order: frame 0, then a coarse every-8th pass so scrubbing works
      // almost immediately, then every remaining frame fills in the detail.
      // drawNearest() already covers any frame that hasn't arrived yet.
      const order: number[] = []
      const seen = new Set<number>()
      const enqueue = (i: number) => {
        if (i >= 0 && i < FRAME_COUNT && !seen.has(i)) {
          seen.add(i)
          order.push(i)
        }
      }
      enqueue(0)
      for (let i = 0; i < FRAME_COUNT; i += 8) enqueue(i)
      for (let i = 0; i < FRAME_COUNT; i++) enqueue(i)

      const CONCURRENCY = 6
      let cursor = 0
      const pump = () => {
        if (cursor >= order.length) return
        loadFrame(order[cursor++], pump)
      }
      for (let k = 0; k < CONCURRENCY; k++) pump()
    }

    // Update phase opacities, dots and the scroll hint directly on the DOM —
    // same visual result as the old state-driven render, minus the re-render.
    const paintUI = (p: number) => {
      const active = activePhase(p)
      for (let i = 0; i < PHASES.length; i++) {
        const el = phaseRefs.current[i]
        if (el) {
          el.style.opacity = String(reduce ? (i === active ? 1 : 0) : phaseOpacity(i, p))
          el.style.pointerEvents = active === i ? 'auto' : 'none'
          el.setAttribute('aria-hidden', String(active !== i))
        }
        const dot = dotRefs.current[i]
        if (dot) {
          const on = i === active
          dot.style.backgroundColor = on ? 'var(--color-orange)' : 'rgba(0,0,0,0.12)'
          dot.style.borderColor = on ? 'var(--color-orange)' : 'rgba(0,0,0,0.3)'
        }
      }
      if (hintRef.current) hintRef.current.style.opacity = p > 0.02 ? '0' : '1'
    }

    let raf = 0
    const update = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const p = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0
      progressRef.current = p
      if (!reduce) drawNearest(frameForProgress(p))
      paintUI(p)
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

  return (
    <section
      ref={sectionRef}
      aria-label="Sparta Motors"
      className="relative bg-hero-warm"
      style={{ height: '300vh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* SPARTA watermark, very low opacity, behind everything */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-barlow font-extrabold uppercase leading-none tracking-tighter text-sparta-black/[0.04]"
          style={{ fontSize: 'min(50vw, 700px)' }}
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

        {/* Bottom scrim for white-text legibility */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px]"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(26,26,26,0.75))' }}
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
              ref={(el) => {
                dotRefs.current[i] = el
              }}
              className="h-2.5 w-2.5 rounded-full border transition-colors duration-200"
              style={{
                backgroundColor: i === 0 ? 'var(--color-orange)' : 'rgba(0,0,0,0.12)',
                borderColor: i === 0 ? 'var(--color-orange)' : 'rgba(0,0,0,0.3)',
              }}
            />
          ))}
        </div>

        {/* Text phases */}
        <div className="absolute inset-x-0 bottom-0 pb-16 md:pb-24">
          <div className="mx-auto grid max-w-[1400px] px-5 md:px-10">
            {PHASES.map((phase, i) => {
              // Only the first (default) phase is the page's real <h1>; the
              // others are visually identical paragraphs so the document keeps
              // exactly one h1 (SEO + screen-reader heading structure).
              const TitleTag = (i === 0 ? 'h1' : 'p') as 'h1' | 'p'
              return (
              <div
                key={i}
                ref={(el) => {
                  phaseRefs.current[i] = el
                }}
                aria-hidden={i !== 0}
                className="col-start-1 row-start-1 max-w-3xl"
                style={{
                  opacity: i === 0 ? 1 : 0,
                  transition: reduce ? 'none' : 'opacity 200ms linear',
                  pointerEvents: i === 0 ? 'auto' : 'none',
                }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange">
                  <span aria-hidden="true">◆ </span>
                  {phase.kicker}
                </p>
                <TitleTag className="mt-3 font-barlow font-extrabold uppercase leading-[0.95] tracking-tight text-white text-[clamp(2.5rem,7vw,4.25rem)] [text-shadow:0_2px_20px_rgba(0,0,0,0.35)]">
                  {phase.title}
                </TitleTag>
                {phase.lead && (
                  <p className="mt-4 max-w-xl font-inter text-base leading-relaxed text-white/85 md:text-lg [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
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
                      href="/parts"
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded border border-white px-6 py-3 font-barlow text-sm font-bold uppercase tracking-wider text-white transition-colors duration-150 hover:bg-white hover:text-sparta-black"
                    >
                      Shop Parts
                    </Link>
                  </div>
                )}
              </div>
              )
            })}
          </div>
        </div>

        {/* Bottom-right: scroll hint, fades once scrolling starts */}
        <div
          ref={hintRef}
          aria-hidden="true"
          className="absolute bottom-6 right-5 flex flex-col items-center gap-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white/70 transition-opacity duration-300 md:right-10"
          style={{ opacity: 1 }}
        >
          Scroll
          <span className="text-orange">↓</span>
        </div>
      </div>
    </section>
  )
}
