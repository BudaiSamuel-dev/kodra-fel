<template>
  <section class="hand-launcher" aria-labelledby="hand-title">
    <div>
      <span class="hand-eyebrow">KÍSÉRLETI TECH LAB / AR</span>
      <h2 id="hand-title">Vedd kézbe az oldalt!</h2>
      <p>
        Mutass a kamerának, és irányíts érintés nélkül. A kéz követési pontjai élőben megjelennek a
        kameraképen.
      </p>
      <p id="hand-privacy" class="hand-note">
        A kamerakép a böngésződben marad. Nincs felvétel vagy képfeltöltés. HTTPS vagy localhost és
        kameraengedély szükséges.
      </p>
    </div>
    <button
      class="button primary"
      :aria-pressed="active"
      aria-describedby="hand-privacy"
      @click="busy || active ? stop() : start()"
    >
      {{
        busy ? 'Indítás megszakítása' : active ? 'AR kézvezérlés kikapcsolása' : 'AR kézvezérlés bekapcsolása'
      }}
    </button>
    <p v-if="notice" class="hand-notice" role="status">{{ notice }}</p>
  </section>

  <Teleport to="body">
    <aside
      v-if="busy || active"
      class="hand-panel"
      :class="{ 'hand-panel--wide': largePreview }"
      aria-label="AR kézvezérlés"
    >
      <div class="hand-panel-heading">
        <strong>{{ busy ? 'Kamera és kézkövetés indítása…' : 'AR kézvezérlés' }}</strong>
        <button
          class="hand-stop"
          :aria-expanded="!compact"
          aria-label="Kamera-előnézet és útmutató váltása"
          @click="compact = !compact"
        >
          {{ compact ? '+' : '−' }}
        </button>
        <button class="hand-stop" aria-label="Kézvezérlés leállítása" @click="stop()">Leállítás ×</button>
      </div>
      <div v-show="!compact" class="hand-preview" :style="{ aspectRatio: frameAspect }">
        <video
          ref="video"
          autoplay
          muted
          playsinline
          aria-label="Helyi, tükrözött kamera-előnézet"
          @loadedmetadata="syncFrameSize"
          @resize="syncFrameSize"
        ></video>
        <canvas ref="canvas" width="320" :height="Math.round(320 / frameAspect)" aria-hidden="true"></canvas>
        <span
          v-if="calibrating"
          class="hand-calibration-corner"
          :data-step="calibrationStep"
          aria-hidden="true"
        >
          {{ calibrationStep === 0 ? '↖ 1/2' : '2/2 ↘' }}
        </span>
      </div>
      <p class="hand-status" role="status" aria-live="polite">{{ status }}</p>
      <p v-if="lightWarning" class="hand-light-warning" role="status">{{ lightWarning }}</p>
      <details v-show="!compact || calibrating" class="hand-camera-options hand-calibration-options">
        <summary>Személyes kalibráció</summary>
        <template v-if="calibrating">
          <p class="hand-calibration-instruction">{{ calibrationInstruction }}</p>
          <progress
            class="hand-calibration-progress"
            :value="calibrationProgress"
            max="1"
            aria-label="Kalibrálási pont rögzítése"
          ></progress>
          <p v-if="calibrationHint" class="hand-note">{{ calibrationHint }}</p>
          <p class="hand-note">Kalibrálás közben a kézmozdulatok nem kattintanak és nem görgetnek.</p>
          <button class="hand-stop" @click="calibration.cancel()">Kalibrálás megszakítása</button>
        </template>
        <template v-else>
          <p class="hand-note">
            {{
              calibrated
                ? 'A saját mozgástartományod aktív.'
                : 'Mérjük meg két kényelmes sarokpontodat, hogy kisebb kézmozdulattal is elérd a teljes képernyőt.'
            }}
          </p>
          <button class="hand-stop" :disabled="!active" @click="beginCalibration">
            {{ calibrated ? 'Újrakalibrálás' : 'Kalibrálás indítása' }}
          </button>
        </template>
        <p v-if="calibrationNotice" class="hand-note">{{ calibrationNotice }}</p>
        <label for="hand-speed">Kurzor sebessége: {{ cursorSpeed.toFixed(1) }}×</label>
        <input
          id="hand-speed"
          v-model.number="cursorSpeed"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          :disabled="calibrating"
        />
        <p class="hand-note">
          Lassabb: finomabb követés. Gyorsabb: élénkebb mozgás. A teljes képernyő mindkettővel elérhető.
        </p>
        <button class="hand-stop" :disabled="calibrating" @click="calibration.reset()">
          Alapbeállítások
        </button>
        <p class="hand-note">
          {{
            calibrationSaved
              ? 'A tartomány és a sebesség ebben a böngészőben marad. Kamera vagy ülőhely változásakor kalibrálj újra.'
              : 'A böngésző nem engedi a mentést; a beállítás most csak erre a munkamenetre érvényes.'
          }}
        </p>
      </details>
      <details v-show="!compact" class="hand-camera-options">
        <summary>Kamerakép és fény</summary>
        <button class="hand-stop" :aria-pressed="largePreview" @click="largePreview = !largePreview">
          {{ largePreview ? 'Kisebb előnézet' : 'Nagyobb előnézet' }}
        </button>
        <p class="hand-note">
          A teljes kameraképet mutatjuk. A valódi látószöget az objektív adja; nagyobb területhez tedd
          távolabb a kamerát, vagy használj széles látószögű webkamerát.
        </p>
        <template v-if="exposure">
          <label for="hand-exposure">Kamera fényessége</label>
          <input
            id="hand-exposure"
            type="range"
            :min="exposure.min"
            :max="exposure.max"
            :step="exposure.step"
            :value="exposure.value"
            :disabled="exposureBusy"
            @change="changeExposure"
          />
          <p class="hand-note">
            Ellenfénynél óvatosan emeld. A kamera valódi fénybeállítását módosítja; a túl világos kép is
            ronthatja a követést.
          </p>
        </template>
        <p v-else class="hand-note">
          A kamera kézi fényállítása itt nem érhető el. A kezedet elölről, a kamera mögül világítsd meg;
          kerüld az erős ablakfényt a hátad mögött.
        </p>
        <p v-if="exposureNotice" class="hand-note" role="status">{{ exposureNotice }}</p>
      </details>
      <ul v-show="!compact" class="hand-guide">
        <li>
          <strong>Két ujj:</strong> mutató- és középső ujj kinyújtva, hüvelykujj behajtva → kurzor mozgatása
        </li>
        <li>
          <strong>Kattintás:</strong> a mutató- és középső ujj mellé nyújtsd ki oldalra a hüvelykujjad, és
          tartsd meg, amíg a kurzor körüli gyűrű feltöltődik. A gyűrűs- és kisujj maradjon behajtva. Újabb
          kattintáshoz hajtsd vissza a hüvelykujjad.
        </li>
        <li><strong>Nyitott tenyér:</strong> tartsd fel, majd mozgasd fel/le → görgetés</li>
        <li><strong>Ököl:</strong> pihenő · <strong>Esc:</strong> leállítás</li>
      </ul>
      <p v-show="!compact" class="hand-note">
        Egy kéz, jó fény, kb. karnyújtásnyi távolság. Szövegbevitelhez használd az egeret vagy a
        billentyűzetet.
      </p>
    </aside>
  </Teleport>
  <Teleport :to="cursorHost">
    <!-- A natív legördülőt a böngésző nem nyitja meg programból, és a listáját a kurzor sem látja:
         kézi kattintásra saját, nagy gombos választó nyílik a helyén. -->
    <div
      v-if="picker"
      class="hand-select-menu"
      role="listbox"
      :aria-label="picker.label"
      data-test="hand-select-menu"
      :style="picker.style"
    >
      <span class="hand-select-label">{{ picker.label }}</span>
      <button
        v-for="option in picker.options"
        :key="option.value"
        type="button"
        role="option"
        class="hand-select-option"
        :class="{ current: option.value === picker.value }"
        :aria-selected="option.value === picker.value"
        :disabled="option.disabled"
        :data-value="option.value"
        @click="choose(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
    <div
      ref="cursor"
      class="hand-cursor"
      popover="manual"
      aria-hidden="true"
      :data-gesture="gesture"
      :data-state="clickPhase"
      :data-progress="clickProgress"
      :style="cursorStyle"
    >
      <svg class="hand-cursor-ring" viewBox="0 0 44 44" aria-hidden="true">
        <circle class="hand-cursor-track" cx="22" cy="22" r="18" />
        <circle
          class="hand-cursor-progress"
          cx="22"
          cy="22"
          r="18"
          pathLength="1"
          stroke-dasharray="1"
          :stroke-dashoffset="1 - clickProgress"
        />
        <path v-if="clickPhase === 'clicked'" class="hand-cursor-check" d="m15 22 5 5 9-10" />
        <circle v-else class="hand-cursor-dot" cx="22" cy="22" r="5" />
      </svg>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { createHandTracker } from 'src/composables/handTracker'
