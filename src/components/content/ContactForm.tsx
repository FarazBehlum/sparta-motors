'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { InputField, TextareaField, SelectField } from '@/components/FormField'
import { HEARD_ABOUT_US_OPTIONS } from '@/lib/options'
import { SuccessCard, ErrorBanner, SubmitButton } from './form-ui'

const schema = z.object({
  fullName: z.string().min(1, 'Please enter your name'),
  phone: z.string().optional(),
  email: z.string().email('Enter a valid email'),
  heardAboutUs: z.string().optional(),
  message: z.string().min(1, 'Please enter a message'),
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
          fullName: data.fullName,
          phone: data.phone?.trim() || undefined,
          email: data.email,
          message: data.message,
          heardAboutUs: data.heardAboutUs || undefined,
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
      <InputField
        id="contact-name"
        label="Full name"
        required
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
          required
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>
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
        required
        placeholder="How can we help?"
        error={errors.message?.message}
        {...register('message')}
      />
      {errored && <ErrorBanner canCall={Boolean(phone)} />}
      <SubmitButton pending={isSubmitting}>Send message →</SubmitButton>
    </form>
  )
}
