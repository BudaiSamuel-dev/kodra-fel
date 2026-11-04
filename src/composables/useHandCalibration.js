import { computed, ref, watch } from 'vue'
import {
  createHandCalibration,
  DEFAULT_HAND_BOUNDS,
  loadHandPreferences,
  normalizeHandPreferences,
  saveHandPreferences
} from 'src/logic/handCalibration'

export function useHandCalibration(resetPointer) {
  const preferences = ref(loadHandPreferences())
  const calibrating = ref(false)
  const step = ref(0)
  const progress = ref(0)
  const hint = ref('')
  const notice = ref('')
  const saved = ref(true)
  let session = null
  const bounds = computed(() => preferences.value.bounds || DEFAULT_HAND_BOUNDS)
  const calibrated = computed(() => Boolean(preferences.value.bounds))
  const instruction = computed(() =>
    step.value === 0
      ? '1/2 · Bal felső sarok: két ujjal mutass balra és felfelé addig, ameddig kényelmes, majd tartsd meg kb. egy másodpercig.'
      : '2/2 · Jobb alsó sarok: két ujjal mutass jobbra és lefelé a kényelmes határig, majd tartsd meg kb. egy másodpercig.'
  )
  const speed = computed({
    get: () => preferences.value.speed,
    set: (value) => {
      preferences.value = normalizeHandPreferences({ ...preferences.value, speed: Number(value) })
      resetPointer()
    }
  })
  watch(preferences, (value) => {
    saved.value = saveHandPreferences(value)
  })

  function begin() {
    session = createHandCalibration()
    step.value = 0
    progress.value = 0
    hint.value = ''
    notice.value = ''
    calibrating.value = true
    resetPointer()
  }
  function cancel(message = 'A kalibrálás megszakítva. A korábbi beállítás maradt érvényben.') {
    session = null
    calibrating.value = false
    progress.value = 0
    hint.value = ''
    notice.value = message
    resetPointer()
  }
  function sample(gesture, point, now) {
    if (!session) return
    const result = session.update(gesture, point, now)
    step.value = result.step
    progress.value = result.progress
    hint.value = result.hint
    if (result.bounds) {
      preferences.value = { ...preferences.value, bounds: result.bounds }
      session = null
      calibrating.value = false
      notice.value = 'Kalibrálás kész! Próbáld ki a kurzort, és igazítsd a sebességét a csúszkával.'
      resetPointer()
    }
  }
  function reset() {
    cancel('Alapbeállítások visszaállítva.')
    preferences.value = normalizeHandPreferences(null)
  }
  return {
    calibrating,
    step,
    progress,
    hint,
    notice,
    saved,
    bounds,
    calibrated,
    instruction,
    speed,
    begin,
    cancel,
    sample,
    reset
  }
}
