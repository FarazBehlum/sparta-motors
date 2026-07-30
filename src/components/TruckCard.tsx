import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Truck } from '@/payload-types'
import { bodyTypeLabel, formatMileage, formatPrice, makeLabel } from '@/lib/format'
import { truckPrimaryPhoto } from '@/lib/media'
import { AvailabilityBadge } from '@/components/AvailabilityBadge'

/**
 * Truck card (grid view). Photo with body-type badge, year/make in mono caps,
 * model in Barlow, and a stats bar (mileage · price). Lifts on hover
 * (motion moment #6). See build-brief/04-design-system.md.
 */
export function TruckCard({ truck }: { truck: Truck }) {
  const photo = truckPrimaryPhoto(truck)
  const href = `/trucks/${truck.slug}`

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[10px] border border-chalk bg-white transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-0.5 hover:border-concrete hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-warm-white">
        {photo ? (
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-widest text-concrete">
            No photo
          </div>
        )}
        <span className="absolute left-3 top-3 rounded bg-sparta-black/85 px-2 py-1 font-barlow text-[11px] font-bold uppercase tracking-wider text-bone backdrop-blur-sm">
          {bodyTypeLabel(truck.bodyType)}
        </span>
        {/* Sale state outranks the Featured flag for the same corner — a shopper
            needs to know a truck is spoken for before anything else. */}
        {truck.availability && truck.availability !== 'available' ? (
          <AvailabilityBadge availability={truck.availability} className="absolute right-3 top-3" />
        ) : (
          truck.featured && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded bg-orange px-2 py-1 font-barlow text-[11px] font-bold uppercase tracking-wider text-sparta-black shadow-sm">
              <span aria-hidden="true">◆</span>
              Featured
            </span>
          )
        )}
      </div>

      <div className="p-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-iron">
          {truck.year} {makeLabel(truck.make)}
        </p>
        <h3 className="mt-1 font-barlow text-xl font-bold uppercase leading-tight tracking-tight text-sparta-black">
          {truck.listingTitle?.trim() ? (
            truck.listingTitle.trim()
          ) : (
            <>
              {truck.model}
              {truck.trim ? <span className="text-iron"> {truck.trim}</span> : null}
            </>
          )}
        </h3>

        <div className="mt-4 flex items-center justify-between border-t border-chalk pt-3">
          <span className="font-mono text-sm text-iron">{formatMileage(truck.mileage)}</span>
          <span className="font-mono text-base font-medium text-sparta-black">
            {formatPrice(truck.price)}
          </span>
        </div>
      </div>
    </Link>
  )
}
