import React from 'react'

type Tone = 'new' | 'contacted' | 'closed' | 'neutral' | 'sold'

const TONES: Record<Tone, { wrap: string; dot: string; label: string }> = {
  new: { wrap: 'bg-warning-soft text-warning-dark', dot: 'bg-orange', label: 'New' },
  contacted: { wrap: 'bg-success-light text-success', dot: 'bg-success', label: 'Contacted' },
  closed: { wrap: 'bg-chalk/50 text-iron', dot: 'bg-iron', label: 'Closed' },
  sold: { wrap: 'bg-sparta-black text-bone', dot: 'bg-concrete', label: 'Sold' },
  neutral: { wrap: 'bg-warm-white text-iron', dot: 'bg-concrete', label: '' },
}

/**
 * Rounded status pill with a leading colored dot. Used for lead statuses and
 * truck states. Pass `children` to override the default label for the tone.
 */
export function StatusPill({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: Tone
  children?: React.ReactNode
  className?: string
}) {
  const t = TONES[tone]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-barlow text-[11px] font-bold uppercase tracking-wider ${t.wrap} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden="true" />
      {children ?? t.label}
    </span>
  )
}
