import React from 'react'
import type { Metadata } from 'next'
import { PageStub } from '@/components/PageStub'

export const metadata: Metadata = {
  title: 'Inventory',
  description:
    'Browse used commercial trucks in stock — box trucks, reefers, day cabs, flatbeds, dump trucks, and tow trucks.',
}

export default function InventoryPage() {
  return (
    <PageStub
      label="Inventory"
      title="On the lot now."
      description="The full inventory browse — filters, category pages, and the truck grid — is built in the next phase."
    />
  )
}
