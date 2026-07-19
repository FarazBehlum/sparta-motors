import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Idempotent seed: admin user, Settings global, and the five editable Pages
 * with baseline hero copy. Business address/phone/hours are the real dealership
 * details (890 S Irwin Ave, Spartanburg, SC). Map coordinates are approximate —
 * verify before the Contact/About map ships.
 *
 * Run with: npm run seed
 * Admin credentials come from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD env vars,
 * falling back to NOTIFICATION_TO and a generated notice.
 */
async function seed() {
  const payload = await getPayload({ config: await config })

  const adminEmail = process.env.SEED_ADMIN_EMAIL || process.env.NOTIFICATION_TO || 'admin@sparta-motors.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD

  // --- Admin user ---
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: adminEmail } },
    limit: 1,
  })
  if (existing.docs.length === 0) {
    if (!adminPassword) {
      throw new Error(
        'SEED_ADMIN_PASSWORD is required to create the initial admin user. Set it in .env and re-run.',
      )
    }
    await payload.create({
      collection: 'users',
      data: {
        email: adminEmail,
        password: adminPassword,
        firstName: 'Sparta',
        lastName: 'Admin',
        role: 'admin',
      },
    })
    payload.logger.info(`Created admin user ${adminEmail}`)
  } else {
    payload.logger.info(`Admin user ${adminEmail} already exists — skipping`)
  }

  // --- Settings global ---
  await payload.updateGlobal({
    slug: 'settings',
    data: {
      siteName: 'Sparta Motors',
      phone: '(864) 266-5347',
      email: process.env.SMTP_FROM || 'info@sparta-motors.com',
      address: {
        line1: '890 S Irwin Ave',
        line2: '',
        city: 'Spartanburg',
        state: 'SC',
        zip: '29306',
        // Approximate — verify/geocode precisely before the Contact/About map ships.
        latitude: 34.9377,
        longitude: -81.9187,
      },
      hoursMonFri: '8 AM – 5 PM',
      hoursSat: 'By appointment',
      hoursSun: 'Closed',
    },
  })
  payload.logger.info('Settings global seeded')

  // --- Pages ---
  const pages: Array<{ slug: 'home' | 'about' | 'financing' | 'fleet' | 'contact'; title: string; heroLabel: string; heroTitle: string; heroSubtitle: string; metaDescription: string }> = [
    {
      slug: 'home',
      title: 'Sparta Motors — Used Commercial Trucks in Spartanburg, SC',
      heroLabel: 'SPARTA MOTORS',
      heroTitle: 'Work trucks\nthat work.',
      heroSubtitle: 'Used medium- and heavy-duty commercial trucks. Honest specs, real photos, a phone that gets answered.',
      metaDescription: 'Used commercial trucks for working businesses in Spartanburg, SC. Box trucks, reefers, day cabs, flatbeds, dump trucks, and tow trucks.',
    },
    {
      slug: 'about',
      title: 'About Sparta Motors',
      heroLabel: 'ABOUT SPARTA MOTORS',
      heroTitle: 'A dealer built\nfor working businesses.',
      heroSubtitle: 'Established 2018. We sell trucks that earn their keep — and we tell you the truth about every one.',
      metaDescription: 'Sparta Motors is a used commercial truck dealer in Spartanburg, SC, serving small businesses since 2018.',
    },
    {
      slug: 'financing',
      title: 'Financing',
      heroLabel: 'FINANCING',
      heroTitle: 'Financing that\nkeeps you working.',
      heroSubtitle: 'Get pre-qualified in minutes. We work with lenders who understand commercial vehicles.',
      metaDescription: 'Commercial truck financing in Spartanburg, SC. Get pre-qualified with Sparta Motors.',
    },
    {
      slug: 'fleet',
      title: 'Fleet & Bulk Sourcing',
      heroLabel: 'FLEET & BULK SOURCING',
      heroTitle: 'Growing your\nfleet? We source.',
      heroSubtitle: 'Tell us what you need. We find the right trucks at the right price for growing small fleets.',
      metaDescription: 'Fleet and bulk truck sourcing for small businesses in Spartanburg, SC.',
    },
    {
      slug: 'contact',
      title: 'Contact',
      heroLabel: 'CONTACT',
      heroTitle: 'Come by the lot.\nOr call us.',
      heroSubtitle: 'We answer the phone. Stop by, call, or send a message and we will get right back to you.',
      metaDescription: 'Contact Sparta Motors in Spartanburg, SC. Address, hours, phone, and directions.',
    },
  ]

  for (const page of pages) {
    const found = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
    })
    if (found.docs.length === 0) {
      await payload.create({ collection: 'pages', data: page })
      payload.logger.info(`Created page: ${page.slug}`)
    } else {
      payload.logger.info(`Page ${page.slug} already exists — skipping`)
    }
  }

  payload.logger.info('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
