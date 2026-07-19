import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageStub } from '@/components/PageStub'
import { CATEGORY_TO_BODY_TYPE, bodyTypeLabel } from '@/lib/format'

type Params = { category: string }

/** Pre-generate the six known category pages. */
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
  return { title: `${bodyTypeLabel(bodyType)}s` }
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params
  const bodyType = CATEGORY_TO_BODY_TYPE[category]
  if (!bodyType) notFound()

  return (
    <PageStub
      label={`Inventory · ${bodyTypeLabel(bodyType)}`}
      title={`${bodyTypeLabel(bodyType)}s.`}
      description="Category browse pages share the inventory template with the body-type filter pre-applied. Built alongside the main inventory page."
    />
  )
}
