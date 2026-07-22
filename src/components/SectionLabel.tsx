import React from 'react'

/**
 * "◆ SECTION NAME" — the small orange monospace brand accent used to head
 * sections throughout the site. The diamond (U+25C6) is the Sparta signature.
 */
export function SectionLabel({
  children,
  className = '',
  as: Tag = 'div',
  tone = 'light',
}: {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'span' | 'p'
  /** Background the label sits on. 'light' uses the AA-safe orange-ink;
   *  'dark' uses bright orange (which passes on the dark ground). */
  tone?: 'light' | 'dark'
}) {
  const color = tone === 'dark' ? 'text-orange' : 'text-orange-ink'
  return (
    <Tag className={`font-mono text-[11px] tracking-[0.3em] ${color} uppercase ${className}`}>
      <span aria-hidden="true">◆ </span>
      {children}
    </Tag>
  )
}
