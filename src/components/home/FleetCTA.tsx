import React from 'react'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { FadeInSection } from './FadeInSection'

/** Full-width orange strip driving fleet/bulk inquiries. */
export function FleetCTA() {
  return (
    <section className="bg-orange text-sparta-black">
      <Container width="wide" className="py-14 md:py-16">
        <FadeInSection className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-sparta-black/70">
              <span aria-hidden="true">◆ </span>Fleet &amp; bulk inquiries
            </p>
            <h2 className="mt-2 font-barlow text-4xl font-bold uppercase leading-[0.95] tracking-tight md:text-5xl">
              Growing your fleet? Tell us what you need.
            </h2>
            <p className="mt-4 font-inter leading-relaxed text-sparta-black/80">
              We source used commercial trucks for small fleets and growing businesses. Tell us the
              spec — we&apos;ll find it as trucks come available.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/fleet"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded bg-sparta-black px-6 py-3 font-barlow text-sm font-bold uppercase tracking-wider text-bone transition-colors duration-150 hover:bg-charcoal"
            >
              Start fleet inquiry →
            </Link>
          </div>
        </FadeInSection>
      </Container>
    </section>
  )
}
