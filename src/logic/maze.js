import { DIRECTIONS } from './directions'
import { findRoute } from './route'

// Determinisztikus labirintus: ugyanaz a seed mindig ugyanazt a pályát adja.
// Start a bal alsó, cél a jobb felső sarokban. Csippel a csip a legnagyobb kitérőt igénylő szabad mezőre kerül.
export function maze(size, seed, { chip = false } = {}) {
  let rng = seed
  const random = () => {
    rng = (rng * 1664525 + 1013904223) >>> 0
    return rng / 4294967296
  }
  const grid = Array.from({ length: size }, () => Array(size).fill(1))
  const stack = [[0, size - 1]]
  grid[size - 1][0] = 0
  while (stack.length) {
    const [x, y] = stack.at(-1)
    const neighbors = [
      [2, 0],
      [-2, 0],
      [0, 2],
      [0, -2]
    ]
      .map(([dx, dy]) => [x + dx, y + dy])
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < size && ny < size && grid[ny][nx])
    if (!neighbors.length) {
      stack.pop()
      continue
    }
    const [nx, ny] = neighbors[Math.floor(random() * neighbors.length)]
    grid[(y + ny) / 2][(x + nx) / 2] = 0
    grid[ny][nx] = 0
    stack.push([nx, ny])
  }

  const level = { size, start: [0, size - 1], goal: [size - 1, 0], walls: [] }
  grid.forEach((row, y) => row.forEach((wall, x) => wall && level.walls.push([x, y])))

  if (chip) {
    const onRoute = new Set([level.start.join(',')])
    const pos = [...level.start]
    for (const dir of findRoute(level)) {
      pos[0] += DIRECTIONS[dir].dx
      pos[1] += DIRECTIONS[dir].dy
      onRoute.add(pos.join(','))
    }
    const branches = []
    grid.forEach((row, y) =>
      row.forEach((wall, x) => {
        if (wall || onRoute.has(`${x},${y}`)) return
        const point = [x, y]
        branches.push({
          point,
          distance: findRoute(level, level.start, point).length + findRoute(level, point, level.goal).length
        })
      })
    )
    branches.sort((a, b) => b.distance - a.distance)
    level.chip = branches.length ? branches[0].point : [...level.start]
  }
  return level
}
