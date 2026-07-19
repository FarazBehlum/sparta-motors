import React from 'react'
import { Container } from '@/components/Container'
import { SectionLabel } from '@/components/SectionLabel'
import { Button } from '@/components/Button'

/**
 * Temporary scaffold for routes whose full build is still ahead. Renders the
 * page's identity (label + title) with the real chrome around it so routing,
 * nav active-states, and layout can be verified now. Replaced page-by-page.
 */
export function PageStub({
  label,
  title,
  description,
}: {
  label: string
  title: string
  description?: string
}) {
  return (
    <Container className="py-20 md:py-28">
      <SectionLabel>{label}</SectionLabel>
      <h1 className="mt-3 max-w-3xl font-barlow text-5xl font-extrabold uppercase leading-[0.95] tracking-tight text-sparta-black md:text-6xl">
        {title}
      </h1>
      {description && (
        <p className="mt-5 max-w-xl font-inter text-base leading-relaxed text-iron">{description}</p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/inventory" variant="primary">
          Browse inventory →
        </Button>
        <Button href="/" variant="ghost">
          Back home
        </Button>
      </div>
      <p className="mt-10 font-mono text-[11px] uppercase tracking-widest text-concrete">
        This page is scaffolded — full build in progress.
      </p>
    </Container>
  )
}
