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
  className = '',
}: {
  tone?: 'dark' | 'light'
  href?: string | null
  className?: string
}) {
  const wordColor = tone === 'dark' ? 'text-bone' : 'text-sparta-black'

  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-orange text-lg leading-none" aria-hidden="true">
        ◆
      </span>
      <span className="font-barlow font-extrabold uppercase leading-none tracking-tight">
        <span className={`${wordColor} text-xl`}>SPARTA</span>
        <span className="ml-1.5 text-orange text-xl">MOTORS</span>
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
