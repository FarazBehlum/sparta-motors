'use client'

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { motion, useInView } from 'framer-motion'
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion'

/**
 * Ambient hero motion: a box truck drives left → right on an infinite loop with
 * a short pause between passes, wheels spinning, dust kicking up behind the
 * rear axle.
 *
 * Everything animated here is `transform` (translateX / rotate / scale) plus
 * `opacity` — both compositor-only, so the loop never triggers layout or paint.
 * No width/left/margin animation anywhere.
 *
 * Three things keep it cheap and considerate:
 *  - It only runs while the hero is actually on screen (useInView). An infinite
 *    loop left running under a scrolled-past hero or a background tab drains
 *    phone battery for nothing.
 *  - prefers-reduced-motion parks the truck — visible, still, no dust.
 *  - Server-side it renders as plain SVG. Motion writes its own transform styles
 *    when it renders, which don't survive hydration comparison, so the animated
 *    version is swapped in after mount. Both look identical at rest.
 */

/** SVG user-space canvas. x starts negative so the dust behind the truck fits. */
const VIEW = { x: -56, y: 0, w: 296, h: 86 }

const WHEEL_R = 13
const WHEEL_CY = 71
/** Axle centres. Low x is the rear of the truck — 48/86 are the tandem rear
 *  pair, 188 is the steer axle under the cab. */
const AXLES = [48, 86, 188]

/** Ground speed in CSS px per second. Drives BOTH the travel duration and the
 *  wheel spin rate, so the wheels turn at the speed the truck is actually
 *  moving rather than some arbitrary rate — and the speed stays constant
 *  whatever the viewport width. */
const SPEED = 165
/** Beat between passes, seconds. */
const LOOP_GAP = 1.1
/** Stand-in truck width used for the off-screen park before the real width is
 *  measured. Only has to be "at least as wide as the truck" to hide it. */
const TRUCK_W_FALLBACK = 320

// Brand palette (build-brief/04-design-system.md). Inline rather than CSS vars
// because SVG paint attributes need literal values.
const INK = '#1a1a1a'
const CHARCOAL = '#2c2c2a'
const IRON = '#5f5e5a'
const ORANGE = '#f26b0f'
const AMBER = '#f5a623'
const GLASS = '#efeeea'
const BONE = '#f5f3f0'
/** Dust is `concrete`, not `iron` — on the warm hero background the darker grey
 *  reads as hard blobs rather than kicked-up dust. */
const DUST_GREY = '#b4b2a9'

export type TruckTone = 'light' | 'dark'

/**
 * Two colourways. The truck was drawn for the warm bone hero; over a dark
 * photograph its near-black cargo box and chassis disappear entirely, so `dark`
 * inverts those two and lightens the trim. Orange, amber and glass carry across
 * unchanged — they read on either background.
 */
const PALETTES: Record<TruckTone, { body: string; frame: string; trim: string; dust: string }> = {
  light: { body: INK, frame: CHARCOAL, trim: IRON, dust: DUST_GREY },
  dark: { body: BONE, frame: '#c9c7bd', trim: '#6f6e69', dust: '#9b9992' },
}

/** Round generated geometry to 3dp. Node and the browser disagree on the last
 *  bit of Math.sin/cos output, which React reports as a hydration mismatch on
 *  the raw attribute values. 3dp is far finer than a 296-unit canvas can show. */
const r3 = (n: number) => Math.round(n * 1000) / 1000

const polar = (deg: number, radius: number) => {
  const a = (deg * Math.PI) / 180
  return { x: r3(Math.cos(a) * radius), y: r3(Math.sin(a) * radius) }
}

/** Tread ticks around the tyre — without them a spinning circle looks static. */
const TREAD = Array.from({ length: 8 }, (_, i) => {
  const deg = (i * 360) / 8
  const inner = polar(deg, WHEEL_R - 4.5)
  const outer = polar(deg, WHEEL_R - 1)
  return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y }
})

/** Hub lugs — a second rotation cue, at 3 rather than 8 so it reads as a hub. */
const LUGS = [0, 120, 240].map((deg) => polar(deg, 4))