import { classifyHand, createClickGate, handPointer, scrollVelocity } from 'src/logic/handGestures'
import { scrollAt, targetAt } from 'src/logic/handTargets'
import { cameraConstraints, configureCamera, exposureControl, lightingAdvice } from 'src/logic/handCamera'
import { useCursorLayer } from 'src/composables/useCursorLayer'
import { useHandCalibration } from 'src/composables/useHandCalibration'
import { pointerResponse } from 'src/logic/handCalibration'

const busy = ref(false)
const compact = ref(false)
const largePreview = ref(false)
const frameAspect = ref(4 / 3)
const lightWarning = ref('')
const exposure = ref(null)
const exposureBusy = ref(false)
const exposureNotice = ref('')
const active = ref(false)
const notice = ref('')
const status = ref('Engedélyezd a kamerát a böngészőben.')
const gesture = ref(null)
const position = ref(null)
const video = ref(null)
const canvas = ref(null)
const cursor = ref(null)
const clickProgress = ref(0)
const clickPhase = ref('idle')
const picker = ref(null)
let pickerSelect = null
const calibration = useHandCalibration(resetHand)
const {
  calibrating,
  step: calibrationStep,
  progress: calibrationProgress,
  hint: calibrationHint,
  notice: calibrationNotice,
  saved: calibrationSaved,
  bounds: pointerBounds,
  calibrated,
  instruction: calibrationInstruction,
  speed: cursorSpeed
} = calibration
const cursorHost = useCursorLayer(cursor, active, onCursorContextChange)
const cursorStyle = computed(() => ({
  left: `${position.value?.x ?? 0}px`,
  top: `${position.value?.y ?? 0}px`,
  visibility:
    active.value && !calibrating.value && position.value && ['point', 'click'].includes(gesture.value)
      ? 'visible'
      : 'hidden'
}))
const gate = createClickGate()
let session = 0
let lightCanvas,
  lightContext,
  lastLightSample = 0,
  pendingLight = '',
  lightSamples = 0
