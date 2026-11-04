import { cp, mkdir } from 'node:fs/promises'

// A WASM is saját eredetről töltődik be; nincs futásidejű CDN-függőség.
const target = new URL('../public/hand-tracking/wasm/', import.meta.url)
await mkdir(target, { recursive: true })
await cp(new URL('../node_modules/@mediapipe/tasks-vision/wasm/', import.meta.url), target, {
  recursive: true
})
