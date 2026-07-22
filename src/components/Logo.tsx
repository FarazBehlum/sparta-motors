import React from 'react'
import Link from 'next/link'

/**
 * Sparta wordmark lockup: orange diamond mark + "SPARTA MOTORS" in Barlow
 * Condensed. `tone` adapts it for dark (nav/footer) vs light backgrounds.
 * Until a final SVG mark is provided this is a type-based lockup.
 */
export function Logo({
  tone = 'dark',
  href = '/',
  size = 'md',
  className = '',
}: {
  tone?: 'dark' | 'light'
  href?: string | null
  size?: 'md' | 'lg'
  className?: string
}) {
  const wordColor = tone === 'dark' ? 'text-bone' : 'text-sparta-black'
  const wordSize = size === 'lg' ? 'text-2xl md:text-3xl' : 'text-xl'
  const markSize = size === 'lg' ? 'text-xl md:text-2xl' : 'text-lg'

  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`text-orange ${markSize} leading-none`} aria-hidden="true">
        ◆
      </span>
      <span className="font-barlow font-extrabold uppercase leading-none tracking-tight">
        <span className={`${wordColor} ${wordSize}`}>SPARTA</span>
        <span className={`ml-1.5 text-orange ${wordSize}`}>MOTORS</span>
      </span>
    </span>
  )

  if (href == null) return inner

  return (
    <Link href={href} aria-label="Sparta Motors — home" className="inline-flex">
      {inner}
    </Link>
  )
}
