import React from 'react'
import type { Metadata } from 'next'
import './styles.css'
import { barlowCondensed, inter, jetbrainsMono } from './fonts'
import { NavBar } from '@/components/nav/NavBar'
import { Footer } from '@/components/Footer'
import { getSettings } from '@/lib/payload'
import { addressLines } from '@/lib/location'
import { SITE_URL as siteUrl } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Sparta Motors · Used Commercial Trucks in Spartanburg, SC',
    template: '%s · Sparta Motors',
  },
  description:
    'Used medium- and heavy-duty commercial trucks for working businesses. Box trucks, reefers, day cabs, flatbeds, dump trucks, and tow trucks. Honest specs, real photos.',
  openGraph: {
    type: 'website',
    siteName: 'Sparta Motors',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-orange focus:px-4 focus:py-2 focus:font-barlow focus:text-sm focus:font-bold focus:uppercase focus:tracking-wider focus:text-sparta-black"
        >
          Skip to content
        </a>
        <NavBar
          phone={settings.phone}
          addressLines={addressLines(settings)}
          email={settings.email}
        />
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
