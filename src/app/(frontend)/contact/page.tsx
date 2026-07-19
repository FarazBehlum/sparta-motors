import React from 'react'
import type { Metadata } from 'next'
import { PageStub } from '@/components/PageStub'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Visit the lot, call, or send a message. Sparta Motors used commercial trucks.',
}

export default function ContactPage() {
  return (
    <PageStub
      label="Contact"
      title="Come see the trucks."
      description="The Contact page — address, hours, full-width map, and contact form — is part of the content-pages build."
    />
  )
}
