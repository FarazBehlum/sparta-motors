import React from 'react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/Button'
import { SectionLabel } from '@/components/SectionLabel'

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-sparta-black px-5 py-24 text-bone">
      <div className="w-full max-w-lg text-center">
        <Logo tone="dark" href={null} />
        <div className="mt-8">
          <SectionLabel className="justify-center">Error 404</SectionLabel>
        </div>
        <h1 className="mt-3 font-barlow text-6xl font-extrabold uppercase leading-none tracking-tight text-bone">
          Not found.
        </h1>
        <p className="mx-auto mt-4 max-w-sm font-inter text-base leading-relaxed text-concrete">
          That page rolled off the lot. Let&rsquo;s get you back to the trucks.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" variant="primary">
            Home
          </Button>
          <Button
            href="/inventory"
            variant="dark"
            className="border border-charcoal"
          >
            Browse inventory →
          </Button>
        </div>
      </div>
    </section>
  )
}
