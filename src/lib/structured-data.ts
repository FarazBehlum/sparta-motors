import type { Setting } from '@/payload-types'
import { SITE_URL } from '@/lib/site'

/**
 * Serialize a JSON-LD object for injection into a <script type="application/ld+json">.
 *
 * JSON.stringify does not escape `<`, so CMS text containing `</script>` would
 * close the tag early and let whatever follows execute as markup on the same
 * origin as /admin. Truck descriptions are free text written by staff and land
 * in the Product schema, so escape the three characters that can break out.
 * Inside a JSON string literal these \u escapes are equivalent to the raw
 * characters, so parsers still read the original text.
 */
export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

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
  const url = SITE_URL
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
