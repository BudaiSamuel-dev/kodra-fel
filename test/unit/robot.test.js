import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'
import { ROBOT_LEVELS } from 'data/robotLevels'
import { findRoute, groupRoute, isBlocked, solutionRoute } from 'logic/route'
import { DIRECTIONS } from 'logic/directions'

const walk = (level, route) =>
  route.reduce((pos, dir) => {
    const next = [pos[0] + DIRECTIONS[dir].dx, pos[1] + DIRECTIONS[dir].dy]
    expect(isBlocked(level, next)).toBe(false)
    return next
  }, level.start)

describe('robotpályák', () => {
  for (const [difficulty, levels] of Object.entries(ROBOT_LEVELS))
    levels.forEach((level, i) =>
      it(`${difficulty} ${i + 1}. pálya megoldható`, () => {
        const route = solutionRoute(level)
        expect(route.length).toBeGreaterThan(0)
        expect(walk(level, route)).toEqual(level.goal)
      })
    )

  it('a Profi pályákon a csip valódi kitérőt kér', () => {
    for (const level of ROBOT_LEVELS.expert) {
      expect(level.chip).toBeDefined()
      expect(solutionRoute(level).length).toBeGreaterThan(findRoute(level).length)
    }
  })

  it('a pályák pontosan egyeznek a 2.0 verzióval', () => {
    const legacy = runInNewContext(readFileSync('legacy/dist/content.js', 'utf8') + ';ROBOT_LEVELS')
    for (const [difficulty, levels] of Object.entries(ROBOT_LEVELS))
      levels.forEach((level, i) => {
        const old = legacy[difficulty][i]
        expect(JSON.parse(JSON.stringify(level))).toEqual(JSON.parse(JSON.stringify(old)))
      })
  })

  it('groupRoute összevonja az azonos irányokat', () => {
    expect(groupRoute(['up', 'up', 'right', 'up'])).toEqual([
      { dir: 'up', count: 2 },
      { dir: 'right', count: 1 },
      { dir: 'up', count: 1 }
    ])
  })
})