const DUST = [
  { cx: 4, cy: 80, r: 3.5, delay: 0 },
  { cx: -10, cy: 76, r: 5, delay: 0.16 },
  { cx: -25, cy: 80, r: 4, delay: 0.32 },
  { cx: -40, cy: 77, r: 5.5, delay: 0.48 },
]

/** False on the server and through hydration, true immediately after — the same
 *  useSyncExternalStore shape as usePrefersReducedMotion, which keeps it out of
 *  an effect (setState in an effect body triggers cascading renders). */
const noopSubscribe = () => () => {}
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}

/** Rotate/scale about the element's own centre — `fill-box` measures the shape,
 *  not the whole SVG canvas, so each wheel turns on its own axle. */
const SPIN_ORIGIN: React.CSSProperties = {
  transformBox: 'fill-box',
  transformOrigin: 'center',
  willChange: 'transform',
}

function Wheel({
  cx,
  animated,
  driving,
  spinSeconds,
  pal,
}: {
  cx: number
  animated: boolean
  driving: boolean
  spinSeconds: number
  pal: (typeof PALETTES)[TruckTone]
}) {
  const art = (
    <>
      <circle cx={cx} cy={WHEEL_CY} r={WHEEL_R} fill={pal.body} />
      <circle
        cx={cx}
        cy={WHEEL_CY}
        r={WHEEL_R - 2.5}
        fill="none"
        stroke={pal.frame}
        strokeWidth={1.5}
      />
      <g transform={`translate(${cx} ${WHEEL_CY})`}>
        {TREAD.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={pal.trim}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        ))}
        {/* Orange hub — the brand accent on the wheels */}
        <circle r={5.5} fill={ORANGE} />
        {LUGS.map((lug, i) => (
          <line
            key={i}
            x1={0}
            y1={0}
            x2={lug.x}
            y2={lug.y}
            stroke={pal.body}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        ))}
        <circle r={1.6} fill={pal.body} />
      </g>
    </>
  )

  if (!animated) return <g style={SPIN_ORIGIN}>{art}</g>

  return (
    <motion.g
      style={SPIN_ORIGIN}
      animate={driving ? { rotate: 360 } : { rotate: 0 }}
      transition={
        driving ? { duration: spinSeconds, ease: 'linear', repeat: Infinity } : { duration: 0 }
      }
    >
      {art}
    </motion.g>
  )
}

function TruckArt({
  animated,
  driving,
  spinSeconds,
  pal,
}: {
  animated: boolean
  driving: boolean
  spinSeconds: number
  pal: (typeof PALETTES)[TruckTone]
}) {
  return (
    <svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      className="block h-auto w-[200px] sm:w-[248px] md:w-[288px]"
      aria-hidden="true"
      focusable="false"
    >
      {/* Dust puffs, behind everything and behind the truck's tail */}
      {DUST.map((d, i) =>
        animated ? (
          <motion.circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={pal.dust}
            style={SPIN_ORIGIN}
            // Motion reads the "from" value off the element; an SVG circle with
            // no inline opacity reads back as undefined ("not an animatable
            // value"), so state the resting values explicitly. Safe here because
            // motion.circle only ever renders after hydration.
            initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
            animate={
              driving
                ? { opacity: [0, 0.6, 0], scale: [0.5, 1.35], x: [0, -16], y: [0, -9] }
                : { opacity: 0, scale: 0.5, x: 0, y: 0 }
            }
            transition={
              driving
                ? {
                    duration: 1.15,
                    ease: 'easeOut',
                    repeat: Infinity,
                    delay: d.delay,
                    repeatDelay: 0.1,
                  }
                : { duration: 0 }
            }
          />
        ) : (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={pal.dust} opacity={0} />
        ),
      )}

      {/* Chassis rail */}
      <rect x={12} y={64} width={206} height={7} rx={1.5} fill={pal.frame} />
      {/* Mud flap behind the rear axle */}
      <rect x={31} y={66} width={3.5} height={11} rx={1} fill={pal.frame} />

      {/* Cargo box */}
      <rect x={12} y={10} width={138} height={54} rx={2} fill={pal.body} />
      {[42, 70, 98, 126].map((x) => (
        <line key={x} x1={x} y1={14} x2={x} y2={54} stroke={pal.frame} strokeWidth={2} />
      ))}
      {/* Orange accent band along the box */}
      <rect x={12} y={56} width={138} height={4} fill={ORANGE} />

      {/* Cab — the brand orange moment */}
      <path d="M150 64 L150 26 L194 26 L214 47 L214 64 Z" fill={ORANGE} />
      <line x1={190} y1={28} x2={190} y2={64} stroke={INK} strokeWidth={1.2} opacity={0.35} />
      {/* Cab stays orange in both tones, so its detailing keeps the ink values */}
      {/* Side window + windshield */}
      <rect x={157} y={32} width={29} height={14} rx={2} fill={GLASS} opacity={0.92} />
      <path d="M196 31 L210 46 L196 46 Z" fill={GLASS} opacity={0.92} />
      {/* Headlight + front bumper */}
      <rect x={206} y={52} width={7} height={5} rx={1} fill={AMBER} />
      <rect x={210} y={60} width={8} height={7} rx={1} fill={pal.frame} />

      {AXLES.map((cx) => (
        <Wheel
          key={cx}
          cx={cx}
          animated={animated}
          driving={driving}
          spinSeconds={spinSeconds}
          pal={pal}
        />
      ))}
    </svg>
  )
}

