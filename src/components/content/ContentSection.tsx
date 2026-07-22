import React from 'react'
import { Container } from '@/components/Container'
import { SectionLabel } from '@/components/SectionLabel'
import { FadeInSection } from '@/components/home/FadeInSection'

type Tone = 'light' | 'warm' | 'dark'

const TONE: Record<Tone, string> = {
  light: 'bg-bone text-sparta-black',
  warm: 'bg-warm-white text-sparta-black',
  dark: 'bg-sparta-black text-bone',
}

/**
 * Standard content-page section: tone background + the label / title / lead
 * header pattern, then children. Header fades up on scroll.
 */
export function ContentSection({
  tone = 'light',
  label,
  title,
  lead,
  children,
  className = '',
}: {
  tone?: Tone
  label: string
  title: string
  lead?: string
  children?: React.ReactNode
  className?: string
}) {
  const titleColor = tone === 'dark' ? 'text-bone' : 'text-sparta-black'
  const leadColor = tone === 'dark' ? 'text-concrete' : 'text-iron'
  return (
    <section className={TONE[tone]}>
      <Container width="wide" className={`py-14 md:py-20 ${className}`}>
        <FadeInSection>
          <SectionLabel tone={tone === 'dark' ? 'dark' : 'light'}>{label}</SectionLabel>
          <h2 className={`mt-2 font-barlow text-4xl font-bold uppercase tracking-tight md:text-5xl ${titleColor}`}>
            {title}
          </h2>
          {lead && <p className={`mt-3 max-w-2xl font-inter leading-relaxed ${leadColor}`}>{lead}</p>}
        </FadeInSection>
        {children}
      </Container>
    </section>
  )
}
