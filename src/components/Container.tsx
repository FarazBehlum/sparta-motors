import React from 'react'

type Width = 'content' | 'wide' | 'prose'

const MAX_WIDTH: Record<Width, string> = {
  content: 'max-w-[1280px]',
  wide: 'max-w-[1400px]',
  prose: 'max-w-[900px]',
}

/**
 * Centered page container. Widths mirror the layout tokens in
 * build-brief/04-design-system.md. Horizontal padding matches the section
 * standard (20px mobile → 40px desktop).
 */
export function Container({
  width = 'content',
  className = '',
  children,
}: {
  width?: Width
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`mx-auto w-full ${MAX_WIDTH[width]} px-5 md:px-10 ${className}`}>{children}</div>
  )
}
