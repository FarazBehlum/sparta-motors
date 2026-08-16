'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { InputField, TextareaField } from '@/components/FormField'
import { Honeypot } from '@/components/Honeypot'
import { SuccessCard, ErrorBanner, SubmitButton } from './form-ui'

const schema = z
  .object({
    fullName: z.string().optional(),
    phone: z.string().optional(),
    email: z.union([z.literal(''), z.string().email('Enter a valid email')]).optional(),
    truckOfInterest: z.string().optional(),
    message: z.string().optional(),
    website: z.string().optional(), // honeypot
  })
  // Nothing is required except a way to reach the person back.
  .refine((d) => Boolean(d.email?.trim()) || Boolean(d.phone?.trim()), {
    message: 'Add a phone number or email so we can reach you.',
    path: ['email'],
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
          fullName: data.fullName?.trim() || undefined,
          phone: data.phone?.trim() || undefined,
          email: data.email?.trim() || undefined,
          message: parts.length ? parts.join('\n\n') : undefined,
          website: data.website || undefined,
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
        title="Thanks. We'll be in touch."
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
      <Honeypot {...register('website')} />
      <InputField
        id="fin-name"
        label="Full name"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <InputField
        id="fin-phone"
        label="Phone"
        type="tel"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <InputField
        id="fin-email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <p className="-mt-1 font-inter text-xs text-iron">
        Leave us a phone number or an email so we can get back to you.
      </p>
      <InputField
        id="fin-truck"
        label="Truck of interest"
        placeholder="VIN, stock #, or 'not sure yet'"
        {...register('truckOfInterest')}
      />
      <TextareaField
        id="fin-message"
        label="Message"
        placeholder="Tell us anything relevant: trade-in, timeline, budget range"
        {...register('message')}
      />
      {errored && <ErrorBanner canCall={Boolean(phone)} />}
      <SubmitButton pending={isSubmitting}>Start pre-qualification →</SubmitButton>
    </form>
  )
}
