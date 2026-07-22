'use client'

import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { formatPhone, telHref } from '@/lib/format'

/** Post-submit confirmation card, shared by all content forms. */
export function SuccessCard({
  title,
  message,
  phone,
}: {
  title: string
  message: string
  phone?: string | null
}) {
  const href = telHref(phone)
  return (
    <div className="rounded-[10px] border border-chalk bg-white p-8 text-center">
      <CheckCircle2 className="mx-auto text-success" size={40} />
      <h3 className="mt-4 font-barlow text-2xl font-bold uppercase tracking-tight text-sparta-black">
        {title}
      </h3>
      <p className="mt-2 font-inter text-sm text-iron">{message}</p>
      {href && (
        <p className="mt-4 font-inter text-sm text-iron">
          Need us sooner?{' '}
          <a href={href} className="font-semibold text-orange-ink hover:underline">
            Call {formatPhone(phone)}
          </a>
        </p>
      )}
    </div>
  )
}

export function ErrorBanner({ canCall }: { canCall?: boolean }) {
  return (
    <p className="rounded bg-warning-soft px-3 py-2 font-inter text-sm text-warning-dark">
      Something went wrong sending your message. Please try again{canCall ? ' or call us' : ''}.
    </p>
  )
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-orange px-5 py-3 font-barlow text-sm font-bold uppercase tracking-wider text-sparta-black transition hover:brightness-105 disabled:opacity-60"
    >
      {pending ? 'Sending…' : children}
    </button>
  )
}
