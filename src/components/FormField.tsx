'use client'

import React, { forwardRef } from 'react'

const CONTROL =
  'w-full rounded border border-chalk bg-white px-3 py-2.5 font-inter text-sm text-sparta-black placeholder:text-concrete transition-colors focus:border-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange aria-[invalid=true]:border-danger'

const LABEL = 'font-mono text-[10px] uppercase tracking-wide text-iron'

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className={LABEL}>
      {children}
      {required && <span className="text-danger"> *</span>}
    </label>
  )
}

function FieldWrap({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {children}
      {error && (
        <span id={`${id}-error`} role="alert" className="font-inter text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  )
}

type BaseProps = { label: string; error?: string }

export type InputFieldProps = BaseProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> & { id: string }

/** Labeled text input. forwardRef so it drops into react-hook-form's register(). */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  { label, error, id, required, className = '', ...rest },
  ref,
) {
  return (
    <FieldWrap id={id} label={label} required={required} error={error}>
      <input
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${CONTROL} ${className}`}
        {...rest}
      />
    </FieldWrap>
  )
})

export type TextareaFieldProps = BaseProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & { id: string }

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  function TextareaField({ label, error, id, required, className = '', rows = 4, ...rest }, ref) {
    return (
      <FieldWrap id={id} label={label} required={required} error={error}>
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
          className={`${CONTROL} resize-y ${className}`}
          {...rest}
        />
      </FieldWrap>
    )
  },
)

export type SelectFieldProps = BaseProps &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
    id: string
    options: { label: string; value: string }[]
    placeholder?: string
  }

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, id, required, options, placeholder, className = '', ...rest },
  ref,
) {
  return (
    <FieldWrap id={id} label={label} required={required} error={error}>
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${CONTROL} ${className}`}
        defaultValue={rest.defaultValue ?? ''}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  )
})
