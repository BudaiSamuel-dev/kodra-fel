// Világos téma: a szövegszínek kontrasztjának emelése.
//
// A 2.0 világos témájában a szövegszíneket épp a WCAG AA minimumra (4,5:1) lőtték be, sok apró (8–11 px)
// felirattal, míg a sötét téma mediánja kb. 8,75:1. Ez a szkript végigmegy a src/css/kodra.css világos
// módú (nem body[data-theme='dark'] kezdetű) szabályain, és minden túl világos szövegszínt ugyanabban
// az árnyalatban addig sötétít, amíg fehér háttéren el nem éri a TARGET kontrasztot.
//
// Kihagyja:
//  - a világos színeket (sötét felületre szánt szöveg: hős-szekció, aktív gombok),
//  - a díszítőelemeket (perjelek, csillagok, illusztrációk),
//  - a világos témában is sötét felületeket (kódablak, aktív/kiválasztott állapot, toast),
//  - az átlátszó és a var() színeket.
//
// A szabályok sorrendje és egymáshoz viszonyított specificitása nem változik: minden világos módú
// színszabály (a nem sötétítettek is, eredeti színnel) ugyanazt az előtagot kapja. Futtatás: node scripts/light-text-contrast.mjs → src/css/light-text.css

import { readFileSync, writeFileSync } from 'node:fs'
import postcss from 'postcss'

const TARGET = 7.5
const SOURCE = 'src/css/kodra.css'
const OUTPUT = 'src/css/light-text.css'
const LIGHT = "body:not([data-theme='dark'])"
const DECORATIVE =
  /\.(hero|art-|iso-|code-float|title-spark|build-spark|bonus-art|board-cell|visual-dots|topbar-separator|card-number > span|brand-dot|mini-app|bot-|cell-bot|confetti)/
// Világos témában is sötét felületek: a rajtuk lévő szöveg világos marad.
const DARK_SURFACE = /\.(code-window|code-line|completion-card|dark|active|selected|toast)|#toast/

const parseColor = (value) => {
  const hex = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!hex) return null
  const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1]
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}
const luminance = (rgb) =>
  rgb
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0)
const contrastOnWhite = (rgb) => 1.05 / (luminance(rgb) + 0.05)

function toHsl([r, g, b]) {
  ;[r, g, b] = [r / 255, g / 255, b / 255]
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h / 6, s, l]
}
function toRgb([h, s, l]) {
  if (!s) return [l, l, l].map((v) => Math.round(v * 255))
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const f = (t) => {
    t = (t + 1) % 1
    return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p
  }
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255))
}
const toHex = (rgb) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('')

// Ugyanaz az árnyalat és telítettség, csak sötétebb.
export function darken(rgb, target = TARGET) {
  const [h, s, l] = toHsl(rgb)
  for (let next = l; next > 0; next -= 0.005) {
    const candidate = toRgb([h, s, next])
    if (contrastOnWhite(candidate) >= target) return candidate
  }
  return [0, 0, 0]
}

const prefix = (selectors) =>
  selectors.map((s) => (s.startsWith('body') ? s.replace(/^body/, LIGHT) : `${LIGHT} ${s}`)).join(',\n')

function generate() {
  const root = postcss.parse(readFileSync(SOURCE, 'utf8'))
  const out = postcss.root()
  let changed = 0

  root.walkRules((rule) => {
    if (rule.selector.includes("data-theme='dark'")) return
    if (rule.parent.type === 'atrule' && rule.parent.name === 'keyframes') return
    const decl = rule.nodes.find((n) => n.type === 'decl' && n.prop === 'color')
    if (!decl) return
    const rgb = parseColor(decl.value)
    // Csak a sötét szövegszíneket sötétítjük tovább; a világosak sötét felületre valók.
    const darkenable = rgb && luminance(rgb) <= 0.45 && contrastOnWhite(rgb) < TARGET
    // Csoportosított szelektoroknál (.a, .b, .hero p) szelektoronként döntünk.
    // A :not(.active) kizárás nem jelent sötét felületet, ezért azt nem nézzük.
    const eligible = (s) =>
      darkenable && !DECORATIVE.test(s) && !DARK_SURFACE.test(s.replace(/:not\([^)]*\)/g, ''))
    const darkened = rule.selectors.filter(eligible)
    const kept = rule.selectors.filter((s) => !eligible(s))

    // MINDEN színszabály bekerül ugyanazzal az előtaggal (a nem sötétítendők az eredeti színükkel),
    // különben egy előtagos általános szabály legyőzné az előtag nélküli állapotszabályt
    // (pl. .game-step span vs. .game-step.active span).
    const copies = []
    if (kept.length)
      copies.push(postcss.rule({ selector: prefix(kept) }).append({ prop: 'color', value: decl.value }))
    if (darkened.length) {
      copies.push(
        postcss.rule({ selector: prefix(darkened) }).append({ prop: 'color', value: toHex(darken(rgb)) })
      )
      changed += darkened.length
    }
    for (const copy of copies) {
      copy.raws.before = '\n'
      // @media blokkon belüli szabály ugyanabba a @media-ba kerül.
      if (rule.parent.type === 'atrule') {
        const media = postcss.atRule({ name: rule.parent.name, params: rule.parent.params })
        media.append(copy)
        out.append(media)
      } else out.append(copy)
    }
  })

  writeFileSync(
    OUTPUT,
    `/* GENERÁLT FÁJL — ne szerkeszd kézzel. Forrás: scripts/light-text-contrast.mjs (cél: ${TARGET}:1 fehér alapon). */\n` +
      out.toString() +
      '\n'
  )
  console.log(`${changed} szelektor szövegszíne sötétítve → ${OUTPUT}`)
}

// Csak közvetlen futtatáskor generál (importnál nem).
if (import.meta.url === `file://${process.argv[1]}`) generate()
