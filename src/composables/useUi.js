import { nextTick, reactive } from 'vue'

// Az egész appban közös felületi állapot: értesítés (toast) és párbeszédablak.
export const ui = reactive({ toast: '', toastVisible: false, dialog: null })

let toastTimer
export function toast(message) {
  ui.toast = message
  ui.toastVisible = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (ui.toastVisible = false), 3500)
}

export const openDialog = (name) => (ui.dialog = name) // 'help' | 'how' | 'reset'
export const closeDialog = () => (ui.dialog = null)

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// Konfetti siker esetén. Csökkentett mozgás beállításnál kimarad.
export function celebrate(count = 25) {
  if (prefersReducedMotion()) return
  const box = document.createElement('div')
  box.className = 'confetti'
  box.setAttribute('aria-hidden', 'true')
  const colors = ['#d5f793', '#bdb0f2', '#f4c6a7', '#8ce4d4']
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('i')
    piece.style.cssText = `--x:${Math.random() * 100}vw;--delay:${Math.random() * 0.4}s;--rot:${Math.random() * 720}deg;background:${colors[i % 4]}`
    box.append(piece)
  }
  document.body.append(box)
  setTimeout(() => box.remove(), 2400)
}

export const scrollTop = () => window.scrollTo({ top: 0, behavior: 'instant' })

// Tartalomváltás után a fókusz az új címre kerül (képernyőolvasóknak).
export async function focusHeading() {
  await nextTick()
  const h1 = document.querySelector('#main h1')
  if (!h1) return
  h1.tabIndex = -1
  h1.focus({ preventScroll: true })
}
