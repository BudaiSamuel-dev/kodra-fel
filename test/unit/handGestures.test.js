import { describe, expect, it } from 'vitest'
import { classifyHand, createClickGate, handPointer, scrollVelocity } from '../../src/logic/handGestures'

function hand(mode = 'point') {
  const points = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.7 }))
  points[0] = { x: 0.5, y: 0.9 }
  points[9] = { x: 0.5, y: 0.65 }
  points[2] = { x: 0.4, y: 0.8 }
  points[3] = { x: mode === 'click' ? 0.3 : 0.4, y: 0.75 }
  points[4] = { x: mode === 'click' ? 0.2 : 0.49, y: 0.7 }
  points[5] = { x: 0.4, y: 0.7 }
  points[17] = { x: 0.7, y: 0.72 }
  for (const tip of [8, 12, 16, 20]) {
    points[tip - 2] = { x: 0.5, y: 0.55 }
    const count = { rest: 0, single: 1, point: 2, click: 2, ring: 3, scroll: 4 }[mode]
    points[tip] = { x: 0.5, y: tip <= 4 + count * 4 ? 0.3 : 0.75 }
  }
  return points
}

describe('kézfelismerés', () => {
  it('két ujjra céloz, háromra kattint, négyre görget; egy ujjnál vagy ökölnél pihen', () => {
    for (const mode of ['point', 'click', 'scroll', 'rest']) expect(classifyHand(hand(mode))).toBe(mode)
    expect(classifyHand(hand('single'))).toBe('rest')
  })
  it('méretezés, elforgatás és tükrözés után is felismeri a kétujjas és hüvelykujjas jelet', () => {
    for (const mode of ['point', 'click']) {
      const points = hand(mode).map(({ x, y }) => ({ x: y * 0.6, y: 1 - x * 0.6 }))
      expect(classifyHand(points)).toBe(mode)
      expect(classifyHand(points.map(({ x, y }) => ({ x: 1 - x, y })))).toBe(mode)
    }
  })
  it('a régi, gyűrűsujjas jel nem kattint; a rossz ujjpárnál pihen', () => {
    expect(classifyHand(hand('ring'))).toBe('rest')
    const wrongPair = hand('point')
    wrongPair[12] = { x: 0.5, y: 0.75 }
    wrongPair[20] = { x: 0.5, y: 0.3 }
    expect(classifyHand(wrongPair)).toBe('rest')
  })
  it('a behajlított vagy csak eltolt hüvelykujj nem kattint', () => {
    const points = hand()
    points[4] = { x: 0.36, y: 0.82 }
    expect(classifyHand(points)).toBe('point')
    points[2] = { ...points[3] }
    expect(classifyHand(points)).toBe('point')
  })
  it('elutasítja a hiányzó vagy hibás pontokat és a túl kis kezet', () => {
    expect(classifyHand()).toBeNull()
    expect(classifyHand([])).toBeNull()
    expect(classifyHand(Array(21).fill({ x: NaN, y: 0 }))).toBeNull()
    expect(classifyHand(Array(21).fill({ x: 0.5, y: 0.5 }))).toBeNull()
  })
  it('tükrözi a kurzort és a képernyő szélére korlátozza', () => {
    expect(handPointer({ x: 0.5, y: 0.5 })).toEqual({ x: 0.5, y: 0.5 })
    expect(handPointer({ x: 0, y: 1 })).toEqual({ x: 1, y: 1 })
    expect(handPointer({ x: 1, y: 0 })).toEqual({ x: 0, y: 0 })
  })
  it('görgetéskor holtzónát és sebességkorlátot alkalmaz', () => {
    expect(scrollVelocity(0.5, 0.52)).toBe(0)
    expect(scrollVelocity(0.5, 0.6)).toBeGreaterThan(0)
    expect(scrollVelocity(0.5, 0.4)).toBeLessThan(0)
    expect(scrollVelocity(0, 1)).toBe(650)
  })
})

describe('háromujjas kattintás', () => {
  it('stabil kétujjas célzás és megtartott háromujjas jel után egyszer kattint', () => {
    const gate = createClickGate()
    const button = {}
    expect(gate.update('click', button, 0)).toBe(false)
    gate.update('point', button, 100)
    expect(gate.update('click', button, 300)).toBe(false)
    expect(gate.phase).toBe('holding')
    expect(gate.progress).toBe(0)
    expect(gate.update('click', button, 500)).toBe(false)
    expect(gate.progress).toBe(0.5)
    expect(gate.update('click', button, 699)).toBe(false)
    expect(gate.update('click', button, 700)).toBe(true)
    expect(gate.phase).toBe('clicked')
    expect(gate.progress).toBe(1)
    expect(gate.update('click', button, 1000)).toBe(false)
    gate.update('point', button, 1100)
    expect(gate.update('click', button, 1300)).toBe(false)
    expect(gate.update('click', button, 1700)).toBe(true)
  })
  it('a rövid háromujjas átmenetből nem kattint, és újra megvárja a kétujjas célzást', () => {
    const gate = createClickGate()
    const button = {}
    gate.update('point', button, 0)
    expect(gate.update('click', button, 200)).toBe(false)
    gate.update('scroll', null, 250)
    expect(gate.update('click', button, 500)).toBe(false)
    gate.update('point', button, 600)
    expect(gate.update('click', button, 650)).toBe(false)
    expect(gate.update('click', button, 1000)).toBe(false)
    gate.update('point', button, 1100)
    expect(gate.update('click', button, 1300)).toBe(false)
    expect(gate.update('click', button, 1700)).toBe(true)
  })
  it('célváltás, követésvesztés vagy görgetés után nem kattint véletlenül', () => {
    const gate = createClickGate()
    const a = {},
      b = {}
    gate.update('point', a, 0)
    expect(gate.update('click', b, 300)).toBe(false)
    gate.update('point', b, 400)
    expect(gate.update('click', b, 450)).toBe(false)
    gate.reset()
    expect(gate.update('click', b, 800)).toBe(false)
    gate.update('point', b, 900)
    gate.update('scroll', null, 1200)
    expect(gate.update('click', b, 1400)).toBe(false)
  })
  it('a gyűrű megszakításkor ürül, és másik célponton nem fejezi be a kattintást', () => {
    const gate = createClickGate()
    const a = {},
      b = {}
    gate.update('point', a, 0)
    gate.update('click', a, 200)
    gate.update('click', a, 400)
    expect(gate.progress).toBe(0.5)
    expect(gate.update('click', b, 500)).toBe(false)
    expect(gate.phase).toBe('blocked')
    expect(gate.progress).toBe(0)
    expect(gate.update('click', a, 900)).toBe(false)
    gate.reset()
    expect(gate.phase).toBe('idle')
    expect(gate.progress).toBe(0)
  })
})
