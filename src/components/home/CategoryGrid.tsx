import React from 'react'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { SectionLabel } from '@/components/SectionLabel'
import { FadeInSection } from './FadeInSection'

// Order matches build-brief/03-sitemap-routing.md.
// Per-category studio photos live in public/categories/*.webp (optimized from the
// source PNGs in "Vehical Type Images/"). To swap one, replace the file and keep
// the same name, or update `image` below.
const CATEGORIES: { num: string; name: string; slug: string; body: string; image: string; pos: string }[] = [
  { num: '01', name: 'Box Trucks', slug: 'box-trucks', body: 'box-truck', image: '/categories/box-trucks.webp', pos: 'center' },
  { num: '02', name: 'Reefers', slug: 'reefers', body: 'reefer', image: '/categories/reefers.webp', pos: 'center' },
  { num: '03', name: 'Landscapers', slug: 'landscapers', body: 'landscaper', image: '/categories/landscapers.webp', pos: 'center' },
  { num: '04', name: '26ft Box Trucks', slug: '26ft-box-trucks', body: '26ft-box-truck', image: '/categories/26ft-box-trucks.webp', pos: 'center' },
  { num: '05', name: 'Dump Trucks', slug: 'dump-trucks', body: 'dump-truck', image: '/categories/dump-trucks.webp', pos: 'center' },
  { num: '06', name: 'Tow Trucks', slug: 'tow-trucks', body: 'tow-truck', image: '/categories/tow-trucks.webp', pos: 'center' },
  { num: '07', name: 'Tank Trucks', slug: 'tank-trucks', body: 'tank-truck', image: '/categories/tank-trucks.webp', pos: 'center' },
  { num: '08', name: 'Garbage Trucks', slug: 'garbage-trucks', body: 'garbage-truck', image: '/categories/garbage-trucks.webp', pos: 'center' },
  { num: '09', name: 'Specialty Trucks', slug: 'specialty-trucks', body: 'specialty-truck', image: '/categories/specialty-trucks.webp', pos: 'center' },
]

/** "Shop by body type" — nine dark category tiles linking to category pages. */
export function CategoryGrid({ counts }: { counts: Record<string, number> }) {
  return (
    <section className="bg-bone">
      <Container width="wide" className="py-14 md:py-20">
        <FadeInSection>
          <SectionLabel>Shop by body type</SectionLabel>
          <h2 className="mt-2 font-barlow text-4xl font-bold uppercase tracking-tight text-sparta-black md:text-5xl">
            Find the right truck.
          </h2>
        </FadeInSection>

        <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-5">
          {CATEGORIES.map((cat, i) => {
            const count = counts[cat.body] ?? 0
            return (
              <FadeInSection key={cat.slug} delay={i * 60}>
                <Link
                  href={`/inventory/${cat.slug}`}
                  className="group relative flex h-full min-h-[190px] flex-col justify-between overflow-hidden rounded-lg border border-transparent bg-sparta-black p-5 transition-colors duration-150 hover:border-orange md:min-h-[240px] md:p-7"
                >
                  {/* Category photo — full-strength so the truck reads; bottom
                      gradient keeps the heading legible over it. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    style={{ backgroundImage: `url(${cat.image})`, backgroundPosition: cat.pos }}
                  />
                  {/* Scrim, kept only as dark as the heading actually needs so
                      the truck reads as clearly as possible.

                      The heading is bone text over a white truck body in the
                      worst case, which needs ~60% black over it to clear 4.5:1
                      (measured, not guessed). So the gradient holds ≥60% across
                      the text band and then falls away to nothing.

                      Responsive because the band depends on whether the longest
                      label wraps. "26ft Box Trucks" takes two lines and reaches
                      ~53% of tile height; one line ends at 36%. Measured across
                      widths, the wrap is NOT a simple mobile/desktop split:

                        390px  tile 171  2 lines   <- 2-col, narrow
                        640px  tile 296  1 line
                        768px  tile 216  2 lines   <- 3-col starts, tiles SHRINK
                        900px+ tile 260+ 1 line

                      It comes back at 768 because md: switches to three columns
                      and each tile gets narrower than it was at 640. So the
                      lighter curve is gated on lg:, the first breakpoint where
                      tiles are wide enough that nothing wraps — using md: here
                      leaves the 768–900 range unreadable (measured 2.55:1). */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-sparta-black/85 via-sparta-black/62 via-55% to-transparent to-90% lg:from-sparta-black/90 lg:via-sparta-black/60 lg:via-40% lg:to-80%"
                  />

                  <span className="relative z-10 font-mono text-sm text-orange [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] transition-colors duration-150 group-hover:text-bone">
                    {cat.num}
                  </span>
                  <div className="relative z-10 mt-10 md:mt-16">
                    <h3 className="font-barlow text-2xl font-bold uppercase leading-tight tracking-tight text-bone md:text-3xl">
                      {cat.name}
                    </h3>
                    <p className="mt-1 font-mono text-xs uppercase tracking-wider text-concrete">
                      {count} {count === 1 ? 'truck' : 'trucks'}
                    </p>
                  </div>
                </Link>
              </FadeInSection>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
