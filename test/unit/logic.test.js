import { describe, expect, it } from 'vitest'
import { TEST_SCENARIOS } from 'data/testScenarios'
import { APP_TEMPLATES } from 'data/appTemplates'
import { testOutput, probeLabel } from 'logic/testOutput'
import { appResult } from 'logic/appResult'
import { MAX_XP, rankFor, totalXP } from 'logic/xp'
import { freshGame, loadGame, normalizeGame, STORE_KEY } from 'logic/storage'
import { miniappHTML } from 'logic/download'

const memoryStorage = (data = {}) => ({
  getItem: (k) => data[k] ?? null,
  setItem: (k, v) => (data[k] = v)
})

describe('TesztLab', () => {
  it('minden helyzethez van kimenet minden próbára', () => {
    for (const list of Object.values(TEST_SCENARIOS))
      for (const s of list) for (const p of s.probes) expect(testOutput(s.kind, p)).toBeTypeOf('string')
  })
  it('a szándékos hibák megvannak', () => {
    expect(testOutput('age', '14')).toContain('Legalább')
    expect(testOutput('shipping', '10000')).toBe('Szállítás: 990 Ft')
    expect(testOutput('range', '19')).toContain('engedélyezve')
    expect(testOutput('quantity', '-1')).toContain('-1')
    expect(testOutput('healthy', '   ')).toBe('Adj meg egy nevet!')
  })
  it('próbanapló címke', () => {
    expect(probeLabel('')).toBe('üres mező')
    expect(probeLabel('   ')).toBe('3 szóköz')
  })
})

describe('miniappok', () => {
  it('csak a helyes szabály ad helyes eredményt a határon', () => {
    const [, ticket, focus] = APP_TEMPLATES
    expect(appResult('ticket', ticket.correct, '14')).toBe('1 000 Ft-os jegy')
    expect(appResult('ticket', 'lt', '14')).toBe('2 000 Ft-os jegy')
    expect(appResult('focus', focus.correct, '25')).toContain('szünet')
    expect(appResult('focus', 'gt', '25')).toContain('fókusz')
  })
  it('az export nem enged HTML-t a névből', () => {
    const html = miniappHTML(APP_TEMPLATES[0], { name: '<script>x</script>', color: 0, rule: 'sad' })
    expect(html).not.toContain('<script>x')
  })
})

describe('XP és mentés', () => {
  it('a maximum XP 1905', () => {
    const game = freshGame()
    for (const p of Object.values(game.profiles)) {
      p.completed = [0, 1, 2]
      p.robotSolved = [0, 1, 2]
      p.testReports = [0, 1, 2]
    }
    game.bonus.debug = [0, 1, 2]
    game.bonus.quiz = Array(6).fill({ answer: 0, correct: true })
    expect(totalXP(game)).toBe(MAX_XP)
    expect(rankFor(MAX_XP).name).toBe('Digitális alkotó')
    expect(rankFor(0)).toMatchObject({ name: 'Kíváncsi újonc', next: 300 })
  })
  it('a sérült mentést kijavítja', () => {
    const game = normalizeGame({ difficulty: 'hacker', theme: 'neon', profiles: { explorer: { completed: [0, 0, 7, 'x'], elapsed: -5 } } })
    expect(game.difficulty).toBe('explorer')
    expect(game.theme).toBe('dark')
    expect(game.profiles.explorer.completed).toEqual([0])
    expect(game.profiles.explorer.elapsed).toBe(0)
  })
  it('átveszi a v1 mentést', () => {
    const storage = memoryStorage({ 'kodra-fel-v1': JSON.stringify({ completed: [0], builder: { name: 'Hangom', rule: 'sad', moods: ['sad'] } }) })
    const game = loadGame(storage)
    expect(game.profiles.explorer.completed).toEqual([0])
    expect(game.profiles.explorer.apps[0]).toMatchObject({ name: 'Hangom', rule: 'sad', tests: ['sad'] })
  })
  it('a v2 mentést előnyben részesíti', () => {
    const storage = memoryStorage({ [STORE_KEY]: JSON.stringify({ difficulty: 'expert', theme: 'light' }), 'kodra-fel-v1': '{"completed":[0]}' })
    expect(loadGame(storage)).toMatchObject({ difficulty: 'expert', theme: 'light' })
  })
})

describe('tudástár keresés', () => {
  it('ékezet- és kisbetű-független, kategóriával szűrhető', async () => {
    const { GLOSSARY } = await import('data/glossary')
    const { searchGlossary } = await import('logic/search')
    expect(searchGlossary(GLOSSARY, 'HATARERTEK').map((g) => g[0])).toEqual(['Határérték'])
    expect(searchGlossary(GLOSSARY, '', 'tesztelés')).toHaveLength(4)
    expect(searchGlossary(GLOSSARY, 'határérték', 'fejlesztés')).toHaveLength(0)
  })
})
