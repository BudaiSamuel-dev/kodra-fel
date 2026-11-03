import { expect, test } from '@playwright/test'

const nav = (page, label) => page.locator('.main-nav').getByRole('button', { name: label })
const activeNav = (page) => page.locator('.main-nav .nav-item.active')
// A küldetés-szekció címe látszik-e a képernyőn (nem a lap tetején vagyunk)
const missionsInView = (page) =>
  page.evaluate(() => {
    const r = document.getElementById('kuldetesek')?.getBoundingClientRect()
    return Boolean(r) && r.top >= -5 && r.top < innerHeight / 2 && scrollY > 200
  })

for (const width of [1440, 390])
  test(`a Küldetések menüpont mindenhonnan a küldetésekhez görget és aktív lesz (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })

    // 1. a főoldal tetejéről
    await page.goto('/')
    await nav(page, 'Küldetések').click()
    await expect(page).toHaveURL(/#kuldetesek$/)
    await expect(activeNav(page)).toContainText('Küldetések')
    await expect.poll(() => missionsInView(page)).toBe(true)

    // 2. ugyanoda újra kattintva, miután felgörgettünk
    await page.evaluate(() => window.scrollTo(0, 0))
    await nav(page, 'Küldetések').click()
    await expect.poll(() => missionsInView(page)).toBe(true)

    // 3. másik oldalakról
    for (const other of ['Tudástár', 'A szakmáról', 'Jelvényeim']) {
      await nav(page, other).click()
      await expect(activeNav(page)).toContainText(other)
      await nav(page, 'Küldetések').click()
      await expect(page).toHaveURL(/#kuldetesek$/)
      await expect(activeNav(page)).toContainText('Küldetések')
      await expect.poll(() => missionsInView(page)).toBe(true)
    }

    // 4. Felfedezés: vissza a tetejére, és az lesz aktív
    await nav(page, 'Felfedezés').click()
    await expect(activeNav(page)).toContainText('Felfedezés')
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5)
  })

test('oldalváltás után a cím fókuszt kap, de nem rajzol fókuszkeretet (billentyűzettel is)', async ({ page }) => {
  await page.goto('/')
  // Billentyűzetes használat: ilyenkor a böngésző :focus-visible keretet rajzolna a programozott fókuszra
  await nav(page, 'Tudástár').focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/tudastar/)
  await expect(page.locator('#main h1')).toBeFocused()
  const outline = await page.locator('#main h1').evaluate((el) => getComputedStyle(el).outlineStyle)
  expect(outline).toBe('none')
})
