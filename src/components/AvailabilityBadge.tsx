import React from 'react'
import { CircleCheck, CircleSlash, Clock, type LucideIcon } from 'lucide-react'
import type { Truck } from '@/payload-types'

export type Availability = NonNullable<Truck['availability']>

/**
 * Sale-state badge — green available / orange pending / dark sold.
 *
 * Each state carries an ICON as well as a colour and a word. Colour alone can't
 * be the signal: roughly 1 in 12 men has a colour-vision deficiency, and this
 * audience skews male, older, and often reading a phone in daylight on a lot.
 * The icon is the part that survives all of that, so it is not decoration.
 *
 * `available` is opt-in via `showAvailable`, and off by default. On a truck's
 * own page it's worth stating outright — a shopper looking at one listing wants
 * to be told it's still for sale. Across an inventory grid where nearly every
 * truck is available, a green badge on all of them turns into wallpaper and
 * stops the genuine exceptions (pending, sold) from standing out.
 */
/**
 * Each badge appears on two very different grounds: the bone page background on
 * a truck's own page, and directly over a photo on the inventory cards. Every
 * state is comfortably distinct on one of those and weak on the other:
 *
 *   available  6.44:1 on bone  ·  2.44:1 on a dark photo   <- weak on dark
 *   pending    2.75:1 on bone  ·  5.71:1 on a dark photo   <- weak on bone
 *   sold       8.70:1 on bone  ·  1.81:1 on a dark photo   <- weak on dark
 *
 * So the ring is per-state, and each one covers only its own weak ground: a
 * light ring where the badge risks sinking into a dark photo, a dark ring where
 * it risks washing out on bone. A single shared ring colour cannot do this.
 */
const STYLES: Record<Availability, { label: string; cls: string; Icon: LucideIcon }> = {
  available: {
    label: 'Available',
    cls: 'bg-status-available text-bone ring-bone/30',
    Icon: CircleCheck,
  },
  pending: {
    label: 'Sale Pending',
    cls: 'bg-status-pending text-sparta-black ring-sparta-black/25',
    Icon: Clock,
  },
  sold: {
    label: 'Sold',
    // Not an error or a failure — for the shopper it simply means "you can't
    // have this one", which is what a slashed circle says and a red X doesn't.
    cls: 'bg-status-sold text-bone ring-bone/35',
    Icon: CircleSlash,
  },
}

export function AvailabilityBadge({
  availability,
  className = '',
  showAvailable = false,
}: {
  availability?: Availability | null
  className?: string
  /** Render the green "Available" state too, instead of nothing. */
  showAvailable?: boolean
}) {
  if (!availability) return null
  if (availability === 'available' && !showAvailable) return null
  const { label, cls, Icon } = STYLES[availability]
  return (
    <span
      className={
        'inline-flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1 font-barlow ' +
        'text-xs font-bold uppercase leading-none tracking-wider shadow-sm ' +
        `ring-1 ${cls} ${className}`
      }
    >
      <Icon size={13} strokeWidth={2.5} className="shrink-0" aria-hidden="true" />
      {label}
    </span>
  )
}

/** True when the truck can no longer be bought. */
export function isSold(truck: Pick<Truck, 'availability'>): boolean {
  return truck.availability === 'sold'
}
