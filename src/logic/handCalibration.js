export const DEFAULT_HAND_BOUNDS = Object.freeze({ left: 0.12, right: 0.88, top: 0.12, bottom: 0.88 })
export const HAND_PREFERENCES_KEY = 'kodra-ar-controls-v1'
const MIN_RANGE = 0.12
const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

export function validHandBounds(bounds) {
  return Boolean(
    bounds &&
    ['left', 'right', 'top', 'bottom'].every((key) => Number.isFinite(bounds[key])) &&
    bounds.left >= 0 &&
    bounds.right <= 1 &&
    bounds.top >= 0 &&
    bounds.bottom <= 1 &&
    bounds.right - bounds.left >= MIN_RANGE &&
    bounds.bottom - bounds.top >= MIN_RANGE
  )
}

export function normalizeHandPreferences(value) {
  if (value?.version !== 1) return { version: 1, bounds: null, speed: 1 }
  return {
    version: 1,
    bounds: validHandBounds(value.bounds)
      ? {
          left: value.bounds.left,
          right: value.bounds.right,
          top: value.bounds.top,
          bottom: value.bounds.bottom
        }
      : null,
    speed: Number.isFinite(value.speed) ? clamp(value.speed, 0.5, 2) : 1
  }
}

export function loadHandPreferences(storage) {
  try {
    return normalizeHandPreferences(
      JSON.parse((storage || globalThis.localStorage).getItem(HAND_PREFERENCES_KEY))
    )
  } catch {
    return normalizeHandPreferences(null)
  }
}

export function saveHandPreferences(value, storage) {
  try {
    const target = storage || globalThis.localStorage
    target.setItem(HAND_PREFERENCES_KEY, JSON.stringify(normalizeHandPreferences(value)))
    return true
  } catch {
    return false
  }
}

// Időalapú simítás: ugyanaz a sebesség különböző kamera-képkockaszám mellett is.
export function pointerResponse(speed, elapsedSeconds) {
  return 1 - Math.exp(-12 * clamp(speed, 0.5, 2) * clamp(elapsedSeconds, 0, 0.1))
}

export function createHandCalibration() {
  let first = null,
    anchor = null,
    samples = [],
    since = 0,
    last = null
  function resetHold() {
    anchor = null
    samples = []
    since = 0
    last = null
  }
  const result = (progress = 0, hint = '') => ({ step: first ? 1 : 0, progress, hint, bounds: null })
  return {
    update(gesture, point, now) {
      if (
        gesture !== 'point' ||
        !point ||
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y) ||
        point.x < 0 ||
        point.x > 1 ||
        point.y < 0 ||
        point.y > 1
      ) {
        resetHold()
        return result(0, 'Mutass két ujjat a kamerának, és tartsd egy helyben a kezed.')
      }
      const p = { x: 1 - point.x, y: point.y }
      if (first && (p.x - first.x < MIN_RANGE || p.y - first.y < MIN_RANGE)) {
        resetHold()
        return result(0, 'Mozgasd a kezed jobbra és lefelé, a kényelmesen elérhető másik sarokig.')
      }
      if (
        !anchor ||
        last === null ||
        now - last > 200 ||
        Math.hypot(p.x - anchor.x, p.y - anchor.y) > 0.025
      ) {
        resetHold()
        anchor = p
        since = now
      }
      last = now
      samples.push(p)
      const progress = clamp((now - since) / 900, 0, 1)
      if (progress < 1 || samples.length < 8) return result(progress)
      const average = samples.reduce(
        (sum, sample) => ({ x: sum.x + sample.x / samples.length, y: sum.y + sample.y / samples.length }),
        { x: 0, y: 0 }
      )
      resetHold()
      if (!first) {
        first = average
        return result()
      }
      const bounds = { left: first.x, right: average.x, top: first.y, bottom: average.y }
      if (!validHandBounds(bounds))
        return result(0, 'A két sarok túl közel van egymáshoz. Mozgasd a kezed még jobbra és lefelé.')
      return { ...result(1), bounds }
    }
  }
}
