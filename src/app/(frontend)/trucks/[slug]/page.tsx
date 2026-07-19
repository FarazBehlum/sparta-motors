import React from 'react'
import type { Metadata } from 'next'
import { PageStub } from '@/components/PageStub'

type Params = { slug: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  return { title: slug }
}

export default async function TruckDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  return (
    <PageStub
      label="Truck Detail"
      title="The money page."
      description={`Individual truck listing (/trucks/${slug}) — photo gallery, specs, VIN, inquiry form, and similar trucks. Built after the inventory grid.`}
    />
  )
}
