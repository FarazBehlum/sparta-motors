import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
  firstName: 'Dev',
  lastName: 'Tester',
  role: 'admin' as const,
}

/**
 * Refuse to run against a production database.
 *
 * playwright.config.ts loads `dotenv/config` and reuses an existing server, so
 * this helper targets whatever DATABASE_URL is in .env. Running the e2e suite on
 * a machine that happens to hold production credentials would plant an admin
 * account with the password "test" on the live site.
 */
function assertNotProduction(): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Refusing to seed the e2e test user with NODE_ENV=production — this would ' +
        'create an admin account with a known password. Point DATABASE_URL at a ' +
        'development database first.',
    )
  }
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  assertNotProduction()
  const payload = await getPayload({ config })

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  // Create fresh test user
  await payload.create({
    collection: 'users',
    data: testUser,
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
