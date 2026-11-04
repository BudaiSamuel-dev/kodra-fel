import { describe, expect, it, vi } from 'vitest'
import {
  createHandCalibration,
  DEFAULT_HAND_BOUNDS,
  HAND_PREFERENCES_KEY,
  loadHandPreferences,
  normalizeHandPreferences,
  pointerResponse,
  saveHandPreferences,
  validHandBounds
} from '../../src/logic/handCalibration'
import { handPointer } from '../../src/logic/handGestures'

function hold(calibration, point, start) {
  let result
  for (let i = 0; i <= 15; i++) result = calibration.update('point', point, start + i * 60)
  return result
}

describe('személyes mozgástartomány', () => {
  it('két stabil, tükrözött sarokpontból méri a kényelmes tartományt', () => {
    const calibration = createHandCalibration()
    expect(hold(calibration, { x: 0.75, y: 0.2 }, 0).step).toBe(1)
    const result = hold(calibration, { x: 0.3, y: 0.7 }, 1200)
    expect(result.progress).toBe(1)
    expect(result.bounds.left).toBeCloseTo(0.25)
    expect(result.bounds.right).toBeCloseTo(0.7)
    expect(result.bounds.top).toBeCloseTo(0.2)
    expect(result.bounds.bottom).toBeCloseTo(0.7)
  })
  it('követésvesztés, más gesztus és nagy elmozdulás újraindítja a pont rögzítését', () => {
    const calibration = createHandCalibration()
    for (let i = 0; i < 10; i++) calibration.update('point', { x: 0.75, y: 0.2 }, i * 60)
    expect(calibration.update(null, null, 600).progress).toBe(0)
    expect(calibration.update('point', { x: 0.75, y: 0.2 }, 660).progress).toBe(0)
    expect(calibration.update('click', { x: 0.75, y: 0.2 }, 720).bounds).toBeNull()
    calibration.update('point', { x: 0.75, y: 0.2 }, 780)
    expect(calibration.update('point', { x: 0.6, y: 0.2 }, 840).progress).toBe(0)
    expect(calibration.update('point', { x: 0.6, y: 0.2 }, 1200).progress).toBe(0)
  })
  it('nem ment fordított vagy túl kicsi tartományt, de a jó első pont megmarad', () => {
    const calibration = createHandCalibration()
    hold(calibration, { x: 0.75, y: 0.2 }, 0)
    for (const point of [
      { x: 0.8, y: 0.15 },
      { x: 0.7, y: 0.25 }
    ]) {
      const result = hold(calibration, point, 1200)
      expect(result.bounds).toBeNull()
      expect(result.step).toBe(1)
      expect(result.hint).toContain('jobbra és lefelé')
    }
    expect(hold(calibration, { x: 0.3, y: 0.7 }, 2400).bounds).not.toBeNull()
  })
  it('a saját tartomány két sarka a teljes képernyőre kerül, a külső pontokat korlátozza', () => {
    const bounds = { left: 0.25, right: 0.75, top: 0.2, bottom: 0.8 }
    expect(handPointer({ x: 0.75, y: 0.2 }, bounds)).toEqual({ x: 0, y: 0 })
    expect(handPointer({ x: 0.25, y: 0.8 }, bounds)).toEqual({ x: 1, y: 1 })
    expect(handPointer({ x: 0, y: 1 }, bounds)).toEqual({ x: 1, y: 1 })
    expect(handPointer({ x: 0.5, y: 0.5 }, bounds).y).toBeCloseTo(0.5)
    expect(validHandBounds({ ...bounds, right: 0.26 })).toBe(false)
    expect(validHandBounds({ ...bounds, left: NaN })).toBe(false)
  })
  it('a gyorsabb beállítás gyorsabban követ, az időalapú simítás képkockaszámtól független', () => {
    expect(pointerResponse(2, 0.04)).toBeGreaterThan(pointerResponse(0.5, 0.04))
    const oneStep = pointerResponse(1, 0.08)
    const halfStep = pointerResponse(1, 0.04)
    expect(1 - (1 - halfStep) ** 2).toBeCloseTo(oneStep)
    expect(pointerResponse(1, 0)).toBe(0)
  })
})

describe('kalibráció és sebesség helyi mentése', () => {
  it('visszaolvassa a verziózott profilt, és nem ment képet vagy kézpontokat', () => {
    const storage = { getItem: vi.fn(), setItem: vi.fn() }
    const value = { version: 1, bounds: { ...DEFAULT_HAND_BOUNDS }, speed: 1.6, points: 'nem kerül mentésre' }
    expect(saveHandPreferences(value, storage)).toBe(true)
    const [key, json] = storage.setItem.mock.calls[0]
    expect(key).toBe(HAND_PREFERENCES_KEY)
    expect(JSON.parse(json)).toEqual({ version: 1, bounds: { ...DEFAULT_HAND_BOUNDS }, speed: 1.6 })
    storage.getItem.mockReturnValue(json)
    expect(loadHandPreferences(storage).speed).toBe(1.6)
  })
  it('hibás és ismeretlen profilnál alaphelyzetbe áll; a sebességet korlátozza', () => {
    expect(loadHandPreferences({ getItem: () => '{bad json' })).toEqual({
      version: 1,
      bounds: null,
      speed: 1
    })
    expect(normalizeHandPreferences({ version: 99, bounds: DEFAULT_HAND_BOUNDS, speed: 2 }).bounds).toBeNull()
    expect(normalizeHandPreferences({ version: 1, bounds: { left: 1 }, speed: 20 })).toEqual({
      version: 1,
      bounds: null,
      speed: 2
    })
  })
  it('letiltott helyi tárhely mellett is használható marad', () => {
    const storage = {
      getItem() {
        throw new Error('denied')
      },
      setItem() {
        throw new Error('denied')
      }
    }
    expect(loadHandPreferences(storage).speed).toBe(1)
    expect(saveHandPreferences({ version: 1, speed: 1 }, storage)).toBe(false)
  })
})
