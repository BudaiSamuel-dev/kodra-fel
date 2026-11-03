import { expect } from '@playwright/test'

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
