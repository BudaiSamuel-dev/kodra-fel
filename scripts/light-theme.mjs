// Világos téma: szövegkontraszt és kímélőbb felületek, a régi stíluslapból generálva.
//
// A 2.0 világos témájában
//  - a szövegszínek épp a WCAG AA minimumon (4,5:1) voltak, sok apró felirattal (a sötét téma mediánja 8,75:1),
//  - a felületek tiszta vagy majdnem tiszta fehérek voltak (#fff, #fffefb …), ami nagy képernyőn vakít.
//
// Ez a szkript végigmegy a src/css/kodra.css világos módú (nem body[data-theme='dark'] kezdetű) szabályain:
//  - color: a túl világos szövegszínt azonos árnyalatban sötétíti, amíg az elefántcsont felületen el nem
//    éri a TARGET kontrasztot; a semleges szürkéket enyhén zöldes árnyalatúra tónusolja (a paletta része),
//  - background(-color): a majdnem fehér egyszínű hátteret elefántcsontra cseréli.
//
// Kihagyja:
//  - a világos szövegszíneket (sötét felületre szánt szöveg: hős-szekció, aktív gombok),
//  - a díszítőelemeket (perjelek, csillagok, illusztrációk),
//  - a világos témában is sötét felületeket (kódablak, aktív/kiválasztott állapot, toast),
//  - az átlátszó, a gradiens és a var() értékeket.
//
// A kaszkád nem változik: minden világos módú color/background szabály (a változatlanok is, eredeti
// értékkel) ugyanazt az előtagot kapja, így az egymáshoz viszonyított specificitásuk megmarad.
//
// Futtatás: npm run css:light → src/css/light-generated.css

import { readFileSync, writeFileSync } from 'node:fs'
import postcss from 'postcss'

const SOURCE = 'src/css/kodra.css'
const OUTPUT = 'src/css/light-generated.css'
const LIGHT = "body:not([data-theme='dark'])"

// A paletta felülete (light.scss: $surface) és a szöveg célkontrasztja rajta
export const SURFACE = [0xf8, 0xf8, 0xf0]
const TARGET = 7.5
// Semleges szürke szöveg tónusa: enyhén zöldes, a paletta zsálya árnyalatához
const NEUTRAL_HUE = 100 / 360
const NEUTRAL_SATURATION = 0.1

const DECORATIVE =
  /\.(hero|art-|iso-|code-float|title-spark|build-spark|bonus-art|board-cell|visual-dots|topbar-separator|card-number > span|brand-dot|mini-app|bot-|cell-bot|confetti|card-visual|command-chip|test-line|bug-magnifier|phone-notch)/
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
const contrastOnSurface = (rgb) => (luminance(SURFACE) + 0.05) / (luminance(rgb) + 0.05)

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

// Azonos árnyalat, sötétebb; a semleges szürkék enyhén zöldes tónust kapnak.
export function darken(rgb, target = TARGET) {
  let [h, s, l] = toHsl(rgb)
  if (s < NEUTRAL_SATURATION) [h, s] = [NEUTRAL_HUE, NEUTRAL_SATURATION]
  for (let next = l; next > 0; next -= 0.005) {
    const candidate = toRgb([h, s, next])
    if (contrastOnSurface(candidate) >= target) return candidate
  }
  return [0, 0, 0]
}

// Szöveg: csak a sötét, de nem elég sötét színek (a világosak sötét felületre valók).
const transformColor = (rgb) =>
  luminance(rgb) <= 0.45 && contrastOnSurface(rgb) < TARGET ? toHex(darken(rgb)) : null
// Háttér: a majdnem fehér, alig színes felületek elefántcsontot kapnak. (A színességet a csatornák
// különbségével mérjük: a HSL-telítettség majdnem fehérnél félrevezetően magas.)
const chroma = (rgb) => (Math.max(...rgb) - Math.min(...rgb)) / 255
const transformBackground = (rgb) => (luminance(rgb) > 0.93 && chroma(rgb) < 0.08 ? toHex(SURFACE) : null)

const PROPS = {
  color: transformColor,
  background: transformBackground,
  'background-color': transformBackground
}

const BACKGROUND_LONGHAND =
  /^(-webkit-)?background-(clip|origin|size|position|position-x|position-y|repeat|attachment|image|color|blend-mode)$/

const prefix = (selectors) =>
  selectors.map((s) => (s.startsWith('body') ? s.replace(/^body/, LIGHT) : `${LIGHT} ${s}`)).join(',\n')

function generate() {
  const root = postcss.parse(readFileSync(SOURCE, 'utf8'))
  const out = postcss.root()
  const changed = { color: 0, background: 0 }

  root.walkRules((rule) => {
    if (rule.selector.includes("data-theme='dark'")) return
    if (rule.parent.type === 'atrule' && rule.parent.name === 'keyframes') return

    for (const decl of rule.nodes.filter((n) => n.type === 'decl' && n.prop in PROPS)) {
      const rgb = parseColor(decl.value)
      const transformed = rgb && PROPS[decl.prop](rgb)
      // Csoportosított szelektoroknál (.a, .b, .hero p) szelektoronként döntünk.
      // A :not(.active) kizárás nem jelent sötét felületet, ezért azt nem nézzük.
      const eligible = (s) =>
        transformed && !DECORATIVE.test(s) && !DARK_SURFACE.test(s.replace(/:not\([^)]*\)/g, ''))
      const changedSelectors = rule.selectors.filter(eligible)
      const kept = rule.selectors.filter((s) => !eligible(s))

      // A background rövidítés alapértékre állítja a többi háttér-tulajdonságot (pl. background-clip: text
      // a gradiens szövegnél), ezért azokat is visszük vele, különben a másolat elrontaná az eredetit.
      const companions =
        decl.prop === 'background'
          ? rule.nodes
              .slice(rule.nodes.indexOf(decl) + 1) // csak az utána állók: az előtte lévőket az eredetiben is felülírja
              .filter((n) => n.type === 'decl' && BACKGROUND_LONGHAND.test(n.prop))
          : []
      const copyRule = (selectors, value) =>
        postcss
          .rule({ selector: prefix(selectors) })
          .append({ prop: decl.prop, value }, ...companions.map((n) => ({ prop: n.prop, value: n.value })))

      const copies = []
      if (kept.length) copies.push(copyRule(kept, decl.value))
      if (changedSelectors.length) {
        copies.push(copyRule(changedSelectors, transformed))
        changed[decl.prop === 'color' ? 'color' : 'background'] += changedSelectors.length
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
    }
  })

  writeFileSync(
    OUTPUT,
    `/* GENERÁLT FÁJL — ne szerkeszd kézzel. Forrás: scripts/light-theme.mjs (npm run css:light). */\n` +
      out.toString() +
      '\n'
  )
  console.log(
    `${changed.color} szövegszín sötétítve, ${changed.background} fehér háttér elefántcsontra cserélve → ${OUTPUT}`
  )
}

// Csak közvetlen futtatáskor generál (importnál nem).
if (import.meta.url === `file://${process.argv[1]}`) generate()
