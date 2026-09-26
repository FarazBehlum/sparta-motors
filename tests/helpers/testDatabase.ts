/** Fail closed before loading Payload or starting a test web server. */
export function assertTestDatabase(env: Record<string, string | undefined> = process.env): string {
  if (env.NODE_ENV === 'production') throw new Error('Tests cannot run in production mode.')
  const value = env.TEST_DATABASE_URL
  if (!value)
    throw new Error(
      'Set TEST_DATABASE_URL to a dedicated local PostgreSQL database ending in _test.',
    )
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('Invalid TEST_DATABASE_URL.')
  }
  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    !/^[a-zA-Z0-9_]+_test$/.test(url.pathname.slice(1)) ||
    url.search ||
    url.hash
  )
    throw new Error(
      'TEST_DATABASE_URL must use a local PostgreSQL database ending in _test, without query parameters.',
    )
  return value
}

export function configureTestDatabase(): void {
  process.env.DATABASE_URL = assertTestDatabase()
  // Tests must never send notifications through credentials inherited from .env.
  process.env.SMTP_HOST = ''
  process.env.NOTIFICATION_TO = ''
  process.env.SMTP_FROM = ''
  process.env.MEDIA_DIR = '.test-media'
  process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
  process.env.PAYLOAD_PUBLIC_SERVER_URL = 'http://localhost:3000'
}
