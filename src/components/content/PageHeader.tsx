import React from 'react'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { SectionLabel } from '@/components/SectionLabel'

/**
 * Dark page header for content pages (Financing / Fleet / About / Contact).
 * A large low-opacity watermark word sits behind the breadcrumb + label +
 * display title + optional subtitle. See build-brief/{financing,fleet,about,
 * contact}.md.
 */
export function PageHeader({
  watermark,
  breadcrumb,
  label,
  title,
  subtitle,
}: {
  watermark: string
  breadcrumb: string
  label: string
  title: string
  subtitle?: string
}) {
  return (
    <section className="relative overflow-hidden bg-sparta-black text-bone">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 translate-x-[8%] select-none font-barlow font-extrabold uppercase leading-none tracking-tighter text-bone/[0.04]"
        style={{ fontSize: 'min(30vw, 340px)' }}
      >
        {watermark}
      </span>

      <Container width="wide" className="relative py-16 md:py-24">
        <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-wider text-concrete">
          <Link href="/" className="transition-colors hover:text-orange">
            Home
          </Link>
          <span aria-hidden="true" className="px-1.5 text-iron">
            /
          </span>
          <span className="text-bone">{breadcrumb}</span>
        </nav>

        <SectionLabel className="mt-6">{label}</SectionLabel>
        <h1 className="mt-3 max-w-3xl font-barlow text-5xl font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 max-w-2xl font-inter text-base leading-relaxed text-concrete md:text-lg">
            {subtitle}
          </p>
        )}
      </Container>
    </section>
  )
}
