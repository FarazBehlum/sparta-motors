'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { InputField, TextareaField, SelectField } from '@/components/FormField'
import { SuccessCard, ErrorBanner, SubmitButton } from './form-ui'

const FLEET_SIZE = [
  { label: '1–3 trucks', value: '1-3' },
  { label: '4–10 trucks', value: '4-10' },
  { label: '10+ trucks', value: '10-plus' },
]
const TIMELINE = [
  { label: 'ASAP', value: 'asap' },
  { label: '1–3 months', value: '1-3-months' },
  { label: '3–6 months', value: '3-6-months' },
  { label: 'Ongoing / open', value: 'ongoing' },
]

const schema = z.object({
  companyName: z.string().min(1, 'Please enter your company name'),
  contactName: z.string().min(1, 'Please enter a contact name'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email'),
  fleetSize: z.string().min(1, 'Select a fleet size'),
  timeline: z.string().min(1, 'Select a timeline'),
  trucksNeeded: z.string().min(1, 'Tell us what you need'),
})
type FormValues = z.infer<typeof schema>

export function FleetForm({ phone }: { phone?: string | null }) {
  const [errored, setErrored] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setErrored(false)
    try {
      const res = await fetch('/api/fleet-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Request failed')
      setSubmitted(true)
    } catch {
      setErrored(true)
    }
  }

  if (submitted) {
    return (
      <SuccessCard
        title="Fleet inquiry received."
        message="We'll start the lookout and get back to you within a business day."
        phone={phone}
      />
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-[10px] border border-chalk bg-white p-6"
    >
      <InputField
        id="fleet-company"
        label="Company name"
        required
        autoComplete="organization"
        error={errors.companyName?.message}
        {...register('companyName')}
      />
      <InputField
        id="fleet-contact"
        label="Contact name"
        required
        autoComplete="name"
        error={errors.contactName?.message}
        {...register('contactName')}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="fleet-phone"
          label="Phone"
          type="tel"
          required
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <InputField
          id="fleet-email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          id="fleet-size"
          label="Fleet size"
          required
          placeholder="Select…"
          options={FLEET_SIZE}
          error={errors.fleetSize?.message}
          {...register('fleetSize')}
        />
        <SelectField
          id="fleet-timeline"
          label="Timeline"
          required
          placeholder="Select…"
          options={TIMELINE}
          error={errors.timeline?.message}
          {...register('timeline')}
        />
      </div>
      <TextareaField
        id="fleet-needed"
        label="Trucks needed"
        required
        rows={4}
        placeholder="e.g. 3 box trucks 16ft+, diesel, under $40k each, prefer Isuzu or Hino…"
        error={errors.trucksNeeded?.message}
        {...register('trucksNeeded')}
      />
      {errored && <ErrorBanner canCall={Boolean(phone)} />}
      <SubmitButton pending={isSubmitting}>Send fleet inquiry →</SubmitButton>
    </form>
  )
}
