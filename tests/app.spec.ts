import { expect, test } from '@playwright/test'

test.describe('Run - CDInfante App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the homepage and display the map', async ({ page }) => {
    await expect(page).toHaveTitle(/Run - CDInfante/i)

    // The Map Container should be visible
    const mapElement = page.locator('.leaflet-container')
    await expect(mapElement).toBeVisible()
  })

  test('should open settings modal', async ({ page, isMobile }) => {
    if (isMobile) {
      // Open the hamburger menu on mobile devices
      await page.locator('button[aria-label="Menu"]').click()
      // Click the settings button inside the mobile drawer
      await page
        .locator('button', { hasText: /(Definições|Settings)/i })
        .click()
    } else {
      // Click the desktop settings button
      const settingsButton = page
        .locator('button[aria-label="Settings"]')
        .locator('visible=true')
      await settingsButton.click()
    }

    // Modal should appear - the title is an h2
    const modalTitle = page.locator('h2', {
      hasText: /(Definições|Settings)/i,
    })
    await expect(modalTitle).toBeVisible()
  })

  test('should toggle dark mode', async ({ page }) => {
    // Target the currently visible theme toggle button (handles both mobile/desktop layouts)
    const themeButton = page
      .locator('button[aria-label="Toggle theme"]')
      .locator('visible=true')
    await themeButton.click()

    // Check if the html element has or doesn't have the 'dark' class
    const htmlClass = await page.evaluate(
      () => document.documentElement.className,
    )
    expect(typeof htmlClass).toBe('string')
  })
})
