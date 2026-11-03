import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { expect } from '@playwright/test'

// A tartalom a 2.0 forrásából: ha az új app eltérne tőle, a tesztek elbuknak.
const LEGACY = readFileSync('legacy/dist/content.js', 'utf8')
export const legacy = (name) => runInNewContext(`${LEGACY};${name}`)
export const DIFFICULTIES = ['explorer', 'challenger', 'expert']

// Független útkeresés a tesztben: nem az app saját findRoute-ját használjuk, hogy az is ellenőrizve legyen.
const MOVES = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] }
export function route(level, start, goal) {
  const walls = new Set(level.walls.map((w) => w.join(',')))
  const queue = [[start, []]]
  const seen = new Set([start.join(',')])
  while (queue.length) {
    const [pos, path] = queue.shift()
    if (pos[0] === goal[0] && pos[1] === goal[1]) return path
    for (const [key, [dx, dy]] of Object.entries(MOVES)) {
      const n = [pos[0] + dx, pos[1] + dy]
      const id = n.join(',')
      if (n[0] < 0 || n[1] < 0 || n[0] >= level.size || n[1] >= level.size || walls.has(id) || seen.has(id)) continue
      seen.add(id)
      queue.push([n, [...path, key]])
    }
  }
  throw new Error('Megoldhatatlan pálya')
}

export const solution = (level) =>
  level.chip ? [...route(level, level.start, level.chip), ...route(level, level.chip, level.goal)] : route(level, level.start, level.goal)

// A program bevitele a valódi gombokkal, legfeljebb ×4 ismétléssel blokkonként.
export async function enterProgram(page, program) {
  let i = 0
  while (i < program.length) {
    let count = 1
    while (program[i + count] === program[i]) count++
    for (let left = count; left > 0; left -= 4) {
      await page.locator('#repeat-count').selectOption(String(Math.min(4, left)))
      await page.locator(`[data-direction="${program[i]}"]`).click()
    }
    i += count
  }
}

export async function chooseDifficulty(page, id) {
  await page.goto('/')
  await page.locator(`.difficulty-card[data-difficulty="${id}"]`).click()
  await expect(page.locator(`.difficulty-card[data-difficulty="${id}"]`)).toHaveAttribute('aria-pressed', 'true')
}

export async function openMission(page, difficulty, mission) {
  await chooseDifficulty(page, difficulty)
  await page.locator(`#home-view [data-mission="${mission}"]`).click()
}

// --- Küldetések végigjátszása (a jelvény átvétele előtt állnak meg) ---

export async function solveRobotLevel(page, level, index) {
  await page.locator(`.level-tab[data-level="${index}"]`).click()
  await enterProgram(page, solution(level))
  await page.locator('#run-robot').click()
  await expect(page.locator('#robot-feedback')).toContainText('Bit célba ért')
}

export async function solveScenario(page, scenario, index) {
  await page.locator(`.scenario-tab[data-scenario="${index}"]`).click()
  for (const [j] of scenario.probes.entries()) {
    await page.locator(`.probe-chips [data-probe="${j}"]`).click()
    await page.locator('.demo-submit').click()
  }
  await page.locator(`.report-option[data-option="${scenario.correct}"]`).click()
  await page.locator('#report-submit').click()
  await expect(page.locator('#test-feedback')).toContainText('Pontos megfigyelés')
}

export async function buildApp(page, template, name) {
  const t = legacy('APP_TEMPLATES')[template]
  await page.locator(`.template-tab[data-template="${template}"]`).click()
  await page.locator('#app-rule').selectOption(t.correct)
  for (const [value] of t.tests) await page.locator(`.mood-button[data-value="${value}"]`).click()
  await page.locator('#app-name').fill(name)
  await page.locator('[data-test="release-app"]').click()
}

export async function playBonus(page, kind, { wrongFirst = false } = {}) {
  const data = legacy(kind === 'debug' ? 'DEBUG_PUZZLES' : 'QUIZ')
  for (const [i, q] of data.entries()) {
    const answer = wrongFirst && i === 0 ? (q.correct + 1) % 3 : q.correct
    await page.locator(`.puzzle-options [data-option="${answer}"]`).click()
    await page.locator('#bonus-check').click()
    await expect(page.locator('#bonus-feedback')).toContainText(q.why)
    await page.locator('[data-test="bonus-next"]').click()
  }
}
