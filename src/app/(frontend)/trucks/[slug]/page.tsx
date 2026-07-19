import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, FileText, Phone } from 'lucide-react'
import type { Media, Truck } from '@/payload-types'
import { getTruckBySlug, getSimilarTrucks, getPublishedSlugs } from '@/lib/trucks'
import { getSettings } from '@/lib/payload'
import { truckPhotos } from '@/lib/media'
import {
  BODY_TYPE_TO_CATEGORY,
  bodyTypeLabel,
  formatMileage,
  formatPrice,
  makeLabel,
} from '@/lib/format'
import { SectionLabel } from '@/components/SectionLabel'
import { TruckCard } from '@/components/TruckCard'
import { Gallery } from '@/components/truck/Gallery'
import { LeadForm } from '@/components/truck/LeadForm'

type Params = { slug: string }

export const revalidate = 60

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getPublishedSlugs()
  return slugs.map((slug) => ({ slug }))
}

function truckName(t: Truck): string {
  return [t.year, makeLabel(t.make), t.model, t.trim].filter(Boolean).join(' ')
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
  return {
    title: `${name} — Sparta Motors`,
    description: `${name}. ${formatMileage(truck.mileage)}. ${bodyTypeLabel(truck.bodyType)}. ${formatPrice(truck.price)}. Spartanburg, SC.`,
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

function KeySpec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-iron">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-medium text-sparta-black">{value}</div>
    </div>
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

  const [similar, settings] = await Promise.all([getSimilarTrucks(truck), getSettings()])
  const photos = truckPhotos(truck, 'hero')
  const name = truckName(truck)
  const category = BODY_TYPE_TO_CATEGORY[truck.bodyType]
  const phone = settings.phone
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null
  const vinShort = `${truck.vin.slice(0, 8)}..${truck.vin.slice(-4)}`
  const classLabel = truck.payloadClass ? truck.payloadClass.replace('-', ' ').toUpperCase() : null

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
    vehicleIdentificationNumber: truck.vin,
    offers: {
      '@type': 'Offer',
      price: truck.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <div className="pb-24 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-chalk bg-warm-white">
        <nav className="mx-auto flex max-w-[1280px] items-center gap-1 overflow-x-auto px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-iron md:px-10">
          <Link href="/" className="hover:text-orange">Home</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <Link href="/inventory" className="hover:text-orange">Inventory</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <Link href={`/inventory/${category}`} className="hover:text-orange">
            {bodyTypeLabel(truck.bodyType)}
          </Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span className="whitespace-nowrap text-sparta-black">{name}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-[1280px] px-5 py-8 md:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main column */}
          <main className="flex flex-col gap-6">
            <Gallery photos={photos} badge={bodyTypeLabel(truck.bodyType)} />

            {/* Title + price */}
            <Card>
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-iron">
                    {truck.year} · {makeLabel(truck.make)}
                  </div>
                  <h1 className="mt-1 font-barlow text-3xl font-extrabold uppercase leading-tight tracking-tight text-sparta-black md:text-4xl">
                    {truck.model} {truck.trim}
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="filled">{bodyTypeLabel(truck.bodyType)}</Badge>
                    {classLabel && <Badge variant="outline">{classLabel}</Badge>}
                    <Badge variant="outline">{truck.fuelType}</Badge>
                  </div>
                </div>
                <div className="shrink-0 sm:text-right">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-iron">Price</div>
                  <div className="font-mono text-3xl font-medium text-orange">
                    {formatPrice(truck.price)}
                  </div>
                  <div className="font-mono text-[11px] text-iron">OBO · Trade-ins welcome</div>
                </div>
              </div>

              {/* Key specs bar */}
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-chalk pt-4 sm:grid-cols-4">
                <KeySpec label="Mileage" value={formatMileage(truck.mileage)} />
                <KeySpec label="VIN" value={vinShort} />
                <KeySpec label="Condition" value={truck.condition[0].toUpperCase() + truck.condition.slice(1)} />
                <KeySpec label="Stock #" value={truck.stockNumber ?? '—'} />
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
                </div>
                <div>
                  <SpecRow label="GVWR" value={truck.gvwr ? `${truck.gvwr.toLocaleString('en-US')} lb` : null} />
                  <SpecRow label="Engine" value={truck.engine} />
                  <SpecRow label="Transmission" value={truck.transmission} />
                  <SpecRow label="Drivetrain" value={truck.drivetrain} />
                  <SpecRow label="Fuel Type" value={truck.fuelType[0].toUpperCase() + truck.fuelType.slice(1)} />
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
          </main>

          {/* Sticky lead form (right on desktop, below on mobile) */}
          <aside id="inquire" className="lg:sticky lg:top-[88px] lg:self-start">
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
          href="#inquire"
          className="inline-flex flex-[2] items-center justify-center rounded bg-orange py-3 font-barlow text-sm font-bold uppercase tracking-wider text-sparta-black"
        >
          Inquire →
        </a>
      </div>
    </div>
  )
}
