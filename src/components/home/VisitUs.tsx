import React from 'react'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { LocationMap } from '@/components/map/LocationMap'
import { formatPhone } from '@/lib/format'
import { FadeInSection } from './FadeInSection'

type VisitUsProps = {
  lat: number
  lng: number
  addressLines: string[]
  phone?: string | null
  hoursMonFri?: string | null
  hoursSat?: string | null
  hoursSun?: string | null
}

/**
 * "Visit the lot" home section — the reusable map paired with address, phone,
 * and hours. Data comes from Settings via the home page. Sits just above the
 * Parts CTA strip.
 */
export function VisitUs({
  lat,
  lng,
  addressLines: lines,
  phone,
  hoursMonFri,
  hoursSat,
  hoursSun,
}: VisitUsProps) {
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined

  return (
    <section className="bg-bone">
      <Container width="wide" className="py-14 md:py-20">
        <FadeInSection className="grid gap-8 md:grid-cols-2 md:items-stretch md:gap-10">
          {/* Left: heading + address, phone, hours */}
          <div className="flex flex-col">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange-ink">
              <span aria-hidden="true">◆ </span>Visit the lot
            </p>
            <h2 className="mt-2 font-barlow text-4xl font-bold uppercase leading-[0.95] tracking-tight text-sparta-black md:text-5xl">
              Come see the trucks in person.
            </h2>
            <p className="mt-4 font-inter leading-relaxed text-iron">
              We&apos;re in Spartanburg, SC, with plenty of room to walk the lot. Stop by during
              hours or call ahead for after-hours access.
            </p>
            <p className="mt-2 font-inter leading-relaxed text-iron">
              Can&apos;t make it in person? We ship trucks nationwide. Ask us for a delivery quote.
            </p>

            <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.3em] text-concrete">
                  Address
                </dt>
                <dd className="mt-2 font-inter text-base leading-snug text-sparta-black">
                  {lines.length ? (
                    lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))
                  ) : (
                    <span>—</span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.3em] text-concrete">
                  Phone
                </dt>
                <dd className="mt-2 font-inter text-base leading-snug text-sparta-black">
                  {phone ? (
                    <a href={telHref} className="hover:text-orange">
                      {formatPhone(phone)}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.3em] text-concrete">
                  Hours
                </dt>
                <dd className="mt-2 space-y-1 font-inter text-base leading-snug text-sparta-black">
                  <HoursLine day="Mon–Fri" value={hoursMonFri} />
                  <HoursLine day="Sat" value={hoursSat} />
                  <HoursLine day="Sun" value={hoursSun} />
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded border border-sparta-black px-6 py-3 font-barlow text-sm font-bold uppercase tracking-wider text-sparta-black transition-colors duration-150 hover:bg-sparta-black hover:text-bone"
              >
                Get directions &amp; contact →
              </Link>
            </div>
          </div>

          {/* Right: the map. Fixed height on mobile; stretches to match the
              left column on md (grid items-stretch gives a definite height). */}
          <div className="h-[340px] md:h-auto">
            <LocationMap lat={lat} lng={lng} addressLines={lines} height="100%" />
          </div>
        </FadeInSection>
      </Container>
    </section>
  )
}

function HoursLine({ day, value }: { day: string; value?: string | null }) {
  return (
    <span className="flex items-baseline justify-between gap-4 border-b border-chalk pb-1 last:border-0 last:pb-0">
      <span className="text-iron">{day}</span>
      <span className="font-mono text-sm text-sparta-black">{value || '—'}</span>
    </span>
  )
}
