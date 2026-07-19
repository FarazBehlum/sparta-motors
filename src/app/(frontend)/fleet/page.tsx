import React from 'react'
import type { Metadata } from 'next'
import { PageStub } from '@/components/PageStub'

export const metadata: Metadata = {
  title: 'Fleet & Bulk Sourcing',
  description:
    'We source used commercial trucks for small fleets and growing businesses. Tell us the spec — we find it as trucks come available.',
}

export default function FleetPage() {
  return (
    <PageStub
      label="Fleet & Bulk Inquiries"
      title="Growing your fleet? Tell us what you need."
      description="The fleet sourcing page and inquiry form are part of the content-pages build."
    />
  )
}
