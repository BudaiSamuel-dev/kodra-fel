// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { scrollAt, targetAt } from '../../src/logic/handTargets'

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('AR célpont és görgetés', () => {
  it('a gomb belső eleméről a gombra mutat, letiltott és inert elemet kihagy', () => {
    document.body.innerHTML = '<button><span>Gomb</span></button>'
    const button = document.querySelector('button')
    document.elementFromPoint = () => button.firstElementChild
    expect(targetAt(10, 10)).toBe(button)
    button.disabled = true
    expect(targetAt(10, 10)).toBeNull()
    button.disabled = false
    button.setAttribute('aria-disabled', 'true')
    expect(targetAt(10, 10)).toBeNull()
    button.removeAttribute('aria-disabled')
    button.setAttribute('inert', '')
    expect(targetAt(10, 10)).toBeNull()
  })
  it('a kurzor alatti görgethető ablakot mozgatja', () => {
    document.body.innerHTML = '<div style="overflow-y:auto"><button>Gomb</button></div>'
    const container = document.querySelector('div')
    Object.defineProperties(container, { scrollHeight: { value: 1000 }, clientHeight: { value: 200 } })
    container.scrollBy = vi.fn()
    document.elementFromPoint = () => document.querySelector('button')
    scrollAt(10, 10, 42)
    expect(container.scrollBy).toHaveBeenCalledWith({ top: 42, behavior: 'instant' })
  })
  it('modális ablak mögött nem görgeti el az oldalt', () => {
    document.elementFromPoint = () => document.body
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
    scrollAt(10, 10, 42)
    expect(scroll).toHaveBeenCalledOnce()
    document.body.innerHTML = '<dialog open></dialog>'
    scrollAt(10, 10, 42)
    expect(scroll).toHaveBeenCalledOnce()
  })
})