let stream,
  tracker,
  frame,
  hovered,
  scrollOrigin,
  lastFrame = 0,
  lastVideoTime = -1
const messages = {
  point: 'Két ujj — célozz egy gombra, majd nyújtsd ki oldalra a hüvelykujjad a kattintáshoz.',
  click: 'Hüvelyk + mutató + középső — tartsd meg röviden. Újabb kattintáshoz hajtsd vissza a hüvelykujjad.',
  scroll: 'Görgetés — mozgasd a tenyered fel vagy le.',
  rest: 'Pihenő — nyújtsd ki a mutató- és középső ujjad a folytatáshoz.'
}
const connections = [
  [0, 1, 2, 3, 4],
  [0, 5, 6, 7, 8],
  [5, 9, 10, 11, 12],
  [9, 13, 14, 15, 16],
  [13, 17, 18, 19, 20],
  [0, 17]
]

function setHovered(target) {
  if (hovered === target) return
  hovered?.classList.remove('hand-hovered')
  hovered = target
  hovered?.classList.add('hand-hovered')
}

function selectLabel(select) {
  return (
    select.getAttribute('aria-label') ||
    select.labels?.[0]?.textContent.trim() ||
    select.closest('label')?.textContent.trim() ||
    'Válassz'
  )
}

// A menü a legördülő alá (helyhiány esetén fölé) kerül, a képernyőn belül.
function pickerStyle(select) {
  const rect = select.getBoundingClientRect()
  const width = Math.min(Math.max(rect.width, 240), window.innerWidth - 16)
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
  const below = window.innerHeight - rect.bottom - 8
  const above = rect.top - 8
  const placeBelow = below >= 220 || below >= above
  return {
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: `${Math.max(120, placeBelow ? below - 6 : above - 6)}px`,
    ...(placeBelow ? { top: `${rect.bottom + 6}px` } : { bottom: `${window.innerHeight - rect.top + 6}px` })
  }
}

