import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { CreditCard, FileText, Phone, ShieldCheck, Truck as TruckIcon } from 'lucide-react'
import type { Media, Truck } from '@/payload-types'
import { getTruckBySlug, getSimilarTrucks, getPublishedSlugs, isPubliclyVisible } from '@/lib/trucks'
import { getSettings } from '@/lib/payload'
import { truckPhotos, truckPrimaryPhoto } from '@/lib/media'
import { truckVideo } from '@/lib/video'
import { SITE_URL } from '@/lib/site'
import { jsonLdScript } from '@/lib/structured-data'
import {
  BODY_TYPE_TO_CATEGORY,
  bodyTypeLabel,
  formatMileage,
  formatPrice,
  makeLabel,
  truckHeadline,
} from '@/lib/format'
import { SectionLabel } from '@/components/SectionLabel'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { AvailabilityBadge, isSold } from '@/components/AvailabilityBadge'
import { TruckCard } from '@/components/TruckCard'
import { Gallery } from '@/components/truck/Gallery'
import { LeadForm } from '@/components/truck/LeadForm'

type Params = { slug: string }

const SCHEMA_AVAILABILITY: Record<string, string> = {
  available: 'https://schema.org/InStock',
  pending: 'https://schema.org/LimitedAvailability',
  sold: 'https://schema.org/SoldOut',
}

export const revalidate = 60

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getPublishedSlugs()
  return slugs.map((slug) => ({ slug }))
}

function truckName(t: Truck): string {
  return t.listingTitle?.trim() || [t.year, makeLabel(t.make), t.model, t.trim].filter(Boolean).join(' ')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const truck = await getTruckBySlug(slug)
  if (!truck) return { title: 'Truck not found' }
  const name = truckName(truck)
  const title = `${name} · Sparta Motors`
  const description = `${name}. ${formatMileage(truck.mileage)}. ${bodyTypeLabel(truck.bodyType)}. ${formatPrice(truck.price)}. Spartanburg, SC.`
  // The truck's own photo makes the strongest social card. Relative URLs are
  // resolved against metadataBase (set in the root layout).
  const primary = truckPrimaryPhoto(truck, 'hero')
  const ogImages = primary
    ? [{ url: primary.url, width: primary.width, height: primary.height, alt: name }]
    : undefined
  return {
    title,
    description,
    alternates: { canonical: `/trucks/${slug}` },
    openGraph: { title, description, type: 'website', images: ogImages },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: primary ? [primary.url] : undefined,
    },
  }
}

/* -- small presentational helpers -- */

