import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

// Serial: every test in here shares one logged-in page and one seeded admin
// user in the real database. Run in parallel with the rest of the suite, the
// shared session and the seed/cleanup in beforeAll/afterAll race each other and
// tests fail seemingly at random.
test.describe.configure({ mode: 'serial' })

test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL(/\/admin(\?|$)/)
    const dashboardArtifact = page.getByRole('heading', { name: 'Dashboard.' })
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users')
    // Payload adds its own list defaults (?depth=1&limit=10) once the view
    // mounts, so match the path and let any query string through.
    await expect(page).toHaveURL(/\/admin\/collections\/users(\?|$)/)
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users/create')
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="email"]')
    await expect(editViewArtifact).toBeVisible()
  })
})
