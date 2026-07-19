import React from 'react'
import Link from 'next/link'

type Variant = 'primary' | 'ghost' | 'dark'
type Size = 'sm' | 'md'

const BASE =
  'inline-flex items-center justify-center gap-2 font-barlow font-bold uppercase tracking-wider rounded transition-all duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange disabled:opacity-50 disabled:pointer-events-none'

const VARIANTS: Record<Variant, string> = {
  // Orange primary CTA — lightens + lifts on hover (motion moment #6)
  primary:
    'bg-orange text-sparta-black hover:brightness-105 hover:scale-[1.02] motion-reduce:hover:scale-100',
  // Secondary outline — fills dark on hover
  ghost:
    'border border-sparta-black text-sparta-black hover:bg-sparta-black hover:text-bone',
  // Dark button (used on orange strips / sticky bars) — lightens to charcoal
  dark: 'bg-sparta-black text-bone hover:bg-charcoal',
}

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs min-h-[40px]',
  md: 'px-5 py-3 text-sm min-h-[44px]',
}

type CommonProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined
  }

type ButtonAsLink = CommonProps &
  Omit<React.ComponentPropsWithoutRef<typeof Link>, keyof CommonProps> & {
    href: string
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink

/**
 * Primary CTA / ghost / dark button. Renders an anchor (via next/link) when
 * given `href`, otherwise a real <button>. Variants from the design system.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`

  if ('href' in rest && rest.href != null) {
    return (
      <Link className={classes} {...(rest as ButtonAsLink)}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  )
}
