import React from 'react'
import type { Metadata } from 'next'
import { PageStub } from '@/components/PageStub'

export const metadata: Metadata = {
  title: 'Financing',
  description:
    'Commercial truck financing help. We connect working businesses with commercial lenders. Start a quick pre-qualification.',
}

export default function FinancingPage() {
  return (
    <PageStub
      label="Financing"
      title="Financing help for working trucks."
      description="The financing explainer and pre-qualification form are part of the content-pages build."
    />
  )
}
