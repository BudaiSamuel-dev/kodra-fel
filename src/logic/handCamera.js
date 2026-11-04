export const cameraConstraints = () => ({
  audio: false,
  video: {
    facingMode: 'user',
    width: { ideal: 1280 },
    height: { ideal: 720 },
    resizeMode: { ideal: 'none' },
    frameRate: { ideal: 24, max: 30 }
  }
})

// Egyes kamerák nem teszik elérhetővé ezeket a vezérlőket. Egy opcionális
// beállítás hibája nem akadályozhatja meg a kézvezérlés indítását.
function capabilities(track) {
  try {
    return track.getCapabilities?.() || {}
  } catch {
    return {}
  }
}

export async function configureCamera(track) {
  const caps = capabilities(track)
  const options = []
  if (Number.isFinite(caps.zoom?.min)) options.push({ zoom: caps.zoom.min })
  if (caps.exposureMode?.includes('continuous')) options.push({ exposureMode: 'continuous' })
  for (const option of options) {
    try {
      await track.applyConstraints({ advanced: [option] })
    } catch {
      /* Nem támogatott ezen az eszközön. */
    }
  }
}

export function exposureControl(track) {
  const range = capabilities(track).exposureCompensation
  if (!range || !Number.isFinite(range.min) || !Number.isFinite(range.max) || range.max <= range.min)
    return null
  const step = Number.isFinite(range.step) && range.step > 0 ? range.step : (range.max - range.min) / 20
  const value = track.getSettings?.().exposureCompensation ?? 0
  return { min: range.min, max: range.max, step, value: Math.max(range.min, Math.min(range.max, value)) }
}

export function lightingAdvice({ data, width, height }, points) {
  // Követett kéznél annak helyét vizsgáljuk. Kéz nélkül a kép közepe csak
  // tájékoztató minta: az eredmény fényviszonyokra utal, nem felismerés.
  let left = 0.3,
    right = 0.7,
    top = 0.25,
    bottom = 0.75
  if (points?.length === 21) {
    left = Math.max(0, Math.min(...points.map((p) => p.x)) - 0.03)
    right = Math.min(1, Math.max(...points.map((p) => p.x)) + 0.03)
    top = Math.max(0, Math.min(...points.map((p) => p.y)) - 0.03)
    bottom = Math.min(1, Math.max(...points.map((p) => p.y)) + 0.03)
  }
  let foreground = 0,
    foregroundCount = 0,
    background = 0,
    backgroundCount = 0,
    brightBackground = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const luminance = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722
      if (x / width >= left && x / width <= right && y / height >= top && y / height <= bottom) {
        foreground += luminance
        foregroundCount++
      } else {
        background += luminance
        backgroundCount++
        if (luminance > 225) brightBackground++
      }
    }
  }
  if (!foregroundCount || !backgroundCount) return ''
  const front = foreground / foregroundCount
  const back = background / backgroundCount
  if (front < 95 && (brightBackground / backgroundCount > 0.2 || (back > 170 && back > front * 1.8)))
    return 'Erős ellenfény gyanúja: a kezed kapjon fényt elölről is, vagy fordítsd el a kamerát a világos háttértől.'
  if ((foreground + background) / (foregroundCount + backgroundCount) < 45)
    return 'Kevés a fény: világítsd meg a kezed elölről egy szórt fényű lámpával.'
  return ''
}
