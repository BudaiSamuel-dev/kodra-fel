import { onBeforeUnmount, onMounted, ref } from 'vue'

// „Headroom” fejléc: lefelé görgetéskor elbújik, felfelé görgetéskor (már egy kis mozdulatra) megjelenik.
// A lap tetején mindig látszik. Visszaadja: hidden (elbújt-e), floating (le van-e görgetve: árnyék kell).
export function useHeadroom({ revealZone = 90, tolerance = 6 } = {}) {
  const hidden = ref(false)
  const floating = ref(false)
  let lastY = 0
  let frame = 0

  function update() {
    frame = 0
    const y = Math.max(0, window.scrollY)
    const delta = y - lastY
    floating.value = y > 4
    if (y <= revealZone) hidden.value = false
    else if (Math.abs(delta) >= tolerance) hidden.value = delta > 0
    // kis remegésnél (tolerance alatt) nem változtatunk, és lastY-t sem frissítjük
    if (y <= revealZone || Math.abs(delta) >= tolerance) lastY = y
  }
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }
  const show = () => (hidden.value = false)

  onMounted(() => {
    lastY = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(frame)
  })

  return { hidden, floating, show }
}
