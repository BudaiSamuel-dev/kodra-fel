import { nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'

// A natív dialog/popover a böngésző felső rétegében él, ahol a z-index
// nem határozza meg a sorrendet. A kurzor az aktív modalhoz tartozik,
// és az új popup után kerül vissza a felső réteg tetejére.
export function useCursorLayer(cursor, active, onContextChange) {
  const host = shallowRef(document.body)
  let observer
  let revision = 0

  async function refresh(force = false) {
    const element = cursor.value
    if (!active.value || !element) return
    let dialogs
    try {
      dialogs = [...document.querySelectorAll('dialog:modal')]
    } catch {
      dialogs = [...document.querySelectorAll('dialog[open]')]
    }
    const focusedDialog = document.activeElement?.closest('dialog[open]')
    const target = dialogs.includes(focusedDialog) ? focusedDialog : dialogs.at(-1) || document.body
    const changed = host.value !== target
    if (!changed && !force && (!element.showPopover || element.matches(':popover-open'))) return
    const request = ++revision
    element.hidePopover?.()
    if (changed) {
      onContextChange()
      host.value = target
    }
    await nextTick()
    if (request !== revision || !active.value || !cursor.value) return
    if (cursor.value.showPopover) cursor.value.showPopover()
    else cursor.value.removeAttribute('popover')
  }

  function onToggle(event) {
    if (event.target !== cursor.value && event.target.matches?.('dialog, [popover]')) refresh(true)
  }

  function detach() {
    revision++
    observer?.disconnect()
    document.removeEventListener('toggle', onToggle, true)
    cursor.value?.hidePopover?.()
  }

  watch(
    active,
    (enabled) => {
      detach()
      if (!enabled) {
        host.value = document.body
        return
      }
      observer = new MutationObserver(() => refresh())
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['open'],
        childList: true,
        subtree: true
      })
      document.addEventListener('toggle', onToggle, true)
      refresh(true)
    },
    { flush: 'post' }
  )

  onBeforeUnmount(detach)
  return host
}
