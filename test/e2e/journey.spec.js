import { expect, test } from '@playwright/test'
import { buildApp, DIFFICULTIES, legacy, openMission, playBonus, solveRobotLevel, solveScenario } from './helpers'

const LEVELS = legacy('ROBOT_LEVELS')
const SCENARIOS = legacy('TEST_SCENARIOS')

test('teljes kaland: mindhárom szint, mindkét bónusz, 1905 XP, 11 jelvény, majd új felfedező', async ({ page }) => {
  test.setTimeout(240_000)
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))

  for (const [tier, difficulty] of DIFFICULTIES.entries()) {
    await openMission(page, difficulty, 0)
    for (const [i, level] of LEVELS[difficulty].entries()) await solveRobotLevel(page, level, i)
    await page.locator('#robot-feedback [data-test="finish-robot"]').click()

    await page.locator('.completion-card').getByRole('button', { name: 'Következő küldetés' }).click()
    await expect(page).toHaveURL(/kuldetes\/teszt/)
    for (const [i, s] of SCENARIOS[difficulty].entries()) await solveScenario(page, s, i)
    await page.locator('#test-feedback [data-test="finish-test"]').click()

    await page.locator('.completion-card').getByRole('button', { name: 'Következő küldetés' }).click()
    await buildApp(page, tier, `App ${tier}`)

    // Mindhárom küldetés kész → eredményoldal
    await expect(page).toHaveURL(/eredmeny/)
    await expect(page.locator('.completion-card h1')).toHaveText('A jövő alkotója? Akár te.')
    await page.locator('.reflection-options [data-value="both"]').click()
    await expect(page.locator('#reflection-feedback')).toContainText('nyílt napon')
    const download = page.waitForEvent('download')
    await page.locator('[data-test="download-app"]').click()
    expect((await download).suggestedFilename()).toBe('sajat-miniapp.html')
  }

  // A kezdőgomb kész szintnél az eredményekhez visz
  await page.goto('/')
  await expect(page.locator('#start-button')).toContainText('Eredmények megtekintése')

  // Bónuszok: a kvízben egy rossz válasz is van, az XP mégis jár (a felfedezésért)
  await page.locator('#home-view [data-bonus="debug"]').click()
  await expect(page).toHaveURL(/bonusz\/kodnyomozo/)
  await page.locator('.puzzle-options [data-option="0"]').click()
  await page.locator('#bonus-check').click()
  await expect(page.locator('#bonus-feedback')).toContainText('Próbáld végig fejben')
  await playBonus(page, 'debug')
  await expect(page.locator('#game-content')).toContainText('120 XP')

  await page.goto('/')
  await page.locator('#home-view [data-bonus="quiz"]').click()
  await playBonus(page, 'quiz', { wrongFirst: true })
  await expect(page.locator('#game-content')).toContainText('5 / 6 kérdésre elsőre jól')

  await expect(page.locator('#total-xp')).toHaveText('1905 XP')
  await page.reload()
  await expect(page.locator('#total-xp')).toHaveText('1905 XP')

  // Újrajátszásért nincs újabb XP
  await page.goto('/bonusz/kodnyomozo')
  await playBonus(page, 'debug')
  await expect(page.locator('#total-xp')).toHaveText('1905 XP')

  // Jelvények és a haladás exportja
  await page.goto('/jelvenyek')
  await expect(page.locator('.badge-card.earned')).toHaveCount(11)
  await expect(page.locator('.collection-overview')).toContainText('3 / 3')
  const exported = page.waitForEvent('download')
  await page.locator('[data-test="export-progress"]').click()
  expect((await exported).suggestedFilename()).toBe('tech-kalandom.txt')

  // Új felfedező: a mégse gomb nem töröl, a megerősítés igen; a téma megmarad
  await page.locator('[data-action="theme"], .theme-toggle').click()
  await page.locator('.sidebar .help-link').click()
  await page.locator('dialog [data-test="reset"]').click()
  await page.locator('dialog').getByRole('button', { name: 'Folytatom a kalandom' }).click()
  await expect(page.locator('#total-xp')).toHaveText('1905 XP')
  await page.locator('.sidebar .help-link').click()
  await page.locator('dialog [data-test="reset"]').click()
  await page.locator('dialog [data-test="confirm-reset"]').click()
  await expect(page.locator('#total-xp')).toHaveText('0 XP')
  await expect(page).toHaveURL('/')
  await expect(page.locator('.difficulty-card[data-difficulty="explorer"]')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'light')
  expect(errors).toEqual([])
})
