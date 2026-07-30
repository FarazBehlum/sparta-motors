import React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type Crumb = { label: string; href?: string }

/**
 * Site breadcrumbs, responsive by design rather than by scrolling.
 *
 * On phones the full trail is replaced by a single large "back to parent"
 * control. A four-level trail ending in a truck's full name is ~470px wide —
 * far past a 390px screen — and the old version solved that with a sideways
 * scroll strip, which is the one thing a nav bar should never ask for. The
 * trail returns in full at `sm` and up, where it fits.
 *
 * Dropping crumbs on small screens costs nothing in search: Google reads the
 * BreadcrumbList JSON-LD on the page, not this markup.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null

  const current = items[items.length - 1]
  // Deepest ancestor that's actually linkable — the most useful place to send
  // someone "back" to, which is rarely the site root.
  const parent = [...items.slice(0, -1)].reverse().find((i) => i.href)

  return (
    <div className="border-b border-chalk bg-warm-white">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        {/* Safety Orange rule anchoring the row. A solid block is exempt from
            text-contrast limits, so this carries the brand pop that bright
            orange can't carry at 12px on a light ground (2.58:1). */}
        <div className="border-l-[3px] border-orange pl-3">
          {/* Phone: one target, comfortably tappable, never wider than the screen */}
          {parent?.href && (
            <Link
              href={parent.href}
              className="-ml-1 inline-flex min-h-[44px] touch-manipulation items-center gap-1.5 px-1 font-barlow text-sm font-bold uppercase tracking-wider text-sparta-black transition-colors hover:text-orange-ink sm:hidden"
            >
              <ChevronLeft size={16} className="shrink-0 text-orange-ink" aria-hidden="true" />
              <span className="truncate">Back to {parent.label}</span>
            </Link>
          )}

          {/* Tablet and up: the full trail. The current page truncates rather than
              forcing the row wider than its container. */}
          <nav aria-label="Breadcrumb" className="hidden sm:block">
            <ol className="flex items-center py-3.5 font-barlow text-xs font-semibold uppercase tracking-wider">
              {items.map((item, i) => {
                const isLast = i === items.length - 1
                return (
                  <li
                    key={`${item.label}-${i}`}
                    className={`flex items-center ${isLast ? 'min-w-0' : 'shrink-0'}`}
                  >
                    {i > 0 && (
                      <ChevronRight
                        size={14}
                        className="mx-1 shrink-0 text-orange-ink"
                        aria-hidden="true"
                      />
                    )}
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="rounded px-1 py-1.5 text-iron transition-colors hover:text-orange-ink"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? 'page' : undefined}
                        title={item.label}
                        className="min-w-0 truncate px-1 py-1.5 font-bold text-sparta-black"
                      >
                        {item.label}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>
      </div>

      {/* Current page name still reaches screen readers on phones, where the
          visual trail is collapsed. */}
      <span className="sr-only sm:hidden">Current page: {current.label}</span>
    </div>
  )
}
