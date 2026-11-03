import { DIRECTIONS } from './directions'

export const samePos = (a, b) => a[0] === b[0] && a[1] === b[1]

export function isBlocked(level, [x, y]) {
  return x < 0 || y < 0 || x >= level.size || y >= level.size || level.walls.some((w) => samePos(w, [x, y]))
}

// Szélességi keresés: a legrövidebb útvonal irányok listájaként ([] ha nincs út).
export function findRoute(level, from = level.start, to = level.goal) {
  const queue = [[from, []]]
  const seen = new Set([from.join(',')])
  for (let i = 0; i < queue.length; i++) {
    const [pos, path] = queue[i]
    if (samePos(pos, to)) return path
    for (const [key, d] of Object.entries(DIRECTIONS)) {
      const next = [pos[0] + d.dx, pos[1] + d.dy]
      if (seen.has(next.join(',')) || isBlocked(level, next)) continue
      seen.add(next.join(','))
      queue.push([next, [...path, key]])
    }
  }
  return []
}

// A teljes megoldás: csippel előbb a csiphez, utána a célhoz.
export function solutionRoute(level) {
  return level.chip ? [...findRoute(level, level.start, level.chip), ...findRoute(level, level.chip, level.goal)] : findRoute(level)
}

// Az egymás utáni azonos irányok összevonása: ['up','up','right'] → [{dir:'up',count:2},{dir:'right',count:1}]
export function groupRoute(route) {
  const groups = []
  for (const dir of route) {
    const last = groups.at(-1)
    if (last?.dir === dir) last.count++
    else groups.push({ dir, count: 1 })
  }
  return groups
}
