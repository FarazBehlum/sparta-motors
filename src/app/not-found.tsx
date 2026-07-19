import React from 'react'
import './(frontend)/styles.css'
import { barlowCondensed, inter, jetbrainsMono } from './(frontend)/fonts'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/Button'
import { SectionLabel } from '@/components/SectionLabel'

/**
 * Global 404 for top-level URLs that match neither the (frontend) nor
 * (payload) route groups. Because those groups each own their own <html>,
 * this root fallback must render its own document shell (fonts + styles).
 * In-app notFound() calls use the branded (frontend)/not-found.tsx instead.
 */
export const metadata = { title: 'Not found · Sparta Motors' }

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <section className="flex min-h-screen items-center justify-center bg-sparta-black px-5 py-24 text-bone">
          <div className="w-full max-w-lg text-center">
            <Logo tone="dark" href="/" />
            <div className="mt-8">
              <SectionLabel className="justify-center">Error 404</SectionLabel>
            </div>
            <h1 className="mt-3 font-barlow text-6xl font-extrabold uppercase leading-none tracking-tight text-bone">
              Not found.
            </h1>
            <p className="mx-auto mt-4 max-w-sm font-inter text-base leading-relaxed text-concrete">
              That page rolled off the lot. Let&rsquo;s get you back to the trucks.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/" variant="primary">
                Home
              </Button>
              <Button href="/inventory" variant="dark" className="border border-charcoal">
                Browse inventory →
              </Button>
            </div>
          </div>
        </section>
      </body>
    </html>
  )
}
