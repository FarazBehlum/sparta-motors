import { describe, expect, it } from 'vitest'
import { assertTestDatabase } from '../helpers/testDatabase'

describe('test database isolation', () => {
  it('requires an explicit test database even with a development DATABASE_URL', () => {
    expect(() => assertTestDatabase({ DATABASE_URL: 'postgres://localhost/sparta' })).toThrow(
      'TEST_DATABASE_URL',
    )
  })
  it.each([
    'postgres://localhost/sparta',
    'postgres://remote.example/sparta_test',
    'postgres://localhost/sparta_test?host=remote.example',
    'https://localhost/sparta_test',
    'invalid',
  ])('rejects unsafe database target %s', (TEST_DATABASE_URL) => {
    expect(() => assertTestDatabase({ TEST_DATABASE_URL })).toThrow()
  })
  it('rejects production mode even with a test database', () => {
    expect(() =>
      assertTestDatabase({
        NODE_ENV: 'production',
        TEST_DATABASE_URL: 'postgres://localhost/sparta_test',
      }),
    ).toThrow()
  })
  it('accepts an explicitly selected local test database', () => {
    const TEST_DATABASE_URL = 'postgres://localhost/sparta_test'
    expect(assertTestDatabase({ TEST_DATABASE_URL })).toBe(TEST_DATABASE_URL)
  })
})
