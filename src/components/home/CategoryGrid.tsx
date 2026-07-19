import React from 'react'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { SectionLabel } from '@/components/SectionLabel'
import { FadeInSection } from './FadeInSection'

// Order matches build-brief/03-sitemap-routing.md.
const CATEGORIES: { num: string; name: string; slug: string; body: string }[] = [
  { num: '01', name: 'Box Trucks', slug: 'box-trucks', body: 'box-truck' },
  { num: '02', name: 'Reefers', slug: 'reefers', body: 'reefer' },
  { num: '03', name: 'Day Cabs', slug: 'day-cabs', body: 'day-cab' },
  { num: '04', name: 'Flat Beds', slug: 'flat-beds', body: 'flat-bed' },
  { num: '05', name: 'Dump Trucks', slug: 'dump-trucks', body: 'dump-truck' },
  { num: '06', name: 'Tow Trucks', slug: 'tow-trucks', body: 'tow-truck' },
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
                  className="group flex h-full flex-col justify-between rounded-lg border border-transparent bg-sparta-black p-5 transition-colors duration-150 hover:border-orange md:p-7"
                >
                  <span className="font-mono text-sm text-orange transition-colors duration-150 group-hover:text-bone">
                    {cat.num}
                  </span>
                  <div className="mt-10 md:mt-16">
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
