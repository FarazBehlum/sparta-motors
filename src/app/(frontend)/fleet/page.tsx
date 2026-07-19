import React from 'react'
import type { Metadata } from 'next'
import { getSettings } from '@/lib/payload'
import { PageHeader } from '@/components/content/PageHeader'
import { ContentSection } from '@/components/content/ContentSection'
import { ProcessSteps, type Step } from '@/components/content/ProcessSteps'
import { InfoGrid, type InfoItem } from '@/components/content/InfoGrid'
import { FormCTA } from '@/components/content/FormCTA'
import { FleetForm } from '@/components/content/FleetForm'

export const metadata: Metadata = {
  title: 'Fleet Truck Sourcing',
  description:
    'Fleet and bulk sourcing for used commercial trucks. We source box trucks, day cabs, dump trucks, and more for growing businesses. Spartanburg, SC.',
  alternates: { canonical: '/fleet' },
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Tell us the spec',
    body: 'Body type, quantity, budget range, timeline. The more specific the better — helps us know exactly what to keep an eye out for.',
  },
  {
    num: '02',
    title: 'We source it',
    body: 'We keep an ongoing lookout at auctions, trade-ins, and our network. If a truck matches your spec, we grab it and let you know.',
  },
  {
    num: '03',
    title: 'You get first look',
    body: 'Fleet inquiries get first look at matched trucks — before anything hits public inventory. See it, drive it, decide.',
  },
]

const BODY_TYPES: InfoItem[] = [
  { title: 'Box Trucks', body: '14–26ft. Most common. Fast to source, wide availability.' },
  {
    title: 'Day Cabs',
    body: 'Class 6–8. Freightliner, Hino, Isuzu, Peterbilt. Regional lookout.',
  },
  {
    title: 'Reefers',
    body: 'Refrigerated box units. Slower to source, but doable — allow 2–8 weeks.',
  },
  { title: 'Dump Trucks', body: '6–10 wheel. Construction, landscaping, aggregate hauling.' },
  { title: 'Tow Trucks', body: 'Rollback, wheel lift, wrecker. Specialized — allow more time.' },
  {
    title: 'Flat Beds',
    body: 'Class 5–7. Cabinet, chipper, service, landscape. Regional availability varies.',
  },
]

export default async function FleetPage() {
  const settings = await getSettings()
  const phone = settings.phone

  return (
    <>
      <PageHeader
        watermark="Fleet"
        breadcrumb="Fleet"
        label="Fleet & bulk sourcing"
        title="Growing your fleet? We source the trucks."
        subtitle="Sparta Motors doesn't warehouse fleet inventory. What we do is source used commercial trucks for small businesses and growing fleets — tell us the spec, and we find it as trucks come available."
      />

      <ContentSection
        tone="light"
        label="How we source"
        title="Straightforward. No guessing games."
        lead="Three steps. No pressure, no hidden fees, no promises we can't keep."
      >
        <ProcessSteps steps={STEPS} />
      </ContentSection>

      <ContentSection
        tone="warm"
        label="What we source"
        title="Every body type we carry."
        lead="If we sell it as a single unit, we can source it in quantity. Timelines vary by body type and market — box trucks and day cabs move fastest."
      >
        <InfoGrid items={BODY_TYPES} />
      </ContentSection>

      <ContentSection
        tone="dark"
        label="Start here"
        title="Start a fleet inquiry."
        lead="Fill this out — the more you tell us, the faster we can start sourcing."
      >
        <FormCTA
          tone="dark"
          heading="Fleet inquiry form"
          description="Different from our standard lead form — this one captures fleet-specific info so we know exactly what to source. You'll hear back within a business day."
          phone={phone}
          callLead="Prefer to talk it through?"
        >
          <FleetForm phone={phone} />
        </FormCTA>
      </ContentSection>
    </>
  )
}
