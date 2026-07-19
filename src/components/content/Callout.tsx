import React from 'react'

/**
 * White card with an orange left border — the legal "heads up" on Financing
 * and the "how we work" note on About. `label` is the small orange mono head.
 */
export function Callout({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="note"
      className={`rounded-r-lg border-l-4 border-orange bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] md:p-6 ${className}`}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange">
        <span aria-hidden="true">◆ </span>
        {label}
      </p>
      <div className="mt-2 font-inter leading-relaxed text-sparta-black">{children}</div>
    </div>
  )
}
