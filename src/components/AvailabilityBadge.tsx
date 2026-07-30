import React from 'react'
import type { Truck } from '@/payload-types'

export type Availability = NonNullable<Truck['availability']>

/**
 * Sale-state badge. `available` renders nothing on purpose — most trucks are
 * available, so badging every one of them would make the state meaningless and
 * add noise to the inventory grid. Only the exceptions get called out.
 */
const STYLES: Record<Exclude<Availability, 'available'>, { label: string; cls: string }> = {
  pending: {
    label: 'Sale Pending',
    cls: 'bg-orange text-sparta-black',
  },
  sold: {
    label: 'Sold',
    cls: 'bg-sparta-black text-bone',
  },
}

export function AvailabilityBadge({
  availability,
  className = '',
}: {
  availability?: Availability | null
  className?: string
}) {
  if (!availability || availability === 'available') return null
  const s = STYLES[availability]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-barlow text-[11px] font-bold uppercase tracking-wider shadow-sm ${s.cls} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {s.label}
    </span>
  )
}

/** True when the truck can no longer be bought. */
export function isSold(truck: Pick<Truck, 'availability'>): boolean {
  return truck.availability === 'sold'
}
