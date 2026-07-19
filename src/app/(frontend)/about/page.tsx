import React from 'react'
import type { Metadata } from 'next'
import { PageStub } from '@/components/PageStub'

export const metadata: Metadata = {
  title: 'About',
  description: 'Sparta Motors — used commercial truck dealer. Honest specs, inspected trucks.',
}

export default function AboutPage() {
  return (
    <PageStub
      label="About"
      title="Straight talk. Working trucks."
      description="The About page — the Sparta story, the lot, and how we work — is part of the content-pages build."
    />
  )
}
