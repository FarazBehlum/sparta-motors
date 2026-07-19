import React from 'react'
import type { Metadata } from 'next'
import { getFeaturedTrucks, getPublishedTrucks, computeFacets } from '@/lib/trucks'
import { getSettings } from '@/lib/payload'
import { Hero } from '@/components/home/Hero'
import { StatsBar, type Stat } from '@/components/home/StatsBar'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { FeaturedInventory } from '@/components/home/FeaturedInventory'
import { HowWeWork } from '@/components/home/HowWeWork'
import { FleetCTA } from '@/components/home/FleetCTA'

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

const pad2 = (n: number) => String(n).padStart(2, '0')

export default async function HomePage() {
  const [trucks, featured, settings] = await Promise.all([
    getPublishedTrucks(),
    getFeaturedTrucks(6),
    getSettings(),
  ])
  const facets = computeFacets(trucks)

  const stats: Stat[] = [
    { label: 'On the lot', value: pad2(trucks.length), lead: true },
    { label: 'Body types', value: pad2(Object.keys(facets.body).length) },
    { label: 'Brands', value: pad2(Object.keys(facets.make).length) },
    { label: 'Est.', value: '2018' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(settings)) }}
      />
      <Hero />
      <StatsBar stats={stats} />
      <CategoryGrid counts={facets.body} />
      <FeaturedInventory trucks={featured} />
      <HowWeWork />
      <FleetCTA />
    </>
  )
}

/** Organization + AutoDealer (LocalBusiness) JSON-LD, built from Settings. */
function structuredData(settings: Awaited<ReturnType<typeof getSettings>>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const a = settings.address
  const address = a
    ? {
        '@type': 'PostalAddress',
        streetAddress: [a.line1, a.line2].filter(Boolean).join(', ') || undefined,
        addressLocality: a.city || undefined,
        addressRegion: a.state || undefined,
        postalCode: a.zip || undefined,
        addressCountry: 'US',
      }
    : undefined
  const geo =
    a?.latitude != null && a?.longitude != null
      ? { '@type': 'GeoCoordinates', latitude: a.latitude, longitude: a.longitude }
      : undefined

  const org = {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: settings.siteName || 'Sparta Motors',
    url: siteUrl,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    address,
    sameAs: [settings.socialFacebook, settings.socialInstagram].filter(Boolean),
  }

  const dealer = {
    '@type': 'AutoDealer',
    '@id': `${siteUrl}/#dealer`,
    name: settings.siteName || 'Sparta Motors',
    url: siteUrl,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    address,
    geo,
    parentOrganization: { '@id': `${siteUrl}/#organization` },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
    ],
  }

  return { '@context': 'https://schema.org', '@graph': [org, dealer] }
}
