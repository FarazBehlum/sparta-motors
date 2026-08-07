import React from 'react'
import type { Metadata } from 'next'
import { getSettings } from '@/lib/payload'
import { addressLines, coords } from '@/lib/location'
import { formatPhone } from '@/lib/format'
import { organizationJsonLd } from '@/lib/structured-data'
import { Container } from '@/components/Container'
import { PageHeader } from '@/components/content/PageHeader'
import { ContentSection } from '@/components/content/ContentSection'
import { FormCTA } from '@/components/content/FormCTA'
import { ContactForm } from '@/components/content/ContactForm'
import { PartsCTA } from '@/components/home/PartsCTA'
import { LocationMap } from '@/components/map/LocationMap'
import { FadeInSection } from '@/components/home/FadeInSection'

// Description is built from Settings so the phone number always matches the
// live business record (never a hardcoded placeholder).
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const call = settings.phone ? `Call ${formatPhone(settings.phone)} or email us.` : 'Call or email us.'
  return {
    title: 'Contact Sparta Motors',
    description: `Contact Sparta Motors — used commercial truck dealer in Spartanburg, SC. ${call} Mon–Fri 8am–5pm.`,
    alternates: { canonical: '/contact' },
  }
}

export default async function ContactPage() {
  const settings = await getSettings()
  const lines = addressLines(settings)
  const { lat, lng } = coords(settings)
  const phone = settings.phone
  const email = settings.email
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(settings)) }}
      />

      <PageHeader
        watermark="Contact"
        breadcrumb="Contact"
        label="Get in touch"
        title="Give us a call. Send us a note."
        subtitle="Fastest way to get an answer is a phone call. If email works better, drop us a note — we usually respond within a few hours during business hours."
      />

      {/* Contact cards + full map */}
      <section className="bg-bone">
        <Container width="wide" className="py-14 md:py-20">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <ContactCard label="Call" sub="Fastest way to get an answer.">
              {phone ? (
                <a href={telHref} className="hover:text-orange">
                  {formatPhone(phone)}
                </a>
              ) : (
                '—'
              )}
            </ContactCard>

            <ContactCard label="Email" sub="We reply within a few hours during business hours.">
              {email ? (
                <a href={`mailto:${email}`} className="break-all text-lg hover:text-orange">
                  {email}
                </a>
              ) : (
                '—'
              )}
            </ContactCard>

            <ContactCard label="Visit" sub="Plenty of room to walk the lot.">
              <span className="block text-base leading-snug">
                {lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </ContactCard>

            <ContactCard label="Hours" sub="Come during hours or call ahead for after-hours access.">
              <span className="block space-y-0.5 text-base leading-snug">
                <HoursLine day="Mon–Fri" value={settings.hoursMonFri} />
                <HoursLine day="Sat" value={settings.hoursSat} />
                <HoursLine day="Sun" value={settings.hoursSun} />
              </span>
            </ContactCard>
          </div>

          <FadeInSection className="mt-8">
            <LocationMap lat={lat} lng={lng} addressLines={lines} height={440} />
          </FadeInSection>
        </Container>
      </section>

      {/* General contact form */}
      <ContentSection
        tone="warm"
        label="Send a message"
        title="Or drop us a note."
        lead="Not sure which truck you want? Have a general question? Send it here. We usually respond within a few hours."
      >
        <FormCTA
          tone="light"
          heading="General contact form"
          description="For truck-specific inquiries, use the inquiry form on the truck's listing — we can respond faster with the truck already flagged. For anything else, this form works great."
          phone={phone}
          callLead="Urgent?"
        >
          <ContactForm phone={phone} />
        </FormCTA>
      </ContentSection>

      <PartsCTA />
    </>
  )
}

function ContactCard({
  label,
  sub,
  children,
}: {
  label: string
  sub: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[10px] border border-chalk bg-white p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange-ink">
        <span aria-hidden="true">◆ </span>
        {label}
      </p>
      <div className="mt-3 font-barlow text-xl font-bold uppercase tracking-tight text-sparta-black">
        {children}
      </div>
      <p className="mt-3 font-inter text-xs leading-relaxed text-iron">{sub}</p>
    </div>
  )
}

function HoursLine({ day, value }: { day: string; value?: string | null }) {
  if (!value) return null
  return (
    <span className="block font-barlow text-base font-bold uppercase tracking-tight">
      <span className="text-orange-ink">{day}</span>{' '}
      <span className="text-sparta-black">{value}</span>
    </span>
  )
}
