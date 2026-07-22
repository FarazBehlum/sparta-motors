import React from 'react'
import { Container } from '@/components/Container'
import { FadeInSection } from './FadeInSection'

export type Stat = { label: string; value: string; lead?: boolean }

/** Horizontal band of 4 stats below the hero. 4-up desktop, 2×2 mobile. */
export function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <section className="border-y border-chalk bg-bone">
      <Container width="wide" className="py-10 md:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeInSection key={stat.label} delay={i * 60}>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-iron">
                {stat.label}
              </p>
              <p
                className={`mt-2 font-barlow text-5xl font-bold leading-none tabular-nums ${
                  stat.lead ? 'text-orange-ink' : 'text-sparta-black'
                }`}
              >
                {stat.value}
              </p>
            </FadeInSection>
          ))}
        </div>
      </Container>
    </section>
  )
}
