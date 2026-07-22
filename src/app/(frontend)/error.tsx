'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'

/**
 * Branded fallback for any error thrown while rendering a frontend route —
 * replaces the raw Next.js error screen. Mirrors the 404 styling.
 */
export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface the error for server/console logging in dev and prod telemetry.
    console.error(error)
  }, [error])

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-sparta-black px-5 py-24 text-bone">
      <div className="w-full max-w-lg text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange">
          <span aria-hidden="true">◆ </span>Something went wrong
        </p>
        <h1 className="mt-3 font-barlow text-5xl font-extrabold uppercase leading-none tracking-tight text-bone md:text-6xl">
          That didn&rsquo;t load right.
        </h1>
        <p className="mx-auto mt-4 max-w-sm font-inter text-base leading-relaxed text-concrete">
          A gear slipped on our end. Try again, or head back to the trucks.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[44px] items-center justify-center rounded bg-orange px-6 py-3 font-barlow text-sm font-bold uppercase tracking-wider text-sparta-black transition hover:brightness-105"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded border border-charcoal px-6 py-3 font-barlow text-sm font-bold uppercase tracking-wider text-bone transition hover:border-orange hover:text-orange"
          >
            Home
          </Link>
        </div>
      </div>
    </section>
  )
}
