import { expect, test } from '@playwright/test'
import { readFileSync, unlinkSync } from 'node:fs'
import { chooseDifficulty, DIFFICULTIES } from './helpers'

test('mindhárom miniapp elkészíthető, újratesztelés kell szabályváltás után, és az export működik', async ({ page, browser }, testInfo) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))

  for (const [tier, difficulty] of DIFFICULTIES.entries()) {
    await chooseDifficulty(page, difficulty)
    await page.locator('#home-view [data-mission="2"]').click()
    await expect(page).toHaveURL(/kuldetes\/alkoto/)
    await page.locator(`.template-tab[data-template="${tier}"]`).click()
    const template = await page.evaluate(() => {
      const tabs = [...document.querySelectorAll('.mood-button')].map((b) => b.dataset.value)
      return { tests: tabs }
    })

    // Teszt nélkül nem adható ki
    await page.locator('[data-test="release-app"]').click()
    await expect(page.locator('#builder-feedback')).toContainText('Előbb')

    // Alapértelmezett (hibás) szabállyal tesztelve: a HA-feltételre figyelmeztet
    for (const v of template.tests) await page.locator(`.mood-button[data-value="${v}"]`).click()
    await page.locator('[data-test="release-app"]').click()
    await expect(page.locator('#builder-feedback')).toContainText('HA feltételt')

    // Szabályváltás törli a kipróbált eseteket
    const correct = { 0: 'sad', 1: 'lte', 2: 'gte' }[tier]
    await page.locator('#app-rule').selectOption(correct)
    await expect(page.locator('.release-checks .passed')).toHaveCount(0)
    for (const v of template.tests) await page.locator(`.mood-button[data-value="${v}"]`).click()
    await expect(page.locator('.release-checks .passed')).toHaveCount(template.tests.length)

    await page.locator('#app-name').fill(`Saját ${tier} app`)
    await page.locator('.swatch[data-color="3"]').click()
    await expect(page.locator('#phone-title')).toHaveText(`Saját ${tier} app`)
    await page.locator('[data-test="release-app"]').click()
    await expect(page.locator('.completion-card h1')).toContainText('Alkotói jelvény megszerezve')

    // Letöltés, majd a letöltött app kipróbálása egy külön lapon
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('[data-test="download-app"]').click()])
    const file = testInfo.outputPath(`export-${tier}.html`)
    await download.saveAs(file)
    const html = readFileSync(file, 'utf8')
    expect(html).toContain(`Saját ${tier} app`)
    const exported = await browser.newPage()
    await exported.setContent(html)
    await exported.locator('nav button').nth(1).click()
    await expect(exported.locator('output')).not.toHaveText('Válassz egy lehetőséget!')
    await exported.close()
    unlinkSync(file)
  }

  // A beállítások mentődnek
  await page.reload()
  await page.locator('.template-tab[data-template="2"]').click()
  await expect(page.locator('#app-name')).toHaveValue('Saját 2 app')
  expect(errors).toEqual([])
})
