import React from 'react'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { FadeInSection } from './FadeInSection'

/** Full-width orange strip driving to the informational Parts page. Keeps users
 *  on-site first; they convert to the Shopify store from /parts. */
export function PartsCTA() {
  return (
    <section className="bg-orange text-sparta-black">
      <Container width="wide" className="py-14 md:py-16">
        <FadeInSection className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-sparta-black/70">
              <span aria-hidden="true">◆ </span>Parts
            </p>
            <h2 className="mt-2 font-barlow text-4xl font-bold uppercase leading-[0.95] tracking-tight md:text-5xl">
              Need parts? We stock tested used OEM parts.
            </h2>
            <p className="mt-4 font-inter leading-relaxed text-sparta-black/80">
              Tested OEM parts pulled from dismantled vehicles, shipped nationwide. Browse and buy
              through our online parts store.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/parts"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded bg-sparta-black px-6 py-3 font-barlow text-sm font-bold uppercase tracking-wider text-bone transition-colors duration-150 hover:bg-charcoal"
            >
              Shop Parts →
            </Link>
          </div>
        </FadeInSection>
      </Container>
    </section>
  )
}
