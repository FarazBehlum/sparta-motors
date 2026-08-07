import React from 'react'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { DrivingTruck } from './DrivingTruck'

/**
 * Home hero — a full-bleed photograph with the brand wordmark and the headline
 * over the top. A light band directly below carries the ambient driving truck
 * and the two CTAs.
 *
 * This replaced the 300vh scroll-scrubbed canvas sequence from
 * build-brief/hero-video.md. That version cost three screens of scrolling
 * before the first CTA, shipped 6.2MB of frames (which showed a soft poster
 * until they decoded), and used scroll-snap that fought the user's scrolling.
 * The only motion left is <DrivingTruck>, which is independent of scroll.
 *
 * The photo runs edge to edge deliberately: it is the one element on the page
 * that is not held inside <Container width="wide">. Everything written over it
 * still sits in that container, so the text lines up with every section below.
 */

/**
 * Swap point for the hero photograph — replace this one file to change it and
 * nothing else moves. Now the client's own fleet photo (six Isuzus at sunset).
 *
 * ⚠️ It is 1421px wide, well under the 2400px this slot wants. Displayed
 * full-bleed it gets upscaled ~1.8x on a 2560px monitor and goes visibly soft.
 * Ask the client for the original before launch — no amount of processing
 * recovers detail that isn't in the file.
 *
 * What a replacement needs to be: landscape, 2400px wide or more, and busy
 * detail kept out of the upper-left where the wordmark and headline sit.
 * Stored at native size and uncropped on purpose — `bg-cover` does the cropping
 * per viewport, so baking one crop in would break the other shapes.
 */
const HERO_PHOTO = '/hero/hero-main.webp'

export function Hero() {
  return (
    <section aria-label="Sparta Motors">
      {/* Photo band */}
      <div className="relative isolate overflow-hidden bg-sparta-black">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_PHOTO})` }}
        />
        {/* Scrim. Direction is responsive, because the type sits differently
            relative to the subject at each size.

            Desktop: horizontal, heaviest on the left where the type is, fading
            right so the photograph still reads.

            Mobile: horizontal does nothing useful — `bg-cover` crops the photo
            to its centre and the type spans the full width, so it lands
            directly on the brightest part of the picture (the white truck
            fronts). Vertical instead, holding ~82% down to 75% of the height,
            which is below the last line of copy.

            Both were raised when the client's own fleet photo replaced the
            previous placeholder: that image is far brighter (sunset sky, white
            trucks, wet reflective tarmac) and the old values dropped the lead
            paragraph to 1.34:1 on mobile. Measured worst cases now — headline
            9.97:1 mobile / 10.41:1 desktop, lead 4.79:1 / 5.69:1. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-sparta-black/88 via-sparta-black/82 via-75% to-sparta-black/40 md:bg-gradient-to-r md:from-sparta-black/95 md:via-sparta-black/85 md:via-55% md:to-sparta-black/55"
        />

        <Container
          width="wide"
          className="relative flex min-h-[70svh] flex-col justify-center py-14 md:py-20 lg:min-h-[min(70svh,620px)]"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-orange md:text-[11px]">
            <span aria-hidden="true">◆ </span>
            EST. 2018 · Spartanburg, SC
          </p>

          {/* Brand wordmark — the display moment. The h1 below stays the page's
              real heading, so search engines still lead with what we sell. */}
          <p className="mt-5 font-barlow text-[clamp(3rem,11vw,8rem)] font-extrabold uppercase leading-[0.85] tracking-tighter text-bone">
            Sparta <span className="text-orange">Motors</span>
          </p>

          <h1 className="mt-8 max-w-3xl font-barlow text-[clamp(1.75rem,3.6vw,2.75rem)] font-extrabold uppercase leading-[0.98] tracking-tight text-bone md:mt-10">
            Used commercial trucks for working businesses.
          </h1>
          <p className="mt-4 max-w-xl font-inter text-base leading-relaxed text-concrete md:text-lg">
            Box trucks, reefers, day cabs, dump trucks, tow rigs. Every truck inspected before it
            goes on the lot.
          </p>
        </Container>
      </div>

      {/* Truck + CTAs below the photo. The truck drives across the warm band and
          its road doubles as the rule above the buttons, so the motion leads the
          eye down into the CTAs instead of competing with the headline for
          attention the way it did when it sat under the wordmark. `light` tone
          because this band is bone, not the dark photograph. */}
      <div className="bg-hero-warm">
        <Container width="wide" className="py-6 md:py-8">
          <DrivingTruck className="mb-6 md:mb-8" tone="light" />
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/inventory">Browse inventory →</Button>
            <Button href="/parts" variant="ghost">
              Shop Parts
            </Button>
          </div>
        </Container>
      </div>
    </section>
  )
}
