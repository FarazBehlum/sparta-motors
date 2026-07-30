import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Truck } from '@/payload-types'
import { bodyTypeLabel, formatMileage, formatPrice, makeLabel } from '@/lib/format'
import { truckPrimaryPhoto } from '@/lib/media'
import { AvailabilityBadge } from '@/components/AvailabilityBadge'

function payloadClassLabel(c?: string | null): string | null {
  if (!c) return null
  return c.replace('-', ' ').toUpperCase()
}

/** Truck row (list view). Photo left, info middle, price block right. */
export function TruckListRow({ truck }: { truck: Truck }) {
  const photo = truckPrimaryPhoto(truck)
  const href = `/trucks/${truck.slug}`
  const cls = payloadClassLabel(truck.payloadClass)

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-[10px] border border-chalk bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-concrete hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] motion-reduce:hover:translate-y-0 sm:flex-row"
    >
      <div className="relative aspect-[5/3] w-full shrink-0 overflow-hidden bg-warm-white sm:aspect-auto sm:w-60">
        {photo ? (
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            sizes="(max-width: 640px) 100vw, 240px"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full min-h-[130px] items-center justify-center font-mono text-xs uppercase tracking-widest text-concrete">
            No photo
          </div>
        )}
        <span className="absolute left-3 top-3 rounded bg-sparta-black/85 px-2 py-1 font-barlow text-[11px] font-bold uppercase tracking-wider text-bone">
          {bodyTypeLabel(truck.bodyType)}
        </span>
        <AvailabilityBadge availability={truck.availability} className="absolute right-3 top-3" />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="min-w-0">
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
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-iron">
            <span>{formatMileage(truck.mileage)}</span>
            {cls && <span>{cls}</span>}
            <span className="capitalize">{truck.fuelType}</span>
          </div>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <span className="font-mono text-[10px] uppercase tracking-wider text-iron">Price</span>
          <div className="font-mono text-2xl font-medium text-orange-ink">{formatPrice(truck.price)}</div>
        </div>
      </div>
    </Link>
  )
}
