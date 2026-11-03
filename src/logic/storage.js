import { DIFFICULTIES } from 'data/difficulties'
import { APP_TEMPLATES, COLORS } from 'data/appTemplates'
import { QUIZ } from 'data/quiz'

// Ugyanaz a kulcs, mint a 2.0-ban, így a régi gépeken lévő haladás megmarad.
export const STORE_KEY = 'kodra-fel-v2'
const LEGACY_V1_KEY = 'kodra-fel-v1'

const defaultApp = (t) => ({ name: t.name, color: 0, rule: t.default, tests: [] })

export function freshProfile(id) {
  return {
    completed: [], // teljesített küldetések: 0 robot, 1 teszt, 2 miniapp
    robotLevel: 0,
    robotSolved: [],
    testReports: [],
    elapsed: 0, // másodperc
    reflection: '',
    template: DIFFICULTIES.findIndex((d) => d.id === id), // szintenként más az alapértelmezett miniapp
    apps: APP_TEMPLATES.map(defaultApp)
  }
}

export function freshGame() {
  return {
    difficulty: 'explorer',
    theme: 'dark',
    profiles: Object.fromEntries(DIFFICULTIES.map((d) => [d.id, freshProfile(d.id)])),
    bonus: { debug: [], quiz: [] }
  }
}

function safeIndices(value, max) {
  return Array.isArray(value) ? [...new Set(value.filter((n) => Number.isInteger(n) && n >= 0 && n < max))] : []
}

function normalizeApp(raw, t) {
  return {
    name: typeof raw.name === 'string' ? raw.name.slice(0, 24) : t.name,
    color: Number.isInteger(raw.color) && raw.color >= 0 && raw.color < COLORS.length ? raw.color : 0,
    rule: t.choices.some(([v]) => v === raw.rule) ? raw.rule : t.default,
    tests: Array.isArray(raw.tests) ? [...new Set(raw.tests.filter((x) => t.tests.some(([v]) => v === x)))] : []
  }
}

// A localStorage-ból jövő adatot nem hisszük el vakon: minden mezőt ellenőrzünk.
export function normalizeProfile(raw, id) {
  const p = freshProfile(id)
  if (!raw || typeof raw !== 'object') return p
  for (const key of ['completed', 'robotSolved', 'testReports']) p[key] = safeIndices(raw[key], 3)
  p.robotLevel = Number.isInteger(raw.robotLevel) ? Math.max(0, Math.min(2, raw.robotLevel)) : 0
  p.elapsed = Number.isFinite(raw.elapsed) ? Math.max(0, Math.floor(raw.elapsed)) : 0
  p.reflection = ['dev', 'test', 'both'].includes(raw.reflection) ? raw.reflection : ''
  if ([0, 1, 2].includes(raw.template)) p.template = raw.template
  if (Array.isArray(raw.apps))
    raw.apps.forEach((a, i) => {
      if (a && p.apps[i]) p.apps[i] = normalizeApp(a, APP_TEMPLATES[i])
    })
  return p
}

export function normalizeGame(saved) {
  const game = freshGame()
  game.difficulty = DIFFICULTIES.some((d) => d.id === saved.difficulty) ? saved.difficulty : 'explorer'
  game.theme = saved.theme === 'light' ? 'light' : 'dark'
  for (const d of DIFFICULTIES) game.profiles[d.id] = normalizeProfile(saved.profiles?.[d.id], d.id)
  game.bonus.debug = safeIndices(saved.bonus?.debug, 3)
  game.bonus.quiz = Array.isArray(saved.bonus?.quiz)
    ? saved.bonus.quiz
        .slice(0, QUIZ.length)
        .map((v, i) =>
          v && Number.isInteger(v.answer) && v.answer >= 0 && v.answer < 3
            ? { answer: v.answer, correct: v.answer === QUIZ[i].correct }
            : null
        )
    : []
  return game
}

// Az 1.0 csak egy profilt és egy hangulatjelzőt mentett.
export function migrateV1(old) {
  const game = freshGame()
  game.profiles.explorer = normalizeProfile(old, 'explorer')
  const b = old.builder
  if (b)
    game.profiles.explorer.apps[0] = {
      name: typeof b.name === 'string' ? b.name.slice(0, 24) : 'Hangulatjelző',
      color: [0, 1, 2].includes(b.color) ? b.color : 0,
      rule: ['sad', 'happy'].includes(b.rule) ? b.rule : 'sad',
      tests: Array.isArray(b.moods) ? b.moods.filter((m) => ['sad', 'happy'].includes(m)) : []
    }
  return game
}

export function loadGame(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(STORE_KEY))
    if (saved && typeof saved === 'object') return normalizeGame(saved)
    const old = JSON.parse(storage.getItem(LEGACY_V1_KEY))
    if (old && typeof old === 'object') return migrateV1(old)
  } catch {
    // sérült mentés: tiszta lappal indulunk
  }
  return freshGame()
}

export function saveGame(game, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORE_KEY, JSON.stringify(game))
  } catch {
    // tele van a tárhely vagy le van tiltva: a játék mentés nélkül is megy
  }
}
