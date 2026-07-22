'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Phone, X } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { formatPhone } from '@/lib/format'

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Inventory', href: '/inventory' },
  { label: 'Financing', href: '/financing' },
  { label: 'Parts', href: '/parts' },
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
  const overlayRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // While the full-screen overlay is open: lock body scroll, move focus into
  // the dialog, trap Tab within it, close on Escape, and restore focus to the
  // menu button on close. (WCAG 2.4.3 / 2.1.2)
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return

    // Capture the trigger now so focus returns to the same node on close.
    const menuButton = menuButtonRef.current
    const overlay = overlayRef.current
    const focusables = overlay
      ? Array.from(
          overlay.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
        )
      : []
    focusables[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab' || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
      menuButton?.focus()
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-charcoal bg-sparta-black text-bone">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-20 md:px-10">
        <Logo tone="dark" size="lg" />

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
              className="ml-1 inline-flex items-center gap-1.5 font-mono text-base font-medium text-bone hover:text-orange lg:text-lg"
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
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-haspopup="dialog"
            className="inline-flex h-11 w-11 items-center justify-center rounded text-bone hover:text-orange"
          >
            <Menu size={24} strokeWidth={2} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      {open && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 flex flex-col bg-sparta-black md:hidden"
        >
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
