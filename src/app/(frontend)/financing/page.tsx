import React from 'react'
import type { Metadata } from 'next'
import { getSettings } from '@/lib/payload'
import { PageHeader } from '@/components/content/PageHeader'
import { ContentSection } from '@/components/content/ContentSection'
import { ProcessSteps, type Step } from '@/components/content/ProcessSteps'
import { InfoGrid, type InfoItem } from '@/components/content/InfoGrid'
import { Callout } from '@/components/content/Callout'
import { FormCTA } from '@/components/content/FormCTA'
import { FinancingForm } from '@/components/content/FinancingForm'
import { JotFormEmbed } from '@/components/content/JotFormEmbed'

// The lender's credit application, hosted on JotForm. Applicant data (including
// SSNs) goes straight to them; it is deliberately not routed through /api/leads.
const APPLICATION_FORM_ID = '231048325244146'

export const metadata: Metadata = {
  title: 'Commercial Truck Financing',
  description:
    'Financing options for used commercial trucks. We connect small businesses with commercial lenders. Spartanburg, SC.',
  alternates: { canonical: '/financing' },
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Find your truck',
    body: "Browse our inventory or tell us what you're looking for. Once you know the truck, we can move on financing in parallel.",
  },
  {
    num: '02',
    title: 'Tell us about your business',
    body: 'Fill out the credit application on this page. Business info, owner info, and financials. Set aside about 10 minutes.',
  },
  {
    num: '03',
    title: 'We connect you with a lender',
    body: 'Based on your situation, we send your info to a lender we work with who specializes in commercial vehicles. They’ll reach out directly.',
  },
]

const DOCS: InfoItem[] = [
  { title: 'Business Info', body: 'EIN, years operating, industry, annual revenue estimate.' },
  { title: 'Personal Info', body: 'Legal name, SSN, home address, approximate credit range.' },
  {
    title: 'Down Payment',
    body: 'Typically 10–20% depending on credit and lender. Cash or trade-in both work.',
  },
  {
    title: 'Bank Statements',
    body: 'Last 3 months of business bank statements. Shows the lender you can carry the payment.',
  },
  {
    title: 'Truck of Interest',
    body: 'The specific truck you’re pre-qualifying for. VIN or stock number is enough.',
  },
  {
    title: 'Trade-In (Optional)',
    body: 'Have a truck to trade in? Year/make/model and rough condition helps us structure the deal.',
  },
]

export default async function FinancingPage() {
  const settings = await getSettings()
  const phone = settings.phone

  return (
    <>
      <PageHeader
        watermark="Financing"
        breadcrumb="Financing"
        label="Commercial truck financing"
        title="We help you get the truck."
        subtitle="Sparta Motors doesn't finance directly. We work with commercial lenders and banks who do, and we'll connect you with the right one."
      />

      <ContentSection
        tone="light"
        label="How it works"
        title="Three steps to financing."
        lead="Straightforward process. No surprises, no runaround. Most buyers get an answer within a business day."
      >
        <ProcessSteps steps={STEPS} />
      </ContentSection>

      <ContentSection
        tone="warm"
        label="What you'll need"
        title="Documents to have ready."
        lead="Every lender's list is a little different, but these are the basics. Have them ready and pre-qualification is fast."
      >
        <InfoGrid items={DOCS} />
        <div className="mt-10">
          <Callout label="Heads up">
            <p>
              <strong>Sparta Motors is not a lender.</strong> We do not process loans or approve
              credit. Financing decisions are made by the lender, not by us. We just help make the
              connection so you don&apos;t have to shop lenders yourself.
            </p>
          </Callout>
        </div>
      </ContentSection>

      <ContentSection
        tone="light"
        label="Apply"
        title="Financing application."
        lead="This is the lender's own credit application, so it carries their name and branding rather than ours. Your answers go directly to them. Sparta Motors never sees or stores what you enter here."
      >
        <JotFormEmbed
          formId={APPLICATION_FORM_ID}
          title="Business credit application"
          className="mt-10"
        />
      </ContentSection>

      <ContentSection
        tone="dark"
        label="Not ready to apply?"
        title="Rather talk first?"
        lead="A full credit application is a lot to fill out before you've even settled on a truck. If you'd rather ask questions first, leave us a note instead."
      >
        <FormCTA
          tone="dark"
          heading="Quick financing question"
          description="Just enough for us to reach you. Use this if you want to talk through your options, get a rough idea of what you'd qualify for, or ask about financing a specific truck before you fill anything out."
          phone={phone}
        >
          <FinancingForm phone={phone} />
        </FormCTA>
      </ContentSection>
    </>
  )
}
