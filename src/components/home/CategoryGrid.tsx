import React from 'react'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { SectionLabel } from '@/components/SectionLabel'
import { FadeInSection } from './FadeInSection'

// Order matches build-brief/03-sitemap-routing.md.
// `image` is a placeholder for now — all six reuse the hero poster so the tiles
// don't look empty. To use real per-category photos later: drop files in e.g.
// public/categories/box-trucks.jpg and set `image: '/categories/box-trucks.jpg'`.
const PLACEHOLDER_IMG = '/hero/poster.jpg'

const CATEGORIES: { num: string; name: string; slug: string; body: string; image: string; pos: string }[] = [
  { num: '01', name: 'Box Trucks', slug: 'box-trucks', body: 'box-truck', image: PLACEHOLDER_IMG, pos: 'center' },
  { num: '02', name: 'Reefers', slug: 'reefers', body: 'reefer', image: PLACEHOLDER_IMG, pos: 'left center' },
  { num: '03', name: 'Day Cabs', slug: 'day-cabs', body: 'day-cab', image: PLACEHOLDER_IMG, pos: 'right center' },
  { num: '04', name: 'Flat Beds', slug: 'flat-beds', body: 'flat-bed', image: PLACEHOLDER_IMG, pos: 'center 30%' },
  { num: '05', name: 'Dump Trucks', slug: 'dump-trucks', body: 'dump-truck', image: PLACEHOLDER_IMG, pos: 'center 75%' },
  { num: '06', name: 'Tow Trucks', slug: 'tow-trucks', body: 'tow-truck', image: PLACEHOLDER_IMG, pos: 'left 40%' },
]

/** "Shop by body type" — six dark category tiles linking to category pages. */
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
                  {/* Placeholder photo (see PLACEHOLDER_IMG) — dimmed so text stays legible. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-cover opacity-40 transition-transform duration-300 ease-out group-hover:scale-105"
                    style={{ backgroundImage: `url(${cat.image})`, backgroundPosition: cat.pos }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-sparta-black via-sparta-black/75 to-sparta-black/30"
                  />

                  <span className="relative z-10 font-mono text-sm text-orange transition-colors duration-150 group-hover:text-bone">
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
