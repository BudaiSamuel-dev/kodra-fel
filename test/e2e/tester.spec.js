import { expect, test } from '@playwright/test'
import { chooseDifficulty, legacy } from './helpers'

const SCENARIOS = legacy('TEST_SCENARIOS')
// Az utolsó próba után a demóapp kimenetében ennek kell szerepelnie (a 2.0 smoke tesztjéből).
const EXPECTED = {
  explorer: ['2 000', 'Sikeres', 'Legalább'],
  challenger: ['-1000', 'Nincs találat', 'túl hosszú'],
  expert: ['0 Ft', 'engedélyezve', 'elfogadva']
}

test('mind a 9 teszthelyzet megoldható, a jelentés csak minden próba után küldhető', async ({ page }) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))

  for (const [difficulty, scenarios] of Object.entries(SCENARIOS)) {
    await chooseDifficulty(page, difficulty)
    await page.locator('#home-view [data-mission="1"]').click()
    await expect(page).toHaveURL(/kuldetes\/teszt/)

    for (const [i, s] of scenarios.entries()) {
      await page.locator(`.scenario-tab[data-scenario="${i}"]`).click()
      for (const [j] of s.probes.entries()) {
        await page.locator(`.probe-chips [data-probe="${j}"]`).click()
        await page.locator('.demo-submit').click()
        if (j < s.probes.length - 1) await expect(page.locator('#report-submit')).toBeDisabled()
      }
      await expect(page.locator('#test-output')).toContainText(EXPECTED[difficulty][i])
      await expect(page.locator('.probe-chips .tried')).toHaveCount(s.probes.length)

      if (i === 0) {
        // Rossz válasz: biztatás, nincs XP
        await page.locator(`.report-option[data-option="${(s.correct + 1) % 3}"]`).click()
        await page.locator('#report-submit').click()
        await expect(page.locator('#test-feedback')).toContainText('Nézzük meg még egyszer')
      }
      await page.locator(`.report-option[data-option="${s.correct}"]`).click()
      await page.locator('#report-submit').click()
      await expect(page.locator('#test-feedback')).toContainText('Pontos megfigyelés')
    }

    await page.locator('#test-feedback [data-test="finish-test"]').click()
    await expect(page.locator('.completion-card h1')).toContainText('Tesztelői jelvény megszerezve')
  }

  // 3 × (3 × 15) helyzet-XP + 100 + 150 + 200 küldetés-XP
  await expect(page.locator('#total-xp')).toHaveText('585 XP')
  expect(errors).toEqual([])
})

test('a próbanapló a szóközös bemenetet is megkülönbözteti', async ({ page }) => {
  await chooseDifficulty(page, 'expert')
  await page.goto('/kuldetes/teszt')
  await page.locator('.scenario-tab[data-scenario="2"]').click()
  await page.locator('.probe-chips [data-probe="1"]').click()
  await expect(page.locator('#test-input')).toBeFocused()
  await page.locator('.demo-submit').click()
  await expect(page.locator('#test-history')).toContainText('3 szóköz')
  await expect(page.locator('#test-output')).toHaveText('Adj meg egy nevet!')
  await expect(page.locator('#test-count')).toHaveText('1 / 3 kért eset kipróbálva')
})
