import React from 'react'
import type { Metadata } from 'next'
import { InventoryView } from '@/components/inventory/InventoryView'
import type { RawParams } from '@/lib/trucks'

export const metadata: Metadata = {
  title: 'Used Commercial Trucks for Sale',
  description:
    'Browse used commercial trucks in Spartanburg, SC. Box trucks, reefers, day cabs, dump trucks, and more from Isuzu, Hino, Freightliner. Real mileage, honest specs, inspected.',
  alternates: { canonical: '/inventory' },
}

// URL-param driven — render on demand.
export const dynamic = 'force-dynamic'

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>
}) {
  const params = await searchParams
  return <InventoryView params={params} />
}
