import React from 'react'
import { formatPhone, telHref } from '@/lib/format'

/**
 * Two-column CTA block: left = explanatory copy + "call us" line, right = the
 * form (passed as children, rendered in a white card). Used by Financing,
 * Fleet, and Contact. Tone controls the left-copy colors for dark vs. light
 * section backgrounds.
 */
export function FormCTA({
  tone = 'dark',
  heading,
  description,
  phone,
  callLead = 'Prefer to talk to a person first?',
  children,
}: {
  tone?: 'dark' | 'light'
  heading: string
  description: string
  phone?: string | null
  callLead?: string
  children: React.ReactNode
}) {
  const headColor = tone === 'dark' ? 'text-bone' : 'text-sparta-black'
  const bodyColor = tone === 'dark' ? 'text-concrete' : 'text-iron'
  const href = telHref(phone)

  return (
    <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
      <div>
        <h3 className={`font-barlow text-2xl font-bold uppercase tracking-tight ${headColor}`}>
          {heading}
        </h3>
        <p className={`mt-3 font-inter leading-relaxed ${bodyColor}`}>{description}</p>
        {href && phone && (
          <p className={`mt-5 font-inter ${bodyColor}`}>
            {callLead}{' '}
            <a href={href} className="font-mono font-medium text-orange hover:underline">
              {formatPhone(phone)}
            </a>
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}
