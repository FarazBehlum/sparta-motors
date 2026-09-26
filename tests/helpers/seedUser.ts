import { getPayload } from 'payload'
import { configureTestDatabase } from './testDatabase'

async function testPayload() {
  configureTestDatabase()
  const { default: config } = await import('../../src/payload.config.js')
  return getPayload({ config })
}

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
  firstName: 'Dev',
  lastName: 'Tester',
  role: 'admin' as const,
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await testPayload()

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
  const payload = await testPayload()

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
