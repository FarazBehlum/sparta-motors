'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2 } from 'lucide-react'
import { InputField, TextareaField } from '@/components/FormField'
import { Honeypot } from '@/components/Honeypot'
import { formatPhone } from '@/lib/format'

const schema = z
  .object({
    fullName: z.string().optional(),
    phone: z.string().optional(),
    email: z.union([z.literal(''), z.string().email('Enter a valid email')]).optional(),
    message: z.string().optional(),
    financingInterest: z.boolean().optional(),
    tradeIn: z.boolean().optional(),
    tradeInYearMakeModel: z.string().optional(),
    tradeInMileage: z.string().optional(),
    tradeInCondition: z.string().optional(),
    website: z.string().optional(), // honeypot
  })
  // Nothing is required except a way to reach the person back.
  .refine((d) => Boolean(d.email?.trim()) || Boolean(d.phone?.trim()), {
    message: 'Add a phone number or email so we can reach you.',
    path: ['email'],
  })

type FormValues = z.infer<typeof schema>

function Checkbox({
  id,
  label,
  subtext,
  ...rest
}: { id: string; label: string; subtext: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label htmlFor={id} className="flex cursor-pointer gap-2.5">
      <input id={id} type="checkbox" className="mt-0.5 h-4 w-4 accent-orange" {...rest} />
      <span>
        <span className="block font-inter text-sm font-medium text-sparta-black">{label}</span>
        <span className="block font-inter text-xs text-iron">{subtext}</span>
      </span>
    </label>
  )
}

export function LeadForm({
  truckId,
  truckName,
  phone,
}: {
  truckId: number
  truckName: string
  phone?: string | null
}) {
  const [status, setStatus] = useState<'idle' | 'error'>('idle')
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const tradeIn = watch('tradeIn')
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null

  const onSubmit = async (data: FormValues) => {
    setStatus('idle')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName?.trim() || undefined,
          phone: data.phone?.trim() || undefined,
          email: data.email?.trim() || undefined,
          message: data.message || undefined,
          website: data.website || undefined,
          source: 'truck-inquiry',
          truckOfInterest: truckId,
          financingInterest: Boolean(data.financingInterest),
          tradeIn: Boolean(data.tradeIn),
          tradeInYearMakeModel: data.tradeIn ? data.tradeInYearMakeModel : undefined,
          tradeInMileage:
            data.tradeIn && data.tradeInMileage ? Number(data.tradeInMileage) : undefined,
          tradeInCondition: data.tradeIn ? data.tradeInCondition : undefined,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      setSubmitted(true)
    } catch {
      setStatus('error')
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[10px] border border-chalk bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto text-success" size={40} />
        <h3 className="mt-4 font-barlow text-2xl font-bold uppercase tracking-tight text-sparta-black">
          Thanks — we&rsquo;ll be in touch soon.
        </h3>
        <p className="mt-2 font-inter text-sm text-iron">
          We usually reply within a few hours during business hours.
        </p>
        {telHref && (
          <p className="mt-4 font-inter text-sm text-iron">
            Need us sooner?{' '}
            <a href={telHref} className="font-semibold text-orange-ink hover:underline">
              Call {formatPhone(phone)}
            </a>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-chalk bg-white">
      {/* Header */}
      <div className="bg-sparta-black px-6 py-5 text-bone">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange">
          <span aria-hidden="true">◆ </span>Inquire
        </div>
        <h2 className="mt-1 font-barlow text-xl font-bold uppercase tracking-tight">
          Contact about this truck
        </h2>
        <p className="mt-1 font-inter text-xs text-concrete">
          We usually reply within a few hours.
        </p>
      </div>

      {/* Truck of interest */}
      <div className="bg-orange px-6 py-3">
        <div className="font-mono text-[10px] uppercase tracking-wider text-sparta-black/70">
          Truck of interest
        </div>
        <div className="font-barlow text-base font-bold uppercase tracking-tight text-sparta-black">
          {truckName}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6">
        <Honeypot {...register('website')} />
        <InputField
          id="lead-name"
          label="Full name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <InputField
          id="lead-phone"
          label="Phone"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <InputField
          id="lead-email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <p className="-mt-1 font-inter text-xs text-iron">
          Leave us a phone number or an email so we can get back to you.
        </p>
        <TextareaField
          id="lead-message"
          label="Message"
          placeholder="Any questions about this truck?"
          error={errors.message?.message}
          {...register('message')}
        />

        <div className="flex flex-col gap-3 border-t border-chalk pt-4">
          <Checkbox
            id="lead-financing"
            label="Interested in financing"
            subtext="We'll connect you with a partner lender."
            {...register('financingInterest')}
          />
          <Checkbox
            id="lead-tradein"
            label="Have a trade-in"
            subtext="Trading in a truck? Tell us about it."
            {...register('tradeIn')}
          />
        </div>

        {tradeIn && (
          <div className="flex flex-col gap-3 rounded border border-chalk bg-warm-white p-4">
            <InputField
              id="lead-trade-ymm"
              label="Year / Make / Model"
              placeholder="e.g. 2016 Isuzu NPR"
              {...register('tradeInYearMakeModel')}
            />
            <InputField
              id="lead-trade-mileage"
              label="Mileage"
              type="number"
              inputMode="numeric"
              {...register('tradeInMileage')}
            />
            <InputField
              id="lead-trade-condition"
              label="Condition"
              placeholder="e.g. Runs great, minor rust"
              {...register('tradeInCondition')}
            />
          </div>
        )}

        {status === 'error' && (
          <p className="rounded bg-warning-soft px-3 py-2 font-inter text-sm text-warning-dark">
            Something went wrong sending your inquiry. Please try again{telHref ? ' or call us' : ''}.
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-orange px-5 py-3 font-barlow text-sm font-bold uppercase tracking-wider text-sparta-black transition hover:brightness-105 disabled:opacity-60"
        >
          {isSubmitting ? 'Sending…' : 'Send inquiry →'}
        </button>
      </form>

      {telHref && (
        <div className="border-t border-chalk bg-warm-white px-6 py-4 text-center">
          <div className="font-mono text-[10px] uppercase tracking-wider text-iron">
            Or call directly
          </div>
          <a href={telHref} className="font-mono text-lg font-medium text-sparta-black hover:text-orange">
            {formatPhone(phone)}
          </a>
        </div>
      )}
    </div>
  )
}
