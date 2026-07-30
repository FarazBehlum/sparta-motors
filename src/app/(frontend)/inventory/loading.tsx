import React from 'react'

/** Skeleton shown while the dynamic inventory query runs. */
export default function InventoryLoading() {
  return (
    <div className="animate-pulse motion-reduce:animate-none">
      {/* Dark header placeholder */}
      <div className="bg-sparta-black">
        <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-10 md:py-16">
          <div className="h-3 w-40 rounded bg-charcoal" />
          <div className="mt-6 h-14 w-72 rounded bg-charcoal" />
          <div className="mt-4 h-4 w-96 max-w-full rounded bg-charcoal" />
        </div>
      </div>

      {/* Search bar placeholder */}
      <div className="bg-charcoal">
        <div className="mx-auto max-w-[1400px] px-5 py-4 md:px-10">
          <div className="h-11 w-full rounded bg-sparta-black/40" />
        </div>
      </div>

      {/* Body: sidebar + card grid placeholders */}
      <div className="mx-auto max-w-[1400px] px-5 py-10 md:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <div className="h-[520px] rounded bg-warm-white" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-[10px] border border-chalk bg-warm-white" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
