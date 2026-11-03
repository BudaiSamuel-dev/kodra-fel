import { DIFFICULTIES } from 'data/difficulties'

export const XP = { robotLevel: 20, testScenario: 15, bonus: 120 }

export function totalXP(game) {
  const missions = DIFFICULTIES.reduce((sum, d) => {
    const p = game.profiles[d.id]
    return sum + p.completed.length * d.xp + p.robotSolved.length * XP.robotLevel + p.testReports.length * XP.testScenario
  }, 0)
  return (
    missions +
    (game.bonus.debug.length === 3 ? XP.bonus : 0) +
    (game.bonus.quiz.filter(Boolean).length === 6 ? XP.bonus : 0)
  )
}

export const MAX_XP = 1905

const RANKS = [
  { min: 1200, name: 'Digitális alkotó' },
  { min: 600, name: 'Tech kalandor' },
  { min: 300, name: 'Ügyes felfedező' },
  { min: 0, name: 'Kíváncsi újonc' }
]

export function rankFor(xp) {
  const name = RANKS.find((r) => xp >= r.min).name
  const next = xp < 300 ? 300 : xp < 600 ? 600 : xp < 1200 ? 1200 : MAX_XP
  return { name, next: Math.max(next, xp), progress: Math.min(100, (xp / next) * 100) }
}
