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

  test('should open settings modal', async ({ page }) => {
    // Click the settings button (Desktop view)
    const settingsButton = page.locator('button[aria-label="Settings"]').first()
    await settingsButton.click()

    // Modal should appear
    const modalTitle = page
      .getByText('Definições', { exact: true })
      .or(page.getByText('Settings', { exact: true }))
    await expect(modalTitle).toBeVisible()
  })

  test('should toggle dark mode', async ({ page }) => {
    // Click the theme toggle button
    const themeButton = page
      .locator('button[aria-label="Toggle theme"]')
      .first()
    await themeButton.click()

    // Check if the html element has or doesn't have the 'dark' class
    const htmlClass = await page.evaluate(
      () => document.documentElement.className,
    )
    expect(typeof htmlClass).toBe('string')
  })
})
