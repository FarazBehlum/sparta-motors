import React from 'react'
import Link from 'next/link'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'
import type { RawParams } from '@/lib/trucks'
import { parseFilters, queryInventory } from '@/lib/trucks'
import { CATEGORY_TO_BODY_TYPE, bodyTypeLabel } from '@/lib/format'
import { getSettings } from '@/lib/payload'
import { formatPhone } from '@/lib/format'
import { TruckCard } from '@/components/TruckCard'
import { TruckListRow } from '@/components/TruckListRow'
import {
  FilterSidebar,
  InventorySearch,
  InventoryToolbar,
} from '@/components/inventory/controls'

/** Short SEO intro per category (Phase 1: inline; moves to Pages global later). */
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'box-trucks':
    'Used box trucks are the workhorses of local commerce, handling deliveries, dry freight, moving, and small-business logistics. Sparta Motors stocks used box trucks from Isuzu, Hino, Freightliner, and other proven brands, most between 14 and 26 feet, in a mix of gas and diesel. Every truck is inspected before it goes on the lot, with real mileage and real photos.',
  reefers:
    'Refrigerated trucks keep your cold chain intact for produce, pharma, catering, and frozen freight. Our used reefers come from names like Thermo King and Carrier on Isuzu, Hino, and Freightliner chassis. Every unit is inspected and run before it goes on the lot.',
  landscapers:
    'Landscape trucks are built for crews that haul equipment, mulch, and debris all day. Sparta Motors stocks used dovetails, dumps, and open decks on proven medium-duty chassis, each inspected with honest mileage and clear condition notes.',
  '26ft-box-trucks':
    'A 26ft box truck is the largest van body most drivers can run without a CDL, which makes it the go-to for moving companies, furniture delivery, and regional freight. Ours come with liftgates and roll-up or swing doors, inspected before listing with real specs.',
  'dump-trucks':
    'Dump trucks move dirt, gravel, and debris for construction and site work. Sparta Motors stocks used dumps from Kenworth, Peterbilt, and International with tight hydraulics and solid bodies, all inspected before listing.',
  'tow-trucks':
    'Tow and recovery trucks keep your fleet and your customers moving. Our used rollbacks and wreckers are inspected and road-ready, with honest hours and clear condition notes.',
  'tank-trucks':
    'Tank trucks move fuel, water, and liquid bulk for fuel dealers, contractors, and service operations. Sparta Motors stocks used tankers on Freightliner, International, and other proven chassis, with the pump and plumbing checked before the truck goes on the lot. Real mileage, real photos, clear condition notes.',
  'garbage-trucks':
    'Garbage trucks keep collection routes running for private haulers, municipalities, and waste operations. Our used rear loaders and refuse bodies sit on medium and heavy duty chassis, with the packer and hydraulics run before the truck is listed. Honest mileage and clear condition notes on every unit.',
  'specialty-trucks':
    'Specialty trucks cover the work a standard body cannot do: vacuum and septic units, service and utility bodies, and other purpose-built equipment. What we have here changes often, so if you need something specific, call us and we will tell you what is coming through. Every unit is inspected before it goes on the lot.',
}

function flattenParams(params: RawParams): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue
    out[k] = Array.isArray(v) ? v.join(',') : v
  }
  return out
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-concrete">{label}</div>
      <div className="font-barlow text-3xl font-bold text-bone">{value}</div>
    </div>
  )
}

export async function InventoryView({
  params,
  category,
}: {
  params: RawParams
  category?: string
}) {
  const lockedBody = category ? CATEGORY_TO_BODY_TYPE[category] : undefined
  const filters = parseFilters(params, lockedBody)
  const { trucks, total, facets } = await queryInventory(filters)
  const settings = await getSettings()
  const query = flattenParams(params)

  const label = lockedBody
    ? `${bodyTypeLabel(lockedBody)}s for sale`
    : 'All commercial trucks'
  const title = lockedBody ? `${bodyTypeLabel(lockedBody)}s.` : 'Inventory.'
  const categoryDescription = category ? CATEGORY_DESCRIPTIONS[category] : undefined

  return (
    <div>
      {/* ---- Dark page header ---- */}
      <header className="relative overflow-hidden bg-sparta-black text-bone">
        <span
          className="pointer-events-none absolute -right-6 bottom-0 select-none font-barlow text-[22vw] font-extrabold uppercase leading-none text-white/[0.03]"
          aria-hidden="true"
        >
          Trucks
        </span>
        <div className="relative mx-auto max-w-[1400px] px-5 py-12 md:px-10 md:py-16">
          <nav className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-concrete">
            <Link href="/" className="hover:text-bone">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <Link href="/inventory" className="hover:text-bone">Inventory</Link>
            {lockedBody && (
              <>
                <ChevronRight size={12} aria-hidden="true" />
                <span className="text-bone">{bodyTypeLabel(lockedBody)}</span>
              </>
            )}
          </nav>

          <div className="mt-6 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange">
                <span aria-hidden="true">◆ </span>
                {label}
              </div>
              <h1 className="mt-2 font-barlow text-5xl font-extrabold uppercase leading-[0.95] tracking-tight md:text-6xl">
                {title}
              </h1>
              <p className="mt-4 font-inter text-sm leading-relaxed text-concrete">
                Every truck inspected before it goes on the lot. Filter by body type, brand, or
                budget. Call us if you don&rsquo;t see what you need.
              </p>
            </div>
            <div className="flex gap-10">
              <Stat label="Showing" value={trucks.length} />
              <Stat label="In stock" value={total} />
              <Stat label="Body types" value="06" />
            </div>
          </div>
        </div>
      </header>

      {/* ---- Search bar ---- */}
      <div className="bg-charcoal">
        <div className="mx-auto max-w-[1400px] px-5 py-4 md:px-10">
          <InventorySearch query={query} filters={filters} />
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 py-10 md:px-10">
        {categoryDescription && (
          <p className="mb-8 max-w-3xl font-inter text-sm leading-relaxed text-iron">
            {categoryDescription}
          </p>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Sidebar — collapsible on mobile, sticky on desktop */}
          <details open>
            <summary className="mb-4 flex cursor-pointer items-center gap-2 font-barlow text-sm font-bold uppercase tracking-wide text-sparta-black lg:hidden">
              <SlidersHorizontal size={16} /> Filters
            </summary>
            <FilterSidebar
              query={query}
              filters={filters}
              facets={facets}
              lockedBody={lockedBody}
            />
          </details>

          {/* Content */}
          <div>
            <InventoryToolbar
              query={query}
              filters={filters}
              showing={trucks.length}
              total={total}
            />

            {trucks.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-barlow text-2xl font-bold uppercase tracking-tight text-sparta-black">
                  No trucks match your filters.
                </p>
                <p className="mt-3 font-inter text-sm text-iron">
                  Try loosening a filter, or{' '}
                  {settings.phone ? (
                    <a
                      href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}
                      className="font-semibold text-orange-ink hover:underline"
                    >
                      call us at {formatPhone(settings.phone)}
                    </a>
                  ) : (
                    <Link href="/contact" className="font-semibold text-orange hover:underline">
                      contact us
                    </Link>
                  )}
                  .
                </p>
              </div>
            ) : filters.view === 'list' ? (
              <div className="mt-6 flex flex-col gap-4">
                {trucks.map((t) => (
                  <TruckListRow key={t.id} truck={t} />
                ))}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {trucks.map((t) => (
                  <TruckCard key={t.id} truck={t} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
