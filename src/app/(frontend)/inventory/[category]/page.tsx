import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { InventoryView } from '@/components/inventory/InventoryView'
import { CATEGORY_TO_BODY_TYPE, bodyTypeLabel } from '@/lib/format'
import type { RawParams } from '@/lib/trucks'

type Params = { category: string }

export const dynamic = 'force-dynamic'

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
