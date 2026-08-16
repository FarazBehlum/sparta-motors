import React from 'react'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/content/PageHeader'
import { ContentSection } from '@/components/content/ContentSection'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { FadeInSection } from '@/components/home/FadeInSection'

const SHOPIFY_STORE = 'https://spartamotorsllc.com/'

export const metadata: Metadata = {
  // The layout applies the "%s · Sparta Motors" template, so this renders as
  // "Parts · Sparta Motors" (consistent with the other content pages).
  title: 'Parts',
  description:
    'Tested used OEM truck parts pulled from dismantled vehicles, shipped nationwide. Secure checkout and 30-day returns through the Sparta Motors online parts store.',
  alternates: { canonical: '/parts' },
}

/** Value props — short, honest, one supporting line each. Reuses the dark
 *  three-pillar card pattern from the homepage "How we work" strip. */
const VALUE_PROPS: { title: string; body: string }[] = [
  {
    title: 'Tested OEM parts',
    body: 'Genuine parts pulled from dismantled vehicles and checked before they go up for sale.',
  },
  {
    title: 'Fast nationwide shipping',
    body: 'Ordered parts ship anywhere in the country, packed, tracked, and on the way.',
  },
  {
    title: 'Secure checkout · 30-day returns',
    body: 'Buy safely through our online store, backed by a 30-day return window.',
  },
]

export default function PartsPage() {
  return (
    <>
      <PageHeader
        watermark="Parts"
        breadcrumb="Parts"
        label="Parts"
        title="Need parts? We stock tested used OEM parts."
        subtitle="Beyond trucks, Sparta Motors runs a full used-parts operation. We pull tested OEM parts from dismantled vehicles and ship them nationwide. Browse and buy through our online parts store."
      />

      <ContentSection
        tone="dark"
        label="Why buy from us"
        title="Real parts. Real testing. Shipped to you."
        lead="Same standard as our trucks. Nothing gets listed without being checked first."
      >
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {VALUE_PROPS.map((prop, i) => (
            <FadeInSection key={prop.title} delay={i * 60}>
              <div className="border-t border-charcoal pt-5">
                <span className="font-mono text-sm text-orange" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 font-barlow text-2xl font-bold uppercase leading-tight tracking-tight text-bone">
                  {prop.title}
                </h3>
                <p className="mt-3 font-inter leading-relaxed text-concrete">{prop.body}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </ContentSection>

      {/* Full-width orange strip driving out to the Shopify parts store. */}
      <section className="bg-orange text-sparta-black">
        <Container width="wide" className="py-14 md:py-16">
          <FadeInSection className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-sparta-black/70">
                <span aria-hidden="true">◆ </span>Parts store
              </p>
              <h2 className="mt-2 font-barlow text-4xl font-bold uppercase leading-[0.95] tracking-tight md:text-5xl">
                Browse the full parts catalog.
              </h2>
              <p className="mt-4 font-inter leading-relaxed text-sparta-black/80">
                Our parts inventory lives in a dedicated online store. Search by part, check
                availability, and check out securely.
              </p>
            </div>
            <div className="shrink-0">
              <Button
                href={SHOPIFY_STORE}
                variant="dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                Shop Parts →
              </Button>
            </div>
          </FadeInSection>
        </Container>
      </section>
    </>
  )
}