function openPicker(select) {
  pickerSelect = select
  picker.value = {
    label: selectLabel(select),
    value: select.value,
    options: [...select.options].map((o) => ({
      value: o.value,
      label: o.textContent.trim(),
      disabled: o.disabled
    })),
    style: pickerStyle(select)
  }
}

function closePicker() {
  picker.value = null
  pickerSelect = null
}

// Görgetéskor a menü a legördülővel együtt mozog; ha a legördülő eltűnt vagy letiltották, bezárjuk.
function followPicker() {
  if (!picker.value) return
  if (!pickerSelect?.isConnected || pickerSelect.disabled) return closePicker()
  const style = pickerStyle(pickerSelect)
  if (JSON.stringify(style) !== JSON.stringify(picker.value.style)) picker.value.style = style
}

// Ugyanúgy állítjuk be az értéket, mint a böngésző: a v-model és a @change is értesül róla.
function choose(value) {
  const select = pickerSelect
  closePicker()
  if (!select?.isConnected || select.disabled) return
  select.focus({ preventScroll: true })
  if (select.value !== value) {
    select.value = value
    select.dispatchEvent(new Event('input', { bubbles: true }))
    select.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

function stop(message = '') {
  session++
  active.value = false
  busy.value = false
  cancelAnimationFrame(frame)
  stream?.getTracks().forEach((track) => track.stop())
  stream = null
  lightCanvas = null
  lightContext = null
  lightWarning.value = ''
  exposure.value = null
  exposureBusy.value = false
  exposureNotice.value = ''
  if (video.value) video.value.srcObject = null
  tracker?.close()
  tracker = null
  calibration.cancel('')
  cursor.value?.hidePopover?.()
  resetHand()
  closePicker()
  notice.value = message
}

function resetHand() {
  gate.reset()
  clickProgress.value = 0
  clickPhase.value = 'idle'
  setHovered(null)
  position.value = null
  gesture.value = null
  scrollOrigin = null
}

function beginCalibration() {
  compact.value = false
  calibration.begin()
}

function onCursorContextChange() {
  if (calibrating.value)
    calibration.cancel('A kalibrálás megszakadt az ablakváltás miatt. A korábbi beállítás maradt érvényben.')
  resetHand()
  closePicker()
}

async function start() {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    notice.value =
      'A kézvezérléshez kamerát támogató böngésző és biztonságos HTTPS-kapcsolat (vagy localhost) szükséges.'
    return
  }
  const attempt = ++session
  busy.value = true
  notice.value = ''
  status.value = 'Engedélyezd a kamerát a böngészőben.'
  try {
    const camera = await navigator.mediaDevices.getUserMedia(cameraConstraints())
    if (attempt !== session) {
      camera.getTracks().forEach((track) => track.stop())
      return
    }
    stream = camera
    const track = camera.getVideoTracks()[0]
    await configureCamera(track)
    if (attempt !== session) return
    exposure.value = exposureControl(track)
    camera.getVideoTracks().forEach((track) =>
      track.addEventListener(
        'ended',
        () => {
          if (attempt === session) stop('A kamera kapcsolata megszakadt. Újra bekapcsolhatod a kézvezérlést.')
        },
        { once: true }
      )
    )
    await nextTick()
    video.value.srcObject = camera
    await video.value.play()
    if (attempt !== session) return
    status.value = 'Kézkövető betöltése — első alkalommal ez eltarthat néhány másodpercig.'
    const detector = await createHandTracker()
    if (attempt !== session) {
      detector.close()
      return
    }
    tracker = detector
    busy.value = false
    active.value = true
    lastFrame = 0
    lastVideoTime = -1
    lightCanvas = document.createElement('canvas')
    lightCanvas.width = 64
    lightCanvas.height = 48
    lightContext = lightCanvas.getContext('2d', { willReadFrequently: true })
    lastLightSample = 0
    pendingLight = ''
    lightSamples = 0
    status.value = 'Tartsd az egyik kezed a kamera elé.'
    frame = requestAnimationFrame(tick)
  } catch (error) {
    if (attempt !== session) return
    const errors = {
      NotAllowedError:
        'A kameraengedélyt nem kaptuk meg. Engedélyezd a kamerát a böngésző webhelybeállításaiban, majd próbáld újra.',
      NotFoundError: 'Nem található kamera. Csatlakoztass egy webkamerát, majd próbáld újra.',
      NotReadableError: 'A kamera nem érhető el. Lehet, hogy egy másik alkalmazás használja.'
    }
    stop(
      errors[error.name] ||
        'A kézkövetés nem indult el. Ellenőrizd a kamerát és a webhely fájljainak betöltését, majd próbáld újra.'
    )
  }
}

function syncFrameSize() {
  if (video.value?.videoWidth && video.value.videoHeight)
    frameAspect.value = video.value.videoWidth / video.value.videoHeight
}

async function changeExposure(event) {
  const attempt = session
  const track = stream?.getVideoTracks()[0]
  if (!track || !exposure.value || exposureBusy.value) return
  const value = Math.max(exposure.value.min, Math.min(exposure.value.max, Number(event.target.value)))
  exposureBusy.value = true
  exposureNotice.value = ''
  try {
    await track.applyConstraints({ advanced: [{ exposureCompensation: value }] })
    if (attempt === session) exposure.value = { ...exposure.value, value }
  } catch {
    if (attempt === session) {
      event.target.value = exposure.value.value
      exposureNotice.value =
        'A kamera elutasította a fényállítást. A kézvezérlés folytatódik; használj elölről világító lámpát.'
    }
  } finally {
    if (attempt === session) exposureBusy.value = false
  }
}

function sampleLight(now, points) {
  if (!lightContext || now - lastLightSample < 750) return
  lastLightSample = now
  try {
    lightContext.drawImage(video.value, 0, 0, 64, 48)
    const advice = lightingAdvice(lightContext.getImageData(0, 0, 64, 48), points)
    if (advice === pendingLight) lightSamples++
    else {
      pendingLight = advice
      lightSamples = 1
    }
    if (lightSamples >= 2) lightWarning.value = advice
  } catch {
    // A fényvizsgálat opcionális: ha nem olvasható a képkocka, a követés folytatódik.
    lightContext = null
    lightWarning.value = ''
  }
}

function draw(points) {
  const ctx = canvas.value.getContext('2d')
  const { width, height } = canvas.value
  ctx.clearRect(0, 0, width, height)
  if (!points) return
  ctx.strokeStyle = '#d5f793'
  ctx.fillStyle = '#ffffff'
  ctx.lineWidth = 2
  for (const chain of connections) {
    ctx.beginPath()
    chain.forEach((index, i) => {
      const p = points[index]
      ctx[i ? 'lineTo' : 'moveTo']((1 - p.x) * width, p.y * height)
    })
    ctx.stroke()
  }
  for (const p of points) {
    ctx.beginPath()
    ctx.arc((1 - p.x) * width, p.y * height, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function tick(now) {
  if (!active.value) return
  try {
    if (now - lastFrame >= 40 && video.value.readyState >= 2 && video.value.currentTime !== lastVideoTime) {
      const elapsed = Math.min((now - lastFrame) / 1000, 0.08)
      lastFrame = now
      lastVideoTime = video.value.currentTime
      const points = tracker.detectForVideo(video.value, now).landmarks[0]
      const next = classifyHand(points)
      sampleLight(now, next ? points : null)
      draw(next ? points : null)
      if (calibrating.value) {
        resetHand()
        calibration.sample(next, points?.[8], now)
        status.value = calibrating.value ? calibrationInstruction.value : calibrationNotice.value
      } else if (!next) {
        resetHand()
        status.value = 'Nem látok kezet — tartsd a kamera elé, jó fényben.'
      } else {
        const previous = gesture.value
        gesture.value = next
        status.value = messages[next]
        if (next === 'point') {
          const p = handPointer(points[8], pointerBounds.value)
          const desired = { x: p.x * (window.innerWidth - 1), y: p.y * (window.innerHeight - 1) }
          const old = position.value || desired
          const response = pointerResponse(cursorSpeed.value, elapsed)
          position.value = {
            x: old.x + (desired.x - old.x) * response,
            y: old.y + (desired.y - old.y) * response
          }
        }
        // A háromujjas kattintás alatt a kurzor rögzül, hogy az új ujj kinyújtása ne mozdítsa el a célpontról.
        const p = position.value
        const target = p && ['point', 'click'].includes(next) ? targetAt(p.x, p.y) : null
        setHovered(target)
        const clicked = gate.update(next, target, now)
        clickProgress.value = gate.progress
        clickPhase.value = gate.phase
        if (next === 'click') {
          if (gate.phase === 'blocked')
            status.value = 'Előbb két ujjal célozz egy gombra, majd nyújtsd ki a hüvelykujjad.'
          else if (gate.phase === 'holding')
            status.value = 'Tartsd meg a hüvelykujjad, amíg a gyűrű feltöltődik.'
          else if (gate.phase === 'clicked')
            status.value = 'Kattintva! Újabb kattintáshoz hajtsd vissza a hüvelykujjad.'
        }
        if (clicked) {
          // A menün kívüli kattintás bezárja a nyitott választót (mint a natív legördülőnél).
          if (picker.value && !target.closest('.hand-select-menu')) closePicker()
          if (target.matches('select')) openPicker(target)
          else {
            target.focus({ preventScroll: true })
            target.click()
          }
        }
        if (next === 'scroll') {
          if (previous !== 'scroll') scrollOrigin = points[9].y
          scrollAt(
            p?.x ?? window.innerWidth / 2,
            p?.y ?? window.innerHeight / 2,
            scrollVelocity(scrollOrigin, points[9].y) * elapsed
          )
        } else scrollOrigin = null
      }
    }
    followPicker()
    if (active.value) frame = requestAnimationFrame(tick)
  } catch {
    stop('A kézkövetés megszakadt. A kamera leállt; a lenti gombbal újrapróbálhatod.')
  }
}

function onKey(event) {
  if (event.key === 'Escape' && picker.value) return closePicker()
  if (event.key === 'Escape' && (busy.value || active.value)) stop('A kézvezérlés és a kamera leállt.')
}
function onHidden() {
  if (document.hidden && (busy.value || active.value))
    stop('A kézvezérlés leállt, mert elhagytad a lapot. A lenti gombbal újraindíthatod.')
}
// Egérrel a menün kívülre kattintva is bezárul.
function onPointerDown(event) {
  if (picker.value && !event.target.closest?.('.hand-select-menu')) closePicker()
}
function onPageHide() {
  stop()
}
onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('pointerdown', onPointerDown, true)
  window.addEventListener('pagehide', onPageHide)
  document.addEventListener('visibilitychange', onHidden)
})
onBeforeUnmount(() => {
  stop()
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('pointerdown', onPointerDown, true)
  window.removeEventListener('pagehide', onPageHide)
  document.removeEventListener('visibilitychange', onHidden)
})
</script>

<style scoped>
.hand-launcher {
  margin: 24px 32px 32px;
  padding: 28px;
  border: 1px solid var(--border);
  border-radius: 24px;
  background: var(--bg);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}
.hand-launcher > div {
  flex: 1 1 340px;
}
.hand-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2px;
}
.hand-launcher h2 {
  margin: 10px 0;
  font-size: 27px;
}
.hand-launcher p {
  margin: 8px 0 0;
  max-width: 650px;
}
.hand-note {
  font-size: 12px;
  line-height: 1.6;
  opacity: 0.85;
}
.hand-notice {
  flex-basis: 100%;
  font-weight: 700;
}
.hand-panel {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 100;
  width: 300px;
  max-width: calc(100vw - 32px);
  max-height: calc(100dvh - 100px);
  overflow-y: auto;
  padding: 16px;
  border: 1px solid #64846d;
  border-radius: 20px;
  background: #153e33;
  color: #fff;
  box-shadow: 0 14px 48px #0005;
  font-size: 12px;
}
.hand-panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.hand-panel--wide {
  width: 480px;
}
.hand-camera-options {
  margin: 12px 0;
  line-height: 1.6;
}
.hand-camera-options summary {
  cursor: pointer;
  font-weight: 700;
  margin-bottom: 8px;
}
.hand-camera-options label,
.hand-camera-options input {
  display: block;
  width: 100%;
}
.hand-camera-options input {
  accent-color: #d5f793;
}
.hand-light-warning {
  padding: 10px;
  border: 1px solid #eac780;
  border-radius: 8px;
  color: #ffe6b1;
  line-height: 1.6;
}
.hand-panel-heading strong {
  flex: 1;
}
.hand-stop {
  padding: 8px;
  border: 1px solid #a4c6ab;
  border-radius: 8px;
  color: #fff;
  background: #204c3d;
  cursor: pointer;
}
.hand-preview {
  position: relative;
  aspect-ratio: 4 / 3;
  background: #0c211b;
  border-radius: 12px;
  overflow: hidden;
}
.hand-preview video,
.hand-preview canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  inset: 0;
}
.hand-preview video {
  transform: scaleX(-1);
  object-fit: contain;
}
.hand-calibration-corner {
  position: absolute;
  padding: 5px 8px;
  border-radius: 6px;
  background: #153e33e6;
  color: #d5f793;
  font-weight: 800;
  pointer-events: none;
}
.hand-calibration-corner[data-step='0'] {
  left: 8px;
  top: 8px;
}
.hand-calibration-corner[data-step='1'] {
  right: 8px;
  bottom: 8px;
}
.hand-calibration-instruction {
  line-height: 1.6;
}
.hand-calibration-progress {
  width: 100%;
  accent-color: #d5f793;
}
.hand-status {
  color: #d5f793;
  line-height: 1.5;
  margin: 12px 0;
}
.hand-guide {
  margin: 0;
  padding-left: 18px;
  line-height: 1.6;
}
.hand-guide li + li {
  margin-top: 5px;
}
.hand-panel .hand-note {
  margin: 12px 0 0;
}
.hand-cursor {
  position: fixed;
  inset: auto;
  margin: 0;
  padding: 0;
  width: 44px;
  height: 44px;
  /* A natív popover overflow:auto értéke ne hozzon létre görgetősávot. */
  overflow: visible;
  line-height: 0;
  transform: translate(-50%, -50%);
  border: none;
  outline: none;
  border-radius: 50%;
  background: transparent;
  pointer-events: none;
  z-index: 2147483647;
}
.hand-cursor > * {
  pointer-events: none;
}
.hand-cursor-ring {
  display: block;
  width: 44px;
  height: 44px;
  overflow: visible;
  filter: drop-shadow(0 0 2px #153e33);
}
.hand-cursor-track {
  fill: #153e3344;
  stroke: #d5f79366;
  stroke-width: 3;
}
.hand-cursor-progress {
  fill: none;
  stroke: #d5f793;
  stroke-width: 4;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 22px 22px;
}
.hand-cursor-dot {
  fill: #d5f793;
}
.hand-cursor-check {
  fill: none;
  stroke: #d5f793;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.hand-cursor[data-state='blocked'] .hand-cursor-track {
  stroke: #f4c6a7;
}
.hand-cursor::backdrop {
  background: transparent;
  pointer-events: none;
}
/* Témák. A 2.0-s AR panel színei be voltak égetve (sötétzöld panel, lime kurzor), így világos módban is
   sötét maradt, a lime kurzor pedig világos háttéren alig látszott. A kamera-előnézet mindkét témában sötét. */
:global(body[data-theme='dark'] .hand-launcher) {
  background: linear-gradient(135deg, #27411f 0, #1b2b20 70%);
  border-color: #4f7a36;
}
:global(body[data-theme='dark'] .hand-eyebrow) {
  color: #b9dc8a;
}
:global(body:not([data-theme='dark']) .hand-launcher) {
  background: linear-gradient(135deg, #e3efcf 0, #f8f8f0 70%);
  border-color: #98aa8a;
  box-shadow:
    0 1px 2px rgba(38, 56, 30, 0.07),
    0 8px 22px -12px rgba(38, 56, 30, 0.22);
}
:global(body:not([data-theme='dark']) .hand-eyebrow) {
  color: #2f5d1e;
}
:global(body:not([data-theme='dark']) .hand-panel) {
  background: #f8f8f0;
  border-color: #6a8e50;
  color: #1d3d15;
  box-shadow: 0 14px 40px rgba(38, 56, 30, 0.25);
}
:global(body:not([data-theme='dark']) .hand-stop) {
  background: #d9eac0;
  border-color: #6a8e50;
  color: #1d3d15;
}
:global(body:not([data-theme='dark']) .hand-status) {
  color: #2f5d1e;
}
:global(body:not([data-theme='dark']) .hand-light-warning) {
  background: #fdf0dc;
  border-color: #c98f40;
  color: #6b3f0c;
}
:global(body:not([data-theme='dark']) .hand-camera-options input),
:global(body:not([data-theme='dark']) .hand-calibration-progress) {
  accent-color: #4f7a2c;
}
/* Világos kurzor: mélyzöld gyűrű fehér körvonallal, hogy világos oldalon is jól látsszon */
:global(body:not([data-theme='dark']) .hand-cursor-ring) {
  filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 1px #fff);
}
:global(body:not([data-theme='dark']) .hand-cursor-track) {
  fill: rgba(47, 93, 30, 0.14);
  stroke: rgba(47, 93, 30, 0.5);
}
:global(body:not([data-theme='dark']) .hand-cursor-progress),
:global(body:not([data-theme='dark']) .hand-cursor-check) {
  stroke: #2f7a1e;
}
:global(body:not([data-theme='dark']) .hand-cursor-dot) {
  fill: #2f5d1e;
}
:global(body:not([data-theme='dark']) .hand-cursor[data-state='blocked'] .hand-cursor-track) {
  stroke: #c26f41;
}
@media (max-width: 760px) {
  .hand-launcher {
    margin: 20px 16px;
    padding: 20px;
  }
  .hand-panel {
    width: 250px;
    padding: 12px;
    bottom: 12px;
    right: 12px;
  }
  .hand-preview {
    width: 132px;
    margin: auto;
  }
  .hand-panel--wide {
    width: calc(100vw - 24px);
  }
  .hand-panel--wide .hand-preview {
    width: 100%;
  }
  .hand-guide,
  .hand-panel .hand-note {
    font-size: 11px;
  }
}

/* Kézi választómenü a natív legördülő helyett */
.hand-select-menu {
  position: fixed;
  z-index: 2147483000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  overflow-y: auto;
  border: 2px solid #80ae45;
  border-radius: 16px;
  background: #142a20;
  color: #eef5e4;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
}
.hand-select-label {
  padding: 2px 4px 4px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #b9d68f;
}
.hand-select-option {
  min-height: 52px;
  padding: 12px 16px;
  border: 1px solid #4d6f3c;
  border-radius: 12px;
  background: #1d3a2b;
  color: inherit;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.hand-select-option:hover,
.hand-select-option.hand-hovered {
  background: #2a4f37;
}
.hand-select-option.current {
  background: linear-gradient(110deg, #d4f796, #a9df68);
  border-color: #a9df68;
  color: #132a12;
}
:global(body:not([data-theme='dark']) .hand-select-menu) {
  border-color: #6a8e50;
  background: #f8f8f0;
  color: #1d3d15;
  box-shadow: 0 18px 40px rgba(47, 93, 30, 0.28);
}
:global(body:not([data-theme='dark']) .hand-select-label) {
  color: #2f5d1e;
}
:global(body:not([data-theme='dark']) .hand-select-option) {
  border-color: #98aa8a;
  background: #fff;
}
:global(body:not([data-theme='dark']) .hand-select-option:hover),
:global(body:not([data-theme='dark']) .hand-select-option.hand-hovered) {
  background: #e3efcf;
}
:global(body:not([data-theme='dark']) .hand-select-option.current) {
  background: linear-gradient(110deg, #86b351, #5f9a34);
  border-color: #2f5d1e;
  color: #fff;
}
</style>

<style>
.hand-hovered {
  outline: 3px solid #80ae45 !important;
  outline-offset: 4px;
}
/* Világos témában sötétebb kiemelés, hogy a célzott elem jól látsszon */
body:not([data-theme='dark']) .hand-hovered {
  outline-color: #4f7a2c !important;
}
</style>
