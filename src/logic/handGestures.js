import { DEFAULT_HAND_BOUNDS } from './handCalibration'

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

// Alapból a kamera középső 76%-a, kalibrálva a saját tartomány tölti ki a képernyőt.
export function handPointer(point, bounds = DEFAULT_HAND_BOUNDS) {
  return {
    x: clamp((1 - point.x - bounds.left) / (bounds.right - bounds.left), 0, 1),
    y: clamp((point.y - bounds.top) / (bounds.bottom - bounds.top), 0, 1)
  }
}

export function classifyHand(points) {
  if (!points || points.length !== 21 || points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y)))
    return null
  const palm = distance(points[0], points[9])
  if (palm < 0.04) return null
  const extended = [8, 12, 16, 20].map(
    (tip) => distance(points[tip], points[0]) > distance(points[tip - 2], points[0]) * 1.25
  )
  if (extended.every(Boolean)) return 'scroll'
  // A hüvelykujj oldalra nyílik, nem a többi ujj irányába. A nyújtott
  // ízületet és a tenyértől való távolságot mérjük, így mindkét kézzel működik.
  const thumbJoint = distance(points[2], points[3]) * distance(points[4], points[3])
  const thumbAngle =
    thumbJoint > 0
      ? ((points[2].x - points[3].x) * (points[4].x - points[3].x) +
          (points[2].y - points[3].y) * (points[4].y - points[3].y)) /
        thumbJoint
      : 1
  const thumbExtended =
    thumbAngle < -0.5 &&
    distance(points[4], points[17]) > distance(points[3], points[17]) * 1.15 &&
    distance(points[4], points[5]) > palm * 0.55
  // V-jel: mutató + középső. Kattintás: a hüvelykujj is kinyúlik;
  // a gyűrűs- és kisujj mindkét jel közben behajlítva marad.
  if (extended[0] && extended[1] && !extended[2] && !extended[3]) return thumbExtended ? 'click' : 'point'
  return 'rest'
}

// Kattintás időzítése (ms). A stabil célzás szűri a tenyérnyitás közben átmenetileg felismert három ujjat,
// a tartás alatt töltődik fel a kurzor gyűrűje. (Korábban 180 + 400 ms; gyorsabb kattintásért csökkentve.)
export const CLICK_AIM_MS = 120
export const CLICK_HOLD_MS = 200

// A háromujjas jel egyet kattint, stabil kétujjas célzás után. Rövid
// tartási idő szűri a tenyérnyitás közben átmenetileg felismert három ujjat.
// Újabb kattintáshoz ismét stabilan két ujjal kell célozni.
export function createClickGate() {
  let armed = false
  let pressed = false
  let target = null
  let since = 0
  let clickSince = null
  let progress = 0
  let phase = 'idle'
  return {
    get progress() {
      return progress
    },
    get phase() {
      return phase
    },
    reset() {
      armed = false
      pressed = false
      target = null
      since = 0
      clickSince = null
      progress = 0
      phase = 'idle'
    },
    update(gesture, hovered, now) {
      if (gesture === 'point') {
        if (pressed || clickSince !== null || hovered !== target) {
          target = hovered
          since = now
        }
        armed = true
        pressed = false
        clickSince = null
        progress = 0
        phase = hovered ? 'aiming' : 'idle'
        return false
      }
      if (gesture === 'click') {
        if (pressed) return false
        if (!armed || !hovered || hovered !== target || (clickSince === null && now - since < CLICK_AIM_MS)) {
          pressed = true
          progress = 0
          phase = 'blocked'
          return false
        }
        if (clickSince === null) clickSince = now
        phase = 'holding'
        progress = clamp((now - clickSince) / CLICK_HOLD_MS, 0, 1)
        if (progress < 1) return false
        pressed = true
        phase = 'clicked'
        return true
      }
      this.reset()
      return false
    }
  }
}

export function scrollVelocity(origin, current) {
  const delta = current - origin
  return Math.abs(delta) < 0.035 ? 0 : clamp((delta - Math.sign(delta) * 0.035) * 1800, -650, 650)
}
