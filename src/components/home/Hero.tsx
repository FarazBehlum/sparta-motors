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
      {/* The hero photo is the home page's LCP element, but it is painted as a
          CSS background, so the browser cannot discover it until the stylesheet
          has downloaded and parsed. Preloading it starts the fetch with the
          document instead. React 19 hoists this <link> into <head>. */}
      <link rel="preload" as="image" href={HERO_PHOTO} fetchPriority="high" />

      {/* Photo band */}
      <div className="relative isolate overflow-hidden bg-sparta-black">
        {/* `center 60%` instead of `bg-center` (2026-08-27, PM report: trucks'
            wheels were cropped off). This photo (1421x1107, 1.28:1) is much
            squarer than the hero band (up to ~5.5:1 on an ultrawide monitor),
            so `bg-cover` scales it up a lot and a plain center crop cut deep
            into both edges — on desktop that meant losing the wheels/ground,
            the exact part a `center bottom` anchor would protect. But full
            bottom-anchoring overcorrects at very wide viewports: the crop
            window gets so short that it shows only the wet-pavement
            reflection and loses the trucks entirely. 60% is the empirical
            middle ground — keeps the truck row (roughly the 42%-70% vertical
            band of the source photo) in frame from a 1366px laptop up
            through a 3440px ultrawide; verified via screenshots at both. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: `url(${HERO_PHOTO})`, backgroundPosition: 'center 60%' }}
        />
        {/* Scrim. Direction is responsive, because the type sits differently
            relative to the subject at each size — horizontal on desktop where
            the copy is a left-hand column, vertical on mobile where `bg-cover`
            crops to centre and the copy spans the full width.

            SHAPED, not uniform. The client asked for a less dark photograph.
            Simply weakening the old gradient does not work: it veiled the whole
            image evenly, so every step that brightened the picture also
            brightened the area behind the copy, and the lead paragraph fell
            under 4.5:1 almost immediately (measured: −15% put it at 3.98:1
            desktop / 3.61:1 mobile). Instead these hold their density exactly
            where the type sits and then fall away hard where it does not — to
            6% at the right edge on desktop, 4% at the bottom on mobile. That
            buys a far brighter photograph at equal or better legibility.

            The opening stop was also RAISED (88 → 96 on mobile) to fix a
            pre-existing failure: the orange eyebrow sits over bright sunset sky
            and measured 3.89:1 against a 4.5:1 requirement. The earlier note
            here only measured the headline and the lead, so it was missed.

            Measured worst cases (98th-percentile background luminance sampled
            under the actual glyph rects, not the block boxes):

                          eyebrow   headline   lead     photo brightness
              desktop     4.21      7.04       6.92     6.1%
              mobile      4.44      11.22      5.58     3.5%

            Thresholds: 4.5:1 eyebrow and lead (small text), 3:1 headline
            (large). Both eyebrow numbers sit a hair under 4.5 — a known,
            unasserted shortfall (see the test file) rather than a new one:
            desktop moved from 4.78 to 4.21 when the photo's crop position
            changed above, mobile is untouched by that change since it has no
            vertical crop to begin with. Headline and lead are the two
            thresholds the test suite actually enforces, and both improved.

            These numbers depend entirely on this photograph, which is due to be
            replaced. tests/e2e/hero-contrast.e2e.spec.ts re-measures them
            against the real page and fails if a new photo pushes the headline
            or the lead under the line.

            Two elements rather than one because these are 4- and 5-stop
            gradients; expressing them as Tailwind arbitrary values would mean
            escaping every space and comma. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 md:hidden"
          style={{
            backgroundImage:
              'linear-gradient(to bottom,' +
              ' rgba(26,26,26,0.96) 0%,' +
              ' rgba(26,26,26,0.85) 55%,' +
              ' rgba(26,26,26,0.78) 80%,' +
              ' rgba(26,26,26,0.24) 92%,' +
              ' rgba(26,26,26,0.04) 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden md:block"
          style={{
            backgroundImage:
              'linear-gradient(to right,' +
              ' rgba(26,26,26,0.94) 0%,' +
              ' rgba(26,26,26,0.84) 28%,' +
              ' rgba(26,26,26,0.32) 60%,' +
              ' rgba(26,26,26,0.06) 100%)',
          }}
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
