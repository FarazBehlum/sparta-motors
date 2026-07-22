import React from 'react'
import { FadeInSection } from '@/components/home/FadeInSection'

export type Step = { num: string; title: string; body: string }

/** Three-step process grid used on Financing. Dark-tone aware. */
export function ProcessSteps({ steps, tone = 'light' }: { steps: Step[]; tone?: 'light' | 'dark' }) {
  const border = tone === 'dark' ? 'border-charcoal' : 'border-chalk'
  const titleColor = tone === 'dark' ? 'text-bone' : 'text-sparta-black'
  const bodyColor = tone === 'dark' ? 'text-concrete' : 'text-iron'
  return (
    <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
      {steps.map((step, i) => (
        <FadeInSection key={step.num} delay={i * 60}>
          <div className={`border-t pt-5 ${border}`}>
            <span className="font-mono text-sm text-orange-ink">{step.num}</span>
            <h3 className={`mt-3 font-barlow text-2xl font-bold uppercase leading-tight tracking-tight ${titleColor}`}>
              {step.title}
            </h3>
            <p className={`mt-3 font-inter leading-relaxed ${bodyColor}`}>{step.body}</p>
          </div>
        </FadeInSection>
      ))}
    </div>
  )
}
