import React from 'react'
import type { Metadata } from 'next'
import './styles.css'
import { barlowCondensed, inter, jetbrainsMono } from './fonts'
import { NavBar } from '@/components/nav/NavBar'
import { Footer } from '@/components/Footer'
import { getSettings } from '@/lib/payload'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Sparta Motors — Used Commercial Trucks in Charlotte, NC',
    template: '%s · Sparta Motors',
  },
  description:
    'Used medium- and heavy-duty commercial trucks for working businesses. Box trucks, reefers, day cabs, flatbeds, dump trucks, and tow trucks. Honest specs, real photos.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <NavBar phone={settings.phone} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
