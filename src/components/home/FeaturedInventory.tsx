import React from 'react'
import Link from 'next/link'
import type { Truck } from '@/payload-types'
import { Container } from '@/components/Container'
import { SectionLabel } from '@/components/SectionLabel'
import { TruckCard } from '@/components/TruckCard'
import { FadeInSection } from './FadeInSection'

/** "On the lot now." — up to 6 featured/recent trucks + link to full inventory. */
export function FeaturedInventory({ trucks }: { trucks: Truck[] }) {
  if (trucks.length === 0) return null

  return (
    <section className="bg-warm-white">
      <Container width="wide" className="py-14 md:py-20">
        <FadeInSection>
          <SectionLabel>Featured inventory</SectionLabel>
          <h2 className="mt-2 font-barlow text-4xl font-bold uppercase tracking-tight text-sparta-black md:text-5xl">
            On the lot now.
          </h2>
          <p className="mt-3 max-w-xl font-inter text-iron">
            Recent additions. See the full inventory for everything we have.
          </p>
        </FadeInSection>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {trucks.map((truck, i) => (
            <FadeInSection key={truck.id} delay={i * 60}>
              <TruckCard truck={truck} />
            </FadeInSection>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/inventory"
            className="inline-flex items-center gap-2 font-barlow text-lg font-bold uppercase tracking-wider text-sparta-black transition-colors hover:text-orange"
          >
            See all inventory <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </section>
  )
}
