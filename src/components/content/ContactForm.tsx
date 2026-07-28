'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { InputField, TextareaField, SelectField } from '@/components/FormField'
import { Honeypot } from '@/components/Honeypot'
import { HEARD_ABOUT_US_OPTIONS } from '@/lib/options'
import { SuccessCard, ErrorBanner, SubmitButton } from './form-ui'

const schema = z
  .object({
    fullName: z.string().optional(),
    phone: z.string().optional(),
    email: z.union([z.literal(''), z.string().email('Enter a valid email')]).optional(),
    heardAboutUs: z.string().optional(),
    message: z.string().optional(),
    website: z.string().optional(), // honeypot
  })
  // Nothing is required except a way to reach the person back.
  .refine((d) => Boolean(d.email?.trim()) || Boolean(d.phone?.trim()), {
    message: 'Add a phone number or email so we can reach you.',
    path: ['email'],
  })
type FormValues = z.infer<typeof schema>

export function ContactForm({ phone }: { phone?: string | null }) {
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
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName?.trim() || undefined,
          phone: data.phone?.trim() || undefined,
          email: data.email?.trim() || undefined,
          message: data.message?.trim() || undefined,
          heardAboutUs: data.heardAboutUs || undefined,
          website: data.website || undefined,
          source: 'general-contact',
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
        title="Message sent."
        message="Thanks for reaching out — we usually reply within a few hours during business hours."
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
        id="contact-name"
        label="Full name"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="contact-phone"
          label="Phone"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <InputField
          id="contact-email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>
      <p className="-mt-2 font-inter text-xs text-iron">
        Leave us a phone number or an email so we can get back to you.
      </p>
      <SelectField
        id="contact-heard"
        label="How did you hear about us?"
        placeholder="Select…"
        options={HEARD_ABOUT_US_OPTIONS}
        {...register('heardAboutUs')}
      />
      <TextareaField
        id="contact-message"
        label="Message"
        placeholder="How can we help?"
        error={errors.message?.message}
        {...register('message')}
      />
      {errored && <ErrorBanner canCall={Boolean(phone)} />}
      <SubmitButton pending={isSubmitting}>Send message →</SubmitButton>
    </form>
  )
}
