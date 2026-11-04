export function targetAt(x, y) {
  const element = document.elementFromPoint(x, y)
  const target = element?.closest(
    'button, a[href], input, textarea, select, summary, [role="button"], [role="tab"]'
  )
  if (!target || target.matches(':disabled, [aria-disabled="true"]') || target.closest('[inert]')) return null
  return target
}

export function scrollAt(x, y, delta) {
  let element = document.elementFromPoint(x, y)
  while (element && element !== document.body) {
    if (
      /(auto|scroll)/.test(getComputedStyle(element).overflowY) &&
      element.scrollHeight > element.clientHeight
    ) {
      element.scrollBy({ top: delta, behavior: 'instant' })
      return
    }
    element = element.parentElement
  }
  // Modális ablak mögött ne görgessük el az oldalt.
  if (!document.querySelector('dialog[open]')) window.scrollBy({ top: delta, behavior: 'instant' })
}
