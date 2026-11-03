import { expect, test } from '@playwright/test'
import { chooseDifficulty, enterProgram, legacy, route } from './helpers'

const LEVELS = legacy('ROBOT_LEVELS')

test('mind a 9 robotpálya végigjátszható, XP és jelvény jár érte', async ({ page }) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))

  for (const [difficulty, levels] of Object.entries(LEVELS)) {
    await chooseDifficulty(page, difficulty)
    await page.locator('#home-view [data-mission="0"]').click()
    await expect(page).toHaveURL(/kuldetes\/robot/)

    for (const [index, level] of levels.entries()) {
      await page.locator(`.level-tab[data-level="${index}"]`).click()

      if (difficulty === 'explorer' && index === 0) {
        // Ütközés, törlés, visszavonás
        await page.locator('[data-direction="left"]').click()
        await page.locator('#run-robot').click()
        await expect(page.locator('#robot-feedback')).toContainText('elakadtam')
        await page.locator('#clear-commands').click()
        await page.locator('[data-direction="up"]').click()
        await page.locator('#undo-command').click()
        await expect(page.locator('.queue-item')).toHaveCount(0)
      }

      const path = level.chip
        ? [...route(level, level.start, level.chip), ...route(level, level.chip, level.goal)]
        : route(level, level.start, level.goal)

      if (difficulty === 'expert' && index === 0) {
        // A csip nélküli rövid út nem elég
        const direct = route(level, level.start, level.goal)
        expect(path.length).toBeGreaterThan(direct.length)
        await enterProgram(page, direct)
        await page.locator('#run-robot').click()
        await expect(page.locator('#robot-feedback')).toContainText('csip még hiányzik')
        await page.locator('#clear-commands').click()
      }

      await enterProgram(page, path)
      await page.locator('#run-robot').click()
      await expect(page.locator('#robot-feedback')).toContainText('Bit célba ért')
    }

    await page.locator('#robot-feedback [data-test="finish-robot"]').click()
    await expect(page.locator('.completion-card h1')).toContainText('Fejlesztői jelvény megszerezve')
  }

  // 3 × (3 × 20) pálya-XP + 100 + 150 + 200 küldetés-XP
  await expect(page.locator('#total-xp')).toHaveText('630 XP')
  await page.reload()
  await expect(page.locator('#total-xp')).toHaveText('630 XP')
  expect(errors).toEqual([])
})

test('a hint mutatja az útvonalat, és a lépéskorlát véd', async ({ page }) => {
  await page.goto('/kuldetes/robot')
  await page.getByRole('button', { name: 'Segítség', exact: true }).click()
  await expect(page.locator('.hint-route')).toContainText('→')
  await page.locator('#repeat-count').selectOption('4')
  for (let i = 0; i < 7; i++) await page.locator('[data-direction="up"]').click()
  await expect(page.locator('#toast')).toContainText('legfeljebb 24 lépés')
  await expect(page.locator('.queue-item')).toHaveCount(6)
})
