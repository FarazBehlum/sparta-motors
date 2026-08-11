import React from 'react'
import type { Metadata } from 'next'
import { getFeaturedTrucks, getPublishedTrucks, computeFacets } from '@/lib/trucks'
import { getSettings } from '@/lib/payload'
import { jsonLdScript, organizationJsonLd } from '@/lib/structured-data'
import { Hero } from '@/components/home/Hero'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { FeaturedInventory } from '@/components/home/FeaturedInventory'
import { HowWeWork } from '@/components/home/HowWeWork'
import { VisitUs } from '@/components/home/VisitUs'
import { PartsCTA } from '@/components/home/PartsCTA'
import { addressLines, coords } from '@/lib/location'

const DESCRIPTION =
  'Used commercial trucks for working businesses. Box trucks, reefers, day cabs, dump trucks, tow rigs. Spartanburg, SC. Est. 2018.'

// Home keeps the layout's default (untemplated) title; only description + OG here.
export const metadata: Metadata = {
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Sparta Motors — Used Commercial Trucks in Spartanburg, SC',
    description: DESCRIPTION,
    type: 'website',
  },
}

export default async function HomePage() {
  const [trucks, featured, settings] = await Promise.all([
    getPublishedTrucks(),
    getFeaturedTrucks(6),
    getSettings(),
  ])
  const facets = computeFacets(trucks)
  const lines = addressLines(settings)
  const { lat, lng } = coords(settings)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd(settings)) }}
      />
      <Hero />
      {/* StatsBar is intentionally not rendered. With one truck in stock it read
          "01 / 01 / 01", which undersells the business — restore it once the real
          inventory is loaded and the numbers work in our favour. */}
      <CategoryGrid counts={facets.body} />
      <FeaturedInventory trucks={featured} />
      <HowWeWork />
      <VisitUs
        lat={lat}
        lng={lng}
        addressLines={lines}
        phone={settings.phone}
        hoursMonFri={settings.hoursMonFri}
        hoursSat={settings.hoursSat}
        hoursSun={settings.hoursSun}
      />
      <PartsCTA />
    </>
  )
}