export function DrivingTruck({
  className = '',
  tone = 'light',
}: {
  className?: string
  /** `dark` for the truck sitting over the hero photograph. */
  tone?: TruckTone
}) {
  const pal = PALETTES[tone]
  const trackRef = useRef<HTMLDivElement>(null)
  const truckRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ track: 0, truck: 0 })
  const mounted = useIsHydrated()
  const reduce = usePrefersReducedMotion()
  const inView = useInView(trackRef, { margin: '150px 0px' })

  // Measure the lane and the truck so the travel distance is exact at any
  // viewport: the truck starts exactly one truck-width off the left edge and
  // finishes exactly at the right edge, with no guessed percentages.
  //
  // Runs after `mounted` so it observes the post-swap element, which then stays
  // put for the life of the component — an observer attached to an element that
  // later unmounts reports width 0 forever, which is what stalled this before.
  useEffect(() => {
    if (!mounted) return
    const track = trackRef.current
    const truck = truckRef.current
    if (!track || !truck) return
    const measure = () => setDims({ track: track.offsetWidth, truck: truck.offsetWidth })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    ro.observe(truck)
    return () => ro.disconnect()
  }, [mounted])

  const measured = dims.track > 0 && dims.truck > 0
  const driving = mounted && !reduce && inView && measured

  const travelSeconds = (dims.track + dims.truck) / SPEED
  // One wheel rotation per circumference travelled, at the truck's rendered size.
  const wheelPx = WHEEL_R * (dims.truck / VIEW.w)
  const spinSeconds = wheelPx > 0 ? (2 * Math.PI * wheelPx) / SPEED : 1

  // Parked: reduced-motion sits it on the road in plain view; everyone else
  // waits just off the left edge so the first pass drives in cleanly instead of
  // popping into view mid-lane.
  const parkedX = reduce ? 0 : -(dims.truck || TRUCK_W_FALLBACK)

  return (
    <div className={className}>
      <div ref={trackRef} className="relative overflow-hidden">
        {mounted ? (
          <motion.div
            ref={truckRef}
            className="w-fit"
            style={{ willChange: 'transform' }}
            initial={false}
            animate={driving ? { x: [-dims.truck, dims.track] } : { x: parkedX }}
            transition={
              driving
                ? {
                    duration: travelSeconds,
                    ease: 'linear',
                    repeat: Infinity,
                    repeatType: 'loop',
                    repeatDelay: LOOP_GAP,
                  }
                : { duration: 0 }
            }
          >
            <TruckArt animated driving={driving} spinSeconds={spinSeconds} pal={pal} />
          </motion.div>
        ) : (
          <div ref={truckRef} className="w-fit" style={{ transform: 'translateX(-110%)' }}>
            <TruckArt animated={false} driving={false} spinSeconds={1} pal={pal} />
          </div>
        )}
      </div>
      {/* The road the truck sits on */}
      <div
        aria-hidden="true"
        className={`h-px w-full ${tone === 'dark' ? 'bg-bone/25' : 'bg-chalk'}`}
      />
    </div>
  )
}
