'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { InputField, TextareaField } from '@/components/FormField'
import { SuccessCard, ErrorBanner, SubmitButton } from './form-ui'

const schema = z.object({
  fullName: z.string().min(1, 'Please enter your name'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email'),
  truckOfInterest: z.string().optional(),
  message: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export function FinancingForm({ phone }: { phone?: string | null }) {
  const [errored, setErrored] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setErrored(false)
    // Truck-of-interest is free text here; fold it into the message so admin
    // sees it (Leads.truckOfInterest is a relationship, not free text).
    const parts = [
      data.truckOfInterest?.trim() ? `Truck of interest: ${data.truckOfInterest.trim()}` : null,
      data.message?.trim() || null,
    ].filter(Boolean)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          message: parts.length ? parts.join('\n\n') : undefined,
          source: 'financing-prequal',
          financingInterest: true,
        }),
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
        title="Thanks — we'll be in touch."
        message="We'll get your info in front of a commercial lender. Usually one business day for a first response."
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
        id="fin-name"
        label="Full name"
        required
        autoComplete="name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <InputField
        id="fin-phone"
        label="Phone"
        type="tel"
        required
        autoComplete="tel"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <InputField
        id="fin-email"
        label="Email"
        type="email"
        required
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <InputField
        id="fin-truck"
        label="Truck of interest"
        placeholder="VIN, stock #, or 'not sure yet'"
        {...register('truckOfInterest')}
      />
      <TextareaField
        id="fin-message"
        label="Message"
        placeholder="Tell us anything relevant — trade-in, timeline, budget range…"
        {...register('message')}
      />
      {errored && <ErrorBanner canCall={Boolean(phone)} />}
      <SubmitButton pending={isSubmitting}>Start pre-qualification →</SubmitButton>
    </form>
  )
}
