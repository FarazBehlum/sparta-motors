import React from 'react'
import { FadeInSection } from '@/components/home/FadeInSection'

export type InfoItem = { title: string; body: string }

/** 2-column info list (6 items) — "What you'll need" / "What we source". */
export function InfoGrid({ items }: { items: InfoItem[] }) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
      {items.map((item, i) => (
        <FadeInSection key={item.title} delay={(i % 2) * 60}>
          <div className="border-t border-chalk pt-4">
            <h3 className="font-barlow text-xl font-bold uppercase tracking-tight text-sparta-black">
              {item.title}
            </h3>
            <p className="mt-1.5 font-inter text-sm leading-relaxed text-iron">{item.body}</p>
          </div>
        </FadeInSection>
      ))}
    </div>
  )
}
