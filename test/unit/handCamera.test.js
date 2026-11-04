import { describe, expect, it, vi } from 'vitest'
import { configureCamera, exposureControl, lightingAdvice } from '../../src/logic/handCamera'

function frame(pixel) {
  const width = 64,
    height = 48
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      data.fill(pixel(x / width, y / height), i, i + 3)
      data[i + 3] = 255
    }
  return { data, width, height }
}

describe('kamera képmező és opcionális fényállítás', () => {
  it('a legkisebb támogatott zoomot és automatikus expozíciót kéri', async () => {
    const track = {
      getCapabilities: () => ({ zoom: { min: 1 }, exposureMode: ['continuous'] }),
      applyConstraints: vi.fn().mockResolvedValue()
    }
    await configureCamera(track)
    expect(track.applyConstraints.mock.calls.map(([value]) => value)).toEqual([
      { advanced: [{ zoom: 1 }] },
      { advanced: [{ exposureMode: 'continuous' }] }
    ])
  })
  it('hiányzó vagy elutasított vezérlők nem akadályozzák a kamera használatát', async () => {
    await expect(configureCamera({})).resolves.toBeUndefined()
    await expect(
      configureCamera({
        getCapabilities() {
          throw new Error('unsupported')
        }
      })
    ).resolves.toBeUndefined()
    const track = {
      getCapabilities: () => ({ zoom: { min: 1 } }),
      applyConstraints: vi.fn().mockRejectedValue(new Error('unsupported'))
    }
    await expect(configureCamera(track)).resolves.toBeUndefined()
    expect(exposureControl(track)).toBeNull()
  })
  it('csak érvényes fényállítási tartományhoz jelenít meg csúszkát', () => {
    expect(
      exposureControl({ getCapabilities: () => ({ exposureCompensation: { min: 0, max: 0 } }) })
    ).toBeNull()
    const track = {
      getCapabilities: () => ({ exposureCompensation: { min: -2, max: 2, step: 0.5 } }),
      getSettings: () => ({ exposureCompensation: 1 })
    }
    expect(exposureControl(track)).toEqual({ min: -2, max: 2, step: 0.5, value: 1 })
  })
})

describe('helyi fényviszony-vizsgálat', () => {
  it('világos háttér és sötét közép esetén ellenfényre figyelmeztet', () => {
    const image = frame((x, y) => (x >= 0.3 && x <= 0.7 && y >= 0.25 && y <= 0.75 ? 35 : 250))
    expect(lightingAdvice(image)).toContain('ellenfény')
  })
  it('a felismert kéz helyét vizsgálja akkor is, ha az oldalt látszik', () => {
    const image = frame((x, y) => (x >= 0.05 && x <= 0.3 && y >= 0.2 && y <= 0.8 ? 35 : 250))
    const points = Array.from({ length: 21 }, (_, i) => ({ x: i % 2 ? 0.1 : 0.25, y: i % 2 ? 0.25 : 0.75 }))
    expect(lightingAdvice(image, points)).toContain('ellenfény')
  })
  it('sötét képnél elölről jövő fényt ajánl, egyenletes fénynél nem figyelmeztet', () => {
    expect(lightingAdvice(frame(() => 20))).toContain('Kevés a fény')
    expect(lightingAdvice(frame(() => 130))).toBe('')
    expect(lightingAdvice(frame(() => 235))).toBe('')
  })
})