function Badge({ children, variant }: { children: React.ReactNode; variant: 'filled' | 'outline' }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2.5 py-1 font-barlow text-xs font-bold uppercase tracking-wider ${
        variant === 'filled'
          ? 'bg-sparta-black text-bone'
          : 'border border-chalk text-iron'
      }`}
    >
      {children}
    </span>
  )
}

function KeySpec({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-iron">{label}</div>
      <div className={`mt-0.5 font-mono text-sm font-medium text-sparta-black ${valueClass}`}>{value}</div>
    </div>
  )
}

const TITLE_LABELS: Record<string, string> = {
  clean: 'Clean',
  rebuilt: 'Rebuilt',
  salvage: 'Salvage',
  lien: 'Lien / loan',
}

const AREA_LABELS: Record<string, string> = {
  engine: 'Engine',
  transmission: 'Transmission',
  brakes: 'Brakes',
  tires: 'Tires',
  suspension: 'Suspension',
  electrical: 'Electrical',
  frame: 'Frame & rust',
  emissions: 'Emissions (DPF/DEF)',
  interior: 'Interior / cab',
  body: 'Body / exterior',
}

const RATING: Record<string, { label: string; cls: string }> = {
  good: { label: 'Good', cls: 'bg-[#dcfce7] text-[#15803d]' },
  fair: { label: 'Fair', cls: 'bg-[#fef3c7] text-[#b45309]' },
  attention: { label: 'Needs attention', cls: 'bg-[#fee2e2] text-[#b91c1c]' },
}

/** Per-truck inspection block. Renders only what's been filled in (no fabrication). */
function InspectionCard({ inspection }: { inspection: NonNullable<Truck['inspection']> }) {
  const points = (inspection.points ?? []).filter((p) => p.area && p.rating)
  const hasMeta = inspection.inspectedDate || inspection.inspectedBy
  const when = inspection.inspectedDate
    ? new Date(inspection.inspectedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <Card>
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-orange" size={18} aria-hidden="true" />
        <SectionLabel>Inspection &amp; condition</SectionLabel>
      </div>
      <h2 className="mt-2 font-barlow text-2xl font-bold uppercase tracking-tight text-sparta-black">
        What we checked
      </h2>
      {hasMeta && (
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-iron">
          {when ? `Inspected ${when}` : 'Inspected'}
          {inspection.inspectedBy ? ` · ${inspection.inspectedBy}` : ''}
        </p>
      )}
      {inspection.summary && (
        <p className="mt-3 font-inter text-[15px] leading-relaxed text-iron">{inspection.summary}</p>
      )}
      {points.length > 0 && (
        <ul className="mt-5 flex flex-col divide-y divide-chalk">
          {points.map((p, i) => {
            const r = RATING[p.rating] ?? RATING.good
            return (
              <li key={i} className="flex items-start justify-between gap-4 py-2.5">
                <div>
                  <span className="font-barlow text-base font-bold uppercase tracking-wide text-sparta-black">
                    {AREA_LABELS[p.area] ?? p.area}
                  </span>
                  {p.note && <p className="mt-0.5 font-inter text-sm text-iron">{p.note}</p>}
                </div>
                <span
                  className={`shrink-0 rounded px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider ${r.cls}`}
                >
                  {r.label}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === '') return null
  return (
    <div className="flex items-center justify-between gap-4 border-b border-chalk py-2.5">
      <span className="font-mono text-[11px] uppercase tracking-wider text-iron">{label}</span>
      <span className="font-mono text-sm font-medium text-sparta-black">{value}</span>
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[10px] border border-chalk bg-white p-6 ${className}`}>{children}</div>
}

