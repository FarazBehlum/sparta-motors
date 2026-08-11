import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'
const TRUCK = '/trucks/2019-hino-195-sm-1001'

/**
 * The inquiry form is the truck page's primary conversion element. It must not
 * be obscured by the sticky header — neither when pinned on desktop, nor after
 * the mobile "Inquire →" button jumps to it.
 */
test('desktop: pinned inquiry form clears the sticky header', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(BASE + TRUCK, { waitUntil: 'networkidle' })

  await page.evaluate(() => window.scrollTo(0, 600))
  await page.waitForTimeout(400)

  const m = await page.evaluate(() => {
    const header = document.querySelector('header')!.getBoundingClientRect()
    const heading = document.querySelector('#inquire h2')!.getBoundingClientRect()
    return { headerBottom: header.bottom, headingTop: heading.top }
  })
  expect(
    m.headingTop,
    `form heading top ${m.headingTop} is under the header bottom ${m.headerBottom}`,
  ).toBeGreaterThanOrEqual(m.headerBottom)
})

test('mobile: Inquire button scrolls the form clear of the header', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(BASE + TRUCK, { waitUntil: 'networkidle' })

  await page.getByRole('link', { name: /inquire/i }).last().click()
  await page.waitForTimeout(900)

  const m = await page.evaluate(() => {
    const header = document.querySelector('header')!.getBoundingClientRect()
    const heading = document.querySelector('#inquire h2')!.getBoundingClientRect()
    return { headerBottom: header.bottom, headingTop: heading.top }
  })
  expect(
    m.headingTop,
    `form heading top ${m.headingTop} is under the header bottom ${m.headerBottom}`,
  ).toBeGreaterThanOrEqual(m.headerBottom)
})
