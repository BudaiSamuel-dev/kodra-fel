import { expect, test } from '@playwright/test'

// A fejléc (XP, témaváltó) lefelé görgetéskor eltűnik, felfelé görgetéskor fent megjelenik.
const topbarBox = (page) => page.locator('.topbar').evaluate((el) => {
  const r = el.getBoundingClientRect()
  return { top: Math.round(r.top), bottom: Math.round(r.bottom) }
})
const scrollTo = async (page, y) => {
  await page.evaluate((y) => window.scrollTo(0, y), y)
  await page.waitForTimeout(150) // rAF + (csökkentett mozgásnál) azonnali váltás
}

for (const [width, headerOffset] of [
  [1440, 0], // asztali: a lap tetejéhez tapad
  [390, 64] // mobil: a rögzített logós sáv alá
])
  test(`a fejléc lefelé görgetve elbújik, felfelé megjelenik (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    await expect(page.locator('#hero-title')).toBeVisible()

    // lefelé: elbújik (a látható tartományon kívül vagy a mobil fejléc alatt)
    await scrollTo(page, 600)
    await scrollTo(page, 1200)
    await expect.poll(async () => (await topbarBox(page)).bottom).toBeLessThanOrEqual(headerOffset)

    // felfelé egy kicsit: fent megjelenik
    await scrollTo(page, 1100)
    await expect.poll(async () => (await topbarBox(page)).top).toBe(headerOffset)
    await expect(page.locator('.topbar .xp-chip')).toBeInViewport()
    await expect(page.locator('.topbar .theme-toggle')).toBeInViewport()

    // újra lefelé: megint elbújik
    await scrollTo(page, 1600)
    await expect.poll(async () => (await topbarBox(page)).bottom).toBeLessThanOrEqual(headerOffset)

    // billentyűzettel a témaváltóra lépve megjelenik
    await page.locator('.topbar .theme-toggle').focus()
    await expect.poll(async () => (await topbarBox(page)).top).toBe(headerOffset)
  })
