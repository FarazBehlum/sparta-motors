import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { InventoryView } from '@/components/inventory/InventoryView'
import { CATEGORY_TO_BODY_TYPE, bodyTypeLabel } from '@/lib/format'
import type { RawParams } from '@/lib/trucks'

type Params = { category: string }

// Only the six slugs from generateStaticParams are real routes; anything else
// 404s at the router, before rendering starts.
//
// This replaced `export const dynamic = 'force-dynamic'`. Under force-dynamic
// the response streams before the in-render notFound() below can set a status,
// so /inventory/anything answered HTTP 200 with 404 content — a soft 404 that
// invites Google to index unlimited junk URLs. dynamicParams has no effect
// while force-dynamic is set, so the directive had to go.
//
// Dropping it does NOT make this page static: it reads searchParams, which
// opts the route into dynamic rendering on its own. Verified in the production
// build output — the route is still listed as ƒ (Dynamic).
export const dynamicParams = false

/** Pre-register the six known category slugs. */
export function generateStaticParams(): Params[] {
  return Object.keys(CATEGORY_TO_BODY_TYPE).map((category) => ({ category }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { category } = await params
  const bodyType = CATEGORY_TO_BODY_TYPE[category]
  if (!bodyType) return {}
  const label = bodyTypeLabel(bodyType)
  return {
    title: `Used ${label}s for Sale`,
    description: `Used ${label.toLowerCase()}s from Isuzu, Hino, Freightliner and more. Real mileage, inspected on the lot. Spartanburg, SC.`,
    alternates: { canonical: `/inventory/${category}` },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<RawParams>
}) {
  const { category } = await params
  if (!CATEGORY_TO_BODY_TYPE[category]) notFound()
  const sp = await searchParams
  return <InventoryView params={sp} category={category} />
}
