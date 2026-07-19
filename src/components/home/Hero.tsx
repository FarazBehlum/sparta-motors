'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion'

/**
 * The signature scroll-driven hero (build-brief/hero-video.md + pages/home.md).
 *
 * A 250vh section with a 100vh sticky viewport. As the user scrolls, the truck
 * video is scrubbed frame-by-frame (currentTime = progress × duration) and three
 * text phases fade in/out at scroll depths. Lightweight custom hook — no GSAP.
 * Reduced-motion users get the poster frame + instant text-phase swaps.
 */

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
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    const video = videoRef.current
    if (!section) return

    // Prime iOS/Safari decoding so scrubbed seeks paint frames without a gesture.
    if (video && !reduce) {
      video.play().then(() => video.pause()).catch(() => {})
    }

    let raf = 0
    const update = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const p = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0
      progressRef.current = p
      setProgress(p)
      if (!reduce && video && video.duration) {
        video.currentTime = p * video.duration
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
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

        {/* Scrubbed truck video */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          poster="/hero/sparta-hero-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: 'center 55%' }}
        >
          <source src="/hero/sparta-hero.webm" type="video/webm" />
          <source src="/hero/sparta-hero.mp4" type="video/mp4" />
        </video>

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
