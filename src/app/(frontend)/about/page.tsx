import React from 'react'
import type { Metadata } from 'next'
import { getSettings } from '@/lib/payload'
import { addressLines, coords } from '@/lib/location'
import { formatPhone } from '@/lib/format'
import { organizationJsonLd } from '@/lib/structured-data'
import { Container } from '@/components/Container'
import { SectionLabel } from '@/components/SectionLabel'
import { PageHeader } from '@/components/content/PageHeader'
import { ContentSection } from '@/components/content/ContentSection'
import { Callout } from '@/components/content/Callout'
import { StatsStrip, type StripStat } from '@/components/content/StatsStrip'
import { FadeInSection } from '@/components/home/FadeInSection'
import { LocationMap } from '@/components/map/LocationMap'

export const metadata: Metadata = {
  title: 'About Sparta Motors',
  description:
    'Family-run used commercial truck dealer in Spartanburg, SC. Serving small businesses since 2018.',
  alternates: { canonical: '/about' },
}

const STATS: StripStat[] = [
  { label: 'Est.', value: '2018', desc: 'Spartanburg, SC' },
  { label: 'Trucks sold', value: '400+', desc: 'Small businesses served' },
  { label: 'Body types', value: '06', desc: 'Box, reefer, day cab, dump, tow, flatbed' },
  { label: 'Brands', value: '08', desc: 'Isuzu, Hino, Freightliner, Nissan + more' },
]

export default async function AboutPage() {
  const settings = await getSettings()
  const lines = addressLines(settings)
  const { lat, lng } = coords(settings)
  const phone = settings.phone
  const email = settings.email

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(settings)) }}
      />

      <PageHeader
        watermark="About"
        breadcrumb="About"
        label="About Sparta Motors"
        title="Trucks for working businesses. Since 2018."
      />

      {/* Intro paragraph */}
      <section className="bg-bone">
        <Container width="prose" className="py-14 md:py-20">
          <FadeInSection>
            <p className="font-inter text-lg leading-relaxed text-sparta-black md:text-xl">
              Sparta Motors is a family-run used commercial truck dealer based in Spartanburg, SC. We
              opened our doors in 2018 and have spent every year since building a reputation for
              straight talk, honest specs, and trucks that show up to work. We sell to landscapers,
              delivery operators, tow companies, contractors, and any small business that needs a
              truck that runs when they turn the key.
            </p>
          </FadeInSection>
        </Container>
      </section>

      <StatsStrip stats={STATS} />

      {/* How we work callout */}
      <section className="bg-bone">
        <Container width="prose" className="py-14 md:py-16">
          <FadeInSection>
            <Callout label="How we work">
              <p>
                Every truck is inspected before it goes on our lot. If it doesn&apos;t run right, we
                don&apos;t sell it. Real mileage, real condition notes, real photos. VIN on every
                listing so you can run your own report. That&apos;s the whole model — no games, no
                hidden reconditioning, no upsell.
              </p>
            </Callout>
          </FadeInSection>
        </Container>
      </section>

      {/* Location */}
      <section className="bg-warm-white">
        <Container width="wide" className="py-14 md:py-20">
          <FadeInSection>
            <SectionLabel>Find us</SectionLabel>
            <h2 className="mt-2 font-barlow text-4xl font-bold uppercase tracking-tight text-sparta-black md:text-5xl">
              Come see the trucks.
            </h2>
            <p className="mt-3 max-w-2xl font-inter leading-relaxed text-iron">
              We&apos;re in Spartanburg, SC. Stop by during business hours — plenty of room to walk
              the lot.
            </p>
          </FadeInSection>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-5">
            {/* Address / hours / contact card */}
            <div className="md:col-span-3">
              <div className="rounded-[10px] border border-chalk bg-white p-6 md:p-7">
                <DetailGroup heading="Address">
                  <address className="font-mono text-sm not-italic leading-relaxed text-sparta-black">
                    {lines.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </address>
                </DetailGroup>

                <DetailGroup heading="Hours">
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 font-inter text-sm">
                    <HoursRow day="Mon–Fri" value={settings.hoursMonFri} />
                    <HoursRow day="Sat" value={settings.hoursSat} />
                    <HoursRow day="Sun" value={settings.hoursSun} />
                  </dl>
                </DetailGroup>

                <DetailGroup heading="Contact" last>
                  {phone && (
                    <a
                      href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                      className="block font-mono text-base text-sparta-black hover:text-orange"
                    >
                      {formatPhone(phone)}
                    </a>
                  )}
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="mt-1 block font-mono text-sm text-iron hover:text-orange"
                    >
                      {email}
                    </a>
                  )}
                </DetailGroup>
              </div>
            </div>

            {/* Map */}
            <div className="md:col-span-2">
              <LocationMap
                lat={lat}
                lng={lng}
                addressLines={lines}
                phone={phone}
                height={400}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

function DetailGroup({
  heading,
  last,
  children,
}: {
  heading: string
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={last ? '' : 'mb-6'}>
      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-iron">{heading}</h3>
      {children}
    </div>
  )
}

function HoursRow({ day, value }: { day: string; value?: string | null }) {
  if (!value) return null
  return (
    <>
      <dt className="font-mono text-xs uppercase tracking-wider text-orange">{day}</dt>
      <dd className="text-sparta-black">{value}</dd>
    </>
  )
}
