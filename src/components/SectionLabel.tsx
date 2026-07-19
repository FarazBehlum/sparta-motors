import React from 'react'

/**
 * "◆ SECTION NAME" — the small orange monospace brand accent used to head
 * sections throughout the site. The diamond (U+25C6) is the Sparta signature.
 */
export function SectionLabel({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'span' | 'p'
}) {
  return (
    <Tag className={`font-mono text-[11px] tracking-[0.3em] text-orange uppercase ${className}`}>
      <span aria-hidden="true">◆ </span>
      {children}
    </Tag>
  )
}
