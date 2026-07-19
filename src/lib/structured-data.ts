import type { Setting } from '@/payload-types'

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

function postalAddress(a: Setting['address']) {
  if (!a) return undefined
  return {
    '@type': 'PostalAddress',
    streetAddress: [a.line1, a.line2].filter(Boolean).join(', ') || undefined,
    addressLocality: a.city || undefined,
    addressRegion: a.state || undefined,
    postalCode: a.zip || undefined,
    addressCountry: 'US',
  }
}

/**
 * Organization + AutoDealer (a LocalBusiness subtype) JSON-LD built from the
 * Settings global. Shared by Home, About, and Contact. Hours are the known,
 * stable Mon–Fri 8–5 spec; Sat is by appointment (omitted from the machine
 * spec). Returns a schema.org @graph object ready for JSON.stringify.
 */
export function organizationJsonLd(settings: Setting) {
  const url = siteUrl()
  const address = postalAddress(settings.address)
  const a = settings.address
  const geo =
    a?.latitude != null && a?.longitude != null
      ? { '@type': 'GeoCoordinates', latitude: a.latitude, longitude: a.longitude }
      : undefined

  const org = {
    '@type': 'Organization',
    '@id': `${url}/#organization`,
    name: settings.siteName || 'Sparta Motors',
    url,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    address,
    sameAs: [settings.socialFacebook, settings.socialInstagram].filter(Boolean),
  }

  const dealer = {
    '@type': 'AutoDealer',
    '@id': `${url}/#dealer`,
    name: settings.siteName || 'Sparta Motors',
    url,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    address,
    geo,
    parentOrganization: { '@id': `${url}/#organization` },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
    ],
  }

  return { '@context': 'https://schema.org', '@graph': [org, dealer] }
}
