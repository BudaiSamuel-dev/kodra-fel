import { expect, test } from '@playwright/test'
import { legacy } from './helpers'

const QUIZ = legacy('QUIZ')

// Egy teljes Tech radar próbálkozás: az első `correctCount` kérdésre jó, a többire rossz válasz.
async function attempt(page, correctCount) {
  for (const [i, q] of QUIZ.entries()) {
    const answer = i < correctCount ? q.correct : (q.correct + 1) % 3
    await page.locator(`.puzzle-options [data-option="${answer}"]`).click()
    await page.locator('#bonus-check').click()
    if (i >= correctCount) {
      // Rossz válasz: a választott válasz, a visszajelzés és a haladássáv szakasza piros; a helyes zöld
      await expect(page.locator(`.puzzle-options [data-option="${answer}"]`)).toHaveClass(/wrong/)
      await expect(page.locator(`.puzzle-options [data-option="${q.correct}"]`)).toHaveClass(/right/)
      await expect(page.locator('#bonus-feedback .feedback')).toHaveClass(/wrong/)
      await expect(page.locator('.bonus-progress span').nth(i)).toHaveClass(/wrong/)
    } else await expect(page.locator('.bonus-progress span').nth(i)).not.toHaveClass(/wrong/)
    await page.locator('[data-test="bonus-next"]').click()
  }
}

const quizBadgeEarned = async (page) => {
  await page.goto('/jelvenyek')
  return page.locator('.badge-card', { hasText: 'Tech radar' }).evaluate((el) => el.classList.contains('earned'))
}

test('Tech radar: 33% alatt nincs jelvény, csak arányos XP, és újra lehet próbálni', async ({ page }) => {
  await page.goto('/bonusz/techradar')

  // 0/6: 0 XP, nincs jelvény, újrapróbálás gomb
  await attempt(page, 0)
  await expect(page.locator('.completion-card h1')).toHaveText('Majdnem! Próbáld újra.')
  await expect(page.locator('#total-xp')).toHaveText('0 XP')

  // 1/6: arányos 20 XP, még mindig nincs jelvény
  await page.locator('[data-test="quiz-retry"]').click()
  await expect(page.locator('.bonus-progress span.wrong')).toHaveCount(0)
  await attempt(page, 1)
  await expect(page.locator('.completion-card')).toContainText('20 XP')
  await expect(page.locator('#total-xp')).toHaveText('20 XP')
  expect(await quizBadgeEarned(page)).toBe(false)

  // Bukott próbálkozás után megnyitva automatikusan új próbálkozás indul; 2/6 (33%): jelvény és 120 XP
  await page.goto('/bonusz/techradar')
  await expect(page.locator('.puzzle-category')).toHaveText('TECH KÉRDÉS / 01')
  await attempt(page, 2)
  await expect(page.locator('.completion-card h1')).toHaveText('A tech radarod élesítve.')
  await expect(page.locator('#total-xp')).toHaveText('120 XP')
  expect(await quizBadgeEarned(page)).toBe(true)

  // Sikeres eredmény után egy rosszabb újrajátszás nem vesz el semmit
  await page.reload()
  await expect(page.locator('#total-xp')).toHaveText('120 XP')
})
