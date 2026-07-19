import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { getSettings } from '@/lib/payload'
import { formatPhone } from '@/lib/format'

const INVENTORY_LINKS = [
  { label: 'Box Trucks', href: '/inventory/box-trucks' },
  { label: 'Reefers', href: '/inventory/reefers' },
  { label: 'Day Cabs', href: '/inventory/day-cabs' },
  { label: 'Dump Trucks', href: '/inventory/dump-trucks' },
  { label: 'Tow Trucks', href: '/inventory/tow-trucks' },
]

const COMPANY_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Financing', href: '/financing' },
  { label: 'Fleet inquiries', href: '/fleet' },
  { label: 'Contact', href: '/contact' },
]

function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-orange">
      <span aria-hidden="true">◆ </span>
      {children}
    </h2>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="font-inter text-sm text-concrete transition-colors hover:text-bone"
      >
        {children}
      </Link>
    </li>
  )
}

/** Site-wide footer. Deep dark, 4-column, pulls contact details from Settings. */
export async function Footer() {
  const settings = await getSettings()
  const city = settings.address?.city ?? 'Charlotte'
  const state = settings.address?.state ?? 'NC'
  const location = `${city}, ${state}`
  const phone = settings.phone

  return (
    <footer className="bg-[#0F0F0F] text-bone">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-5 py-14 md:grid-cols-4 md:px-10">
        {/* Brand */}
        <div>
          <Logo tone="dark" href={null} />
          <p className="mt-4 max-w-xs font-inter text-sm leading-relaxed text-concrete">
            Used commercial trucks for working businesses. {location} · Est. 2018
          </p>
          {phone && (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="mt-4 inline-block font-mono text-sm text-bone hover:text-orange"
            >
              {formatPhone(phone)}
            </a>
          )}
        </div>

        {/* Inventory */}
        <nav aria-label="Inventory">
          <ColHeading>Inventory</ColHeading>
          <ul className="flex flex-col gap-2.5">
            {INVENTORY_LINKS.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </ul>
        </nav>

        {/* Company */}
        <nav aria-label="Company">
          <ColHeading>Company</ColHeading>
          <ul className="flex flex-col gap-2.5">
            {COMPANY_LINKS.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </ul>
        </nav>

        {/* Parts (Phase 2 placeholder) */}
        <div>
          <ColHeading>Parts</ColHeading>
          <p className="font-inter text-sm text-concrete">Sparta Parts coming soon.</p>
        </div>
      </div>

      <div className="border-t border-charcoal">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-5 py-5 font-mono text-[11px] uppercase tracking-wider text-iron md:flex-row md:items-center md:justify-between md:px-10">
          <span>© {new Date().getFullYear()} Sparta Motors LLC</span>
          <span>{location}</span>
        </div>
      </div>
    </footer>
  )
}
