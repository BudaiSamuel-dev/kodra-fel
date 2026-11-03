import { expect, test } from '@playwright/test'

test('párbeszédablakok: Escape és háttérkattintás bezárja, a fókusz visszatér', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-test="how"]').click()
  await expect(page.locator('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('dialog')).not.toBeVisible()
  await expect(page.locator('[data-test="how"]')).toBeFocused()

  await page.locator('.sidebar .help-link').click()
  await expect(page.locator('dialog h2')).toHaveText('Itt szabad próbálkozni.')
  await page.mouse.click(5, 5)
  await expect(page.locator('dialog')).not.toBeVisible()

  await page.locator('[data-test="how"]').click()
  await page.locator('dialog').getByRole('button', { name: 'Induljon a kaland' }).click()
  await expect(page).toHaveURL(/kuldetes\/robot/)
})

test('tudástár: ékezetfüggetlen keresés, kategóriák, üres találat, törlés', async ({ page }) => {
  await page.goto('/tudastar')
  await expect(page.locator('.glossary-card')).toHaveCount(15)
  await page.locator('#glossary-search').fill('hatarertek')
  await expect(page.locator('.glossary-card')).toHaveCount(1)
  await page.locator('[data-category="fejlesztés"]').click()
  await expect(page.locator('.empty-search')).toBeVisible()
  await expect(page.locator('#glossary-count')).toHaveText('0 / 15 fogalom')
  await page.locator('[data-test="glossary-clear"]').click()
  await expect(page.locator('.glossary-card')).toHaveCount(15)
  await expect(page.locator('#glossary-search')).toBeFocused()
  await page.locator('[data-category="tesztelés"]').click()
  await expect(page.locator('.glossary-card')).toHaveCount(4)
})

test('szakma oldal: munkanap-nézőpontok és GYIK', async ({ page }) => {
  await page.goto('/szakma')
  await expect(page.locator('#day-timeline')).toContainText('Tervezés és kódolás')
  await page.locator('[data-role="test"]').click()
  await expect(page.locator('#day-timeline')).toContainText('Tesztesetek tervezése')
  await expect(page.locator('[data-role="test"]')).toHaveAttribute('aria-pressed', 'true')
  await page.locator('.career-faq summary').first().click()
  await expect(page.locator('.career-faq details').first()).toHaveAttribute('open', '')
  await page.locator('.profession-card [data-mission="1"]').click()
  await expect(page).toHaveURL(/kuldetes\/teszt/)
})

test('navigáció, téma és a 2.0 mentésének átvétele', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() =>
    localStorage.setItem(
      'kodra-fel-v2',
      JSON.stringify({ difficulty: 'challenger', theme: 'light', profiles: { challenger: { completed: [0], robotSolved: [0, 1, 2] } } })
    )
  )
  await page.reload()
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('#total-xp')).toHaveText('210 XP')
  await expect(page.locator('#home-view [data-mission="0"] .complete-tick')).toBeVisible()
  await expect(page.locator('#start-button')).toContainText('Induljon a kaland')

  for (const [label, url] of [
    ['Tudástár', /tudastar/],
    ['A szakmáról', /szakma/],
    ['Jelvényeim', /jelvenyek/],
    ['Felfedezés', /\/$/]
  ]) {
    await page.locator('.main-nav').getByRole('button', { name: label }).click()
    await expect(page).toHaveURL(url)
    await expect(page.locator('.main-nav .nav-item.active')).toContainText(label)
  }

  await page.goto('/eredmeny') // még nincs kész a szint → vissza a főoldalra
  await expect(page).toHaveURL(/\/$/)
  await page.goto('/nincs-ilyen-oldal')
  await expect(page).toHaveURL(/\/$/)
})

// Egyik oldal se lógjon ki vízszintesen, öt képernyőszélességen, mindkét témában.
for (const theme of ['dark', 'light'])
  test(`reszponzív elrendezés (${theme})`, async ({ page }) => {
    await page.goto('/')
    await page.evaluate((theme) => localStorage.setItem('kodra-fel-v2', JSON.stringify({ theme })), theme)
    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      for (const path of ['/', '/tudastar', '/jelvenyek', '/szakma', '/kuldetes/robot', '/kuldetes/teszt', '/kuldetes/alkoto', '/bonusz/kodnyomozo']) {
        await page.goto(path)
        await expect(page.locator('#main h1').first()).toBeVisible()
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
        expect(overflow, `${theme} ${width}px ${path}`).toBe(false)
      }
    }
  })

// Regresszió: a világos téma generált CSS-e egyszer felülírta a background-clip: text beállítást,
// és a gradiens felirat („alkotóvá.”) zöld téglalappá vált.
for (const theme of ['dark', 'light'])
  test(`a gradiens feliratok szövegre vágva jelennek meg (${theme})`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('kodra-fel-v2', JSON.stringify({ theme: t })), theme)
    await page.goto('/')
    await expect(page.locator('.hero h1')).toBeVisible()
    const clipped = await page.evaluate(() =>
      [...document.querySelectorAll('#main *')]
        .filter((el) => getComputedStyle(el).backgroundImage.includes('gradient'))
        .filter((el) => getComputedStyle(el).webkitTextFillColor === 'rgba(0, 0, 0, 0)')
        .map((el) => getComputedStyle(el).webkitBackgroundClip)
    )
    expect(clipped.length).toBeGreaterThan(0)
    expect(clipped.every((c) => c === 'text')).toBe(true)
  })
