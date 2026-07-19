'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Phone, X } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { formatPhone } from '@/lib/format'

export const NAV_LINKS = [
  { label: 'Inventory', href: '/inventory' },
  { label: 'Financing', href: '/financing' },
  { label: 'Fleet', href: '/fleet' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Site-wide navigation. Dark, sticky, always visible. Desktop shows the link
 * row + phone; mobile shows a "◆ Call" button + hamburger opening a full-screen
 * overlay. See build-brief/04-design-system.md ("Mobile-specific patterns").
 */
export function NavBar({ phone }: { phone?: string | null }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null
  const closeMenu = () => setOpen(false)

  // Lock body scroll while the full-screen overlay is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-charcoal bg-sparta-black text-bone">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-10">
        <Logo tone="dark" />

        {/* Desktop links */}
        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`group relative font-barlow text-sm font-semibold uppercase tracking-wider transition-colors ${
                  active ? 'text-orange' : 'text-concrete hover:text-bone'
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-orange transition-all duration-150 ${
                    active ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                  aria-hidden="true"
                />
              </Link>
            )
          })}
          {telHref && (
            <a
              href={telHref}
              className="ml-1 inline-flex items-center gap-1.5 font-mono text-sm text-bone hover:text-orange"
            >
              <span className="text-orange" aria-hidden="true">
                ◆
              </span>
              {formatPhone(phone)}
            </a>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          {telHref && (
            <a
              href={telHref}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded bg-orange px-3 font-barlow text-sm font-bold uppercase tracking-wider text-sparta-black"
            >
              <Phone size={16} strokeWidth={2} aria-hidden="true" />
              Call
            </a>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="inline-flex h-11 w-11 items-center justify-center rounded text-bone hover:text-orange"
          >
            <Menu size={24} strokeWidth={2} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-sparta-black md:hidden">
          <div className="flex h-16 items-center justify-between px-5">
            <Logo tone="dark" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded text-bone hover:text-orange"
            >
              <X size={24} strokeWidth={2} />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-1 px-5 pt-6">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-[44px] items-center border-b border-charcoal py-3 font-barlow text-2xl font-bold uppercase tracking-wide ${
                    active ? 'text-orange' : 'text-bone'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            {telHref && (
              <a
                href={telHref}
                onClick={closeMenu}
                className="mt-6 inline-flex min-h-[44px] items-center gap-2 font-mono text-lg text-bone"
              >
                <span className="text-orange" aria-hidden="true">
                  ◆
                </span>
                {formatPhone(phone)}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
