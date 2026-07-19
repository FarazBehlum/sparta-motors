import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('home page renders the Sparta Motors shell', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Sparta Motors/)

    const heading = page.locator('h1').first()
    await expect(heading).toContainText(/working businesses/i)
  })

  test('global nav links to inventory', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await page.getByRole('link', { name: 'Inventory', exact: true }).first().click()
    await expect(page).toHaveURL(/\/inventory$/)
  })

  test('unknown routes render the branded 404', async ({ page }) => {
    const res = await page.goto('http://localhost:3000/not-a-real-page')
    expect(res?.status()).toBe(404)
    await expect(page.locator('h1')).toContainText(/not found/i)
  })
})