export default async function TruckDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const truck = await getTruckBySlug(slug)
  if (!truck) notFound()

  // Sold and past its grace window: the listing is admin-only from here. Send
  // the visitor to inventory rather than 404 — someone following an old link or
  // a stale Google result is a live buyer, and a dead end loses them. Caught
  // within a minute of the window lapsing (see `revalidate` above).
  if (!isPubliclyVisible(truck)) redirect('/inventory')

  const [similar, settings] = await Promise.all([getSimilarTrucks(truck), getSettings()])
  const photos = truckPhotos(truck, 'hero')
  const video = truckVideo(truck)
  const name = truckName(truck)
  const category = BODY_TYPE_TO_CATEGORY[truck.bodyType]
  const sold = isSold(truck)
  const phone = settings.phone
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null
  const classLabel = truck.payloadClass ? truck.payloadClass.replace('-', ' ').toUpperCase() : null
  const insp = truck.inspection
  const hasInspection = Boolean(insp && (insp.summary || (insp.points?.length ?? 0) > 0 || insp.inspectedDate))

  const specSheet =
    truck.specSheet && typeof truck.specSheet === 'object' ? (truck.specSheet as Media) : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: photos.map((p) => p.url),
    description: truck.description,
    sku: truck.stockNumber ?? undefined,
    brand: { '@type': 'Brand', name: makeLabel(truck.make) },
    model: truck.model,
    vehicleModelDate: String(truck.year),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: truck.mileage, unitCode: 'SMI' },
    vehicleIdentificationNumber: truck.vin ?? undefined,
    itemCondition: 'https://schema.org/UsedCondition',
    offers: {
      '@type': 'Offer',
      price: truck.price,
      priceCurrency: 'USD',
      // Must track the real sale state — Google flags rich results whose
      // structured data contradicts what's on the page.
      availability: SCHEMA_AVAILABILITY[truck.availability ?? 'available'],
      itemCondition: 'https://schema.org/UsedCondition',
      url: `${SITE_URL}/trucks/${truck.slug}`,
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Inventory', item: `${SITE_URL}/inventory` },
      {
        '@type': 'ListItem',
        position: 3,
        name: bodyTypeLabel(truck.bodyType),
        item: `${SITE_URL}/inventory/${category}`,
      },
      { '@type': 'ListItem', position: 4, name },
    ],
  }

  return (
    <div className="pb-24 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Inventory', href: '/inventory' },
          { label: `${bodyTypeLabel(truck.bodyType)}s`, href: `/inventory/${category}` },
          { label: name },
        ]}
      />

      <div className="mx-auto max-w-[1280px] px-5 py-8 md:px-10">
        {/* minmax(0,1fr), not a bare 1fr: a bare 1fr floors the track at its
            content's min-content width, and the gallery thumbnail strip (one
            80px thumb per photo) is wider than the column on trucks with a lot
            of photos — which pushed the whole page sideways. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Main column — a div, not <main>: the root layout already renders
              the page's single <main> landmark around this. */}
          <div className="flex flex-col gap-6">
            <Gallery photos={photos} badge={bodyTypeLabel(truck.bodyType)} video={video} />

            {/* Title + price */}
            <Card>
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="font-mono text-xs uppercase tracking-wider text-iron">
                      {truck.year} · {makeLabel(truck.make)}
                    </div>
                    <AvailabilityBadge availability={truck.availability} showAvailable />
                  </div>
                  <h1 className="mt-1 font-barlow text-3xl font-extrabold uppercase leading-tight tracking-tight text-sparta-black md:text-4xl">
                    {truckHeadline(truck)}
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="filled">{bodyTypeLabel(truck.bodyType)}</Badge>
                    {classLabel && <Badge variant="outline">{classLabel}</Badge>}
                    <Badge variant="outline">{truck.fuelType}</Badge>
                  </div>
                </div>
                <div className="shrink-0 sm:text-right">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-iron">Price</div>
                  <div className="font-mono text-3xl font-medium text-orange-ink">
                    {formatPrice(truck.price)}
                  </div>
                  <div className="font-mono text-[11px] text-iron">OBO · Trade-ins welcome</div>
                </div>
              </div>

              {/* Key specs bar */}
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-chalk pt-4 sm:grid-cols-4">
                <KeySpec label="Mileage" value={formatMileage(truck.mileage)} />
                {truck.titleStatus && <KeySpec label="Title" value={TITLE_LABELS[truck.titleStatus]} />}
                <KeySpec label="Stock #" value={truck.stockNumber ?? '—'} />
                <KeySpec
                  label="VIN"
                  value={truck.vin ?? '—'}
                  valueClass="break-all text-xs leading-snug"
                />
              </div>

              {/* Trust strip: brand promise + financing referral + shipping */}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-chalk pt-4 font-mono text-[11px] uppercase tracking-wider text-iron">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-orange" aria-hidden="true" />
                  Inspected before listing
                </span>
                <Link href="/financing" className="inline-flex items-center gap-1.5 hover:text-orange">
                  <CreditCard size={14} className="text-orange" aria-hidden="true" />
                  Financing available →
                </Link>
                <span className="inline-flex items-center gap-1.5">
                  <TruckIcon size={14} className="text-orange" aria-hidden="true" />
                  Nationwide shipping
                </span>
              </div>
            </Card>

            {/* Description */}
            <Card>
              <SectionLabel>Description</SectionLabel>
              <h2 className="mt-2 font-barlow text-2xl font-bold uppercase tracking-tight text-sparta-black">
                About this truck
              </h2>
              <div className="mt-3 flex flex-col gap-3 font-inter text-[15px] leading-relaxed text-iron">
                {truck.description.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </Card>

            {/* Inspection & condition (renders only when filled in) */}
            {hasInspection && insp && <InspectionCard inspection={insp} />}

            {/* Full spec table */}
            <Card>
              <SectionLabel>Full Specifications</SectionLabel>
              <h2 className="mt-2 font-barlow text-2xl font-bold uppercase tracking-tight text-sparta-black">
                Technical details
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                <div>
                  <SpecRow label="Year" value={truck.year} />
                  <SpecRow label="Make" value={makeLabel(truck.make)} />
                  <SpecRow label="Model" value={truck.model} />
                  <SpecRow label="Trim" value={truck.trim} />
                  <SpecRow label="Body Type" value={bodyTypeLabel(truck.bodyType)} />
                  <SpecRow label="Payload Class" value={classLabel} />
                  <SpecRow
                    label="Title"
                    value={truck.titleStatus ? TITLE_LABELS[truck.titleStatus] : null}
                  />
                  <SpecRow
                    label="Owners"
                    value={truck.owners != null ? String(truck.owners) : null}
                  />
                </div>
                <div>
                  <SpecRow label="GVWR" value={truck.gvwr ? `${truck.gvwr.toLocaleString('en-US')} lb` : null} />
                  <SpecRow label="Engine" value={truck.engine} />
                  <SpecRow label="Transmission" value={truck.transmission} />
                  <SpecRow label="Drivetrain" value={truck.drivetrain} />
                  <SpecRow label="Fuel Type" value={truck.fuelType[0].toUpperCase() + truck.fuelType.slice(1)} />
                  <SpecRow label="VIN" value={truck.vin ? <span className="break-all">{truck.vin}</span> : null} />
                </div>
              </div>
            </Card>

            {/* Spec sheet download */}
            {specSheet?.url && (
              <a
                href={specSheet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-[10px] bg-sparta-black p-5 text-bone transition hover:bg-charcoal"
              >
                <FileText className="text-orange" size={28} />
                <div className="flex-1">
                  <div className="font-barlow text-base font-bold uppercase tracking-wide">Spec sheet</div>
                  <div className="font-mono text-xs text-concrete">{specSheet.filename}</div>
                </div>
                <span className="rounded bg-orange px-4 py-2 font-barlow text-sm font-bold uppercase tracking-wider text-sparta-black">
                  Download ↓
                </span>
              </a>
            )}
          </div>

          {/* Sticky lead form (right on desktop, below on mobile) */}
          {/* Offsets come from --header-h, which NavBar measures and republishes
              on resize — the header is 64px on mobile and ~163px on desktop
              (wordmark row + address block), so no single literal works.
              `scroll-mt` is what makes the mobile "Inquire →" button land on the
              form instead of scrolling it under the sticky nav. The 88px
              fallback only applies for the instant before hydration. */}
          <aside
            id="inquire"
            className="scroll-mt-[calc(var(--header-h,88px)+1rem)] lg:sticky lg:top-[calc(var(--header-h,88px)+1.5rem)] lg:self-start"
          >
            {/* A sold truck's page stays reachable from old links and search
                results, so say so plainly before the inquiry form rather than
                letting someone fill it out for a truck that's gone. */}
            {sold && (
              <div className="mb-4 rounded-[10px] border border-chalk bg-sparta-black p-5 text-bone">
                <div className="font-barlow text-lg font-bold uppercase tracking-wide">
                  This truck has been sold
                </div>
                <p className="mt-2 font-inter text-sm leading-relaxed text-concrete">
                  We move trucks quickly. Tell us what you&rsquo;re after and we&rsquo;ll let you
                  know when something similar hits the lot.
                </p>
                <Link
                  href={`/inventory/${category}`}
                  className="mt-4 inline-flex items-center gap-2 font-barlow text-sm font-bold uppercase tracking-wider text-orange hover:text-bone"
                >
                  Browse {bodyTypeLabel(truck.bodyType)}s →
                </Link>
              </div>
            )}
            <LeadForm truckId={truck.id} truckName={name} phone={phone} />
          </aside>
        </div>

        {/* Similar trucks */}
        {similar.length > 0 && (
          <section className="mt-16">
            <SectionLabel>Similar {bodyTypeLabel(truck.bodyType)}s</SectionLabel>
            <h2 className="mt-2 font-barlow text-3xl font-bold uppercase tracking-tight text-sparta-black">
              Others you might like
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((t) => (
                <TruckCard key={t.id} truck={t} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-charcoal bg-sparta-black p-3 lg:hidden">
        {telHref && (
          <a
            href={telHref}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded border border-concrete py-3 font-barlow text-sm font-bold uppercase tracking-wider text-bone"
          >
            <Phone size={16} /> Call
          </a>
        )}
        <a
          href={sold ? `/inventory/${category}` : '#inquire'}
          className="inline-flex flex-[2] items-center justify-center rounded bg-orange py-3 font-barlow text-sm font-bold uppercase tracking-wider text-sparta-black"
        >
          {sold ? 'See similar →' : 'Inquire →'}
        </a>
      </div>
    </div>
  )
}
