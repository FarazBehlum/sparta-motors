import React from 'react'
import { Container } from '@/components/Container'
import { SectionLabel } from '@/components/SectionLabel'
import { FadeInSection } from './FadeInSection'

const PILLARS = [
  {
    num: '01',
    title: 'Inspected on the lot.',
    body: "Every truck gets looked over before it's listed. If it doesn't run right, we don't sell it.",
  },
  {
    num: '02',
    title: 'Honest specs.',
    body: 'Real mileage, real photos, real condition notes. VIN on every listing so you can run your own report.',
  },
  {
    num: '03',
    title: 'Financing help.',
    body: 'We connect you with commercial lenders. Ask us.',
  },
]

/** Dark trust strip — three pillars. */
export function HowWeWork() {
  return (
    <section className="bg-sparta-black text-bone">
      <Container width="wide" className="py-14 md:py-20">
        <FadeInSection>
          <SectionLabel tone="dark">How we work</SectionLabel>
          <h2 className="mt-2 font-barlow text-4xl font-bold uppercase tracking-tight text-bone md:text-5xl">
            No extra fees. Clear price. Business finance options.
          </h2>
        </FadeInSection>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {PILLARS.map((pillar, i) => (
            <FadeInSection key={pillar.num} delay={i * 60}>
              <div className="border-t border-charcoal pt-5">
                <span className="font-mono text-sm text-orange">{pillar.num}</span>
                <h3 className="mt-3 font-barlow text-2xl font-bold uppercase leading-tight tracking-tight text-bone">
                  {pillar.title}
                </h3>
                <p className="mt-3 font-inter leading-relaxed text-concrete">{pillar.body}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </Container>
    </section>
  )
}
