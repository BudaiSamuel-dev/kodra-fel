import { expect, test } from '@playwright/test'

test.use({
  launchOptions: {
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
  }
})

async function observeCamera(page) {
  await page.addInitScript(() => {
    window.cameraCalls = 0
    window.cameraTracks = []
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia = async (options) => {
      window.cameraCalls++
      window.cameraOptions = options
      const stream = await original(options)
      window.cameraTracks.push(...stream.getTracks())
      return stream
    }
  })
}

async function mockTracker(page) {
  await page.route('**/src/composables/handTracker.js*', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `export async function createHandTracker() {
      window.trackerClosed = false;
      return {
        detectForVideo() { if (window.failTracking) throw new Error('tracking failed'); return { landmarks: window.handPoints ? [window.handPoints] : [] }; },
        close() { window.trackerClosed = true; }
      };
    }`
    })
  )
}

async function start(page) {
  await page.getByRole('button', { name: 'AR kézvezérlés bekapcsolása', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'AR kézvezérlés kikapcsolása', exact: true })
  ).toHaveAttribute('aria-pressed', 'true', { timeout: 30000 })
}

async function setHand(page, mode, target = { x: 720, y: 450 }) {
  await page.evaluate(
    ({ mode, target }) => {
      if (!mode) {
        window.handPoints = null
        return
      }
      const tip = {
        x: 1 - (0.12 + (target.x / (innerWidth - 1)) * 0.76),
        y: 0.12 + (target.y / (innerHeight - 1)) * 0.76
      }
      const points = Array.from({ length: 21 }, () => ({ x: tip.x, y: tip.y + 0.2 }))
      points[0] = { x: tip.x, y: tip.y + 0.4 }
      points[9] = { x: tip.x, y: tip.y + 0.2 }
      points[2] = { x: tip.x - 0.08, y: tip.y + 0.32 }
      points[3] = { x: tip.x - (mode === 'click' ? 0.16 : 0.08), y: tip.y + 0.28 }
      points[4] = { x: tip.x - (mode === 'click' ? 0.24 : 0.01), y: tip.y + (mode === 'click' ? 0.24 : 0.22) }
      points[5] = { x: tip.x - 0.08, y: tip.y + 0.2 }
      points[17] = { x: tip.x + 0.16, y: tip.y + 0.22 }
      for (const index of [8, 12, 16, 20]) {
        points[index - 2] = { x: tip.x, y: tip.y + 0.15 }
        points[index] = {
          x: tip.x,
          y:
            mode === 'scroll' || index <= (mode === 'ring' ? 16 : ['point', 'click'].includes(mode) ? 12 : 8)
              ? tip.y
              : tip.y + 0.34
        }
      }
      window.handPoints = points
    },
    { mode, target }
  )
}

async function aimAt(page, target) {
  const box = await target.boundingBox()
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  await setHand(page, 'point', point)
  await expect(target).toHaveClass(/hand-hovered/)
  await expect(page.locator('.hand-cursor')).toBeVisible()
  return point
}

async function assertCursorOnTop(page) {
  // A kurzor rendesen átengedi a kattintást. Csak a mérés idejére tesszük
  // találhatóvá: így a böngésző tényleges felső rétegét ellenőrizzük.
  expect(
    await page.locator('.hand-cursor').evaluate((cursor) => {
      cursor.style.pointerEvents = 'auto'
      try {
        const rect = cursor.getBoundingClientRect()
        return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === cursor
      } finally {
        cursor.style.removeProperty('pointer-events')
      }
    })
  ).toBe(true)
}

test('a kattintás gyűrűje a tényleges kattintásig töltődik és nem ismétel', async ({ page }) => {
  await mockTracker(page)
  await page.goto('/')
  await start(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  const toggle = page.locator('.theme-toggle')
  const point = await aimAt(page, toggle)
  await page.evaluate(() => {
    window.arClicks = 0
    document.querySelector('.theme-toggle').addEventListener('click', () => window.arClicks++)
  })
  await page.waitForTimeout(250)
  await setHand(page, 'click', point)
  const cursor = page.locator('.hand-cursor')
  await expect(cursor).toHaveAttribute('data-state', 'holding')
  await expect.poll(() => cursor.evaluate((el) => Number(el.dataset.progress))).toBeGreaterThan(0)
  await expect.poll(() => page.evaluate(() => window.arClicks)).toBe(1)
  await expect(cursor).toHaveAttribute('data-state', 'clicked')
  await expect(cursor).toHaveAttribute('data-progress', '1')
  await expect(cursor.locator('.hand-cursor-check')).toHaveCount(1)
  await page.waitForTimeout(500)
  expect(await page.evaluate(() => window.arClicks)).toBe(1)
  await setHand(page, null)
  await expect(cursor).toBeHidden()
  await expect(cursor).toHaveAttribute('data-progress', '0')
})

test('személyes kalibráció két ponttal, biztonságos megszakítással és tartós sebességállítással', async ({
  page
}) => {
  await mockTracker(page)
  await page.goto('/')
  await start(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  const panel = page.locator('.hand-calibration-options')
  await panel.locator('summary').click()
  await page.getByRole('button', { name: 'Kalibrálás indítása', exact: true }).click()
  await expect(panel).toContainText('1/2 · Bal felső sarok')
  await setHand(page, 'click')
  await expect(panel).toContainText('Mutass két ujjat')
  await expect(page.locator('.hand-cursor')).toBeHidden()
  await setHand(page, 'scroll')
  const scrollBefore = await page.evaluate(() => scrollY)
  await page.waitForTimeout(250)
  expect(await page.evaluate(() => scrollY)).toBe(scrollBefore)
  const viewport = page.viewportSize()
  const left = { x: (viewport.width - 1) * 0.2, y: (viewport.height - 1) * 0.2 }
  const right = { x: (viewport.width - 1) * 0.8, y: (viewport.height - 1) * 0.8 }
  await setHand(page, 'point', left)
  await expect(panel).toContainText('2/2 · Jobb alsó sarok', { timeout: 10000 })
  await setHand(page, null)
  await expect(panel).toContainText('Mutass két ujjat')
  expect(await page.evaluate(() => localStorage.getItem('kodra-ar-controls-v1'))).toBeNull()
  await setHand(page, 'point', right)
  await expect(panel).toContainText('Kalibrálás kész', { timeout: 10000 })
  await expect(panel).toContainText('saját mozgástartományod aktív')
  const profile = await page.evaluate(() => JSON.parse(localStorage.getItem('kodra-ar-controls-v1')))
  expect(profile.bounds.left).toBeCloseTo(0.272)
  expect(profile.bounds.right).toBeCloseTo(0.728)
  await setHand(page, 'point', left)
  await expect
    .poll(() => page.locator('.hand-cursor').evaluate((el) => parseFloat(el.style.left)))
    .toBeLessThan(20)
  const speed = page.getByLabel(/Kurzor sebessége:/)
  await speed.evaluate((element) => {
    element.value = '1.6'
    element.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('kodra-ar-controls-v1')).speed))
    .toBe(1.6)
  await page.getByRole('button', { name: 'Újrakalibrálás', exact: true }).click()
  await setHand(page, 'point', left)
  await expect(panel).toContainText('2/2 · Jobb alsó sarok', { timeout: 10000 })
  await page.getByRole('button', { name: 'Kalibrálás megszakítása', exact: true }).click()
  const afterCancel = await page.evaluate(() => JSON.parse(localStorage.getItem('kodra-ar-controls-v1')))
  expect(afterCancel.bounds).toEqual(profile.bounds)
  await page.reload()
  await start(page)
  await page.locator('.hand-calibration-options summary').click()
  await expect(page.getByLabel(/Kurzor sebessége:/)).toHaveValue('1.6')
  await expect(page.locator('.hand-calibration-options')).toContainText('saját mozgástartományod aktív')
  await page.getByRole('button', { name: 'Alapbeállítások', exact: true }).click()
  await expect(page.getByLabel(/Kurzor sebessége:/)).toHaveValue('1')
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('kodra-ar-controls-v1')).bounds))
    .toBeNull()
})

for (const popoverSupported of [true, false]) {
  test(`a kurzor popup fölött marad és AR-ral bezárható (${popoverSupported ? 'natív felső réteg' : 'popover API nélkül'})`, async ({
    page
  }) => {
    if (!popoverSupported)
      await page.addInitScript(() => {
        HTMLElement.prototype.showPopover = undefined
        HTMLElement.prototype.hidePopover = undefined
      })
    await mockTracker(page)
    await observeCamera(page)
    await page.goto('/')
    await start(page)
    await page.evaluate(() => window.scrollTo(0, 0))
    for (let i = 0; i < 2; i++) {
      const point = await aimAt(page, page.locator('.sidebar .help-link'))
      await page.waitForTimeout(250)
      await setHand(page, 'click', point)
      await expect(page.locator('#info-dialog')).toBeVisible()
      const close = page.getByRole('button', { name: 'Ablak bezárása', exact: true })
      const closePoint = await aimAt(page, close)
      await assertCursorOnTop(page)
      await page.waitForTimeout(250)
      await setHand(page, 'click', closePoint)
      await expect(page.locator('#info-dialog')).toBeHidden()
      await expect(page.locator('body > .hand-cursor')).toHaveCount(1)
    }
    await page.getByRole('button', { name: 'Kézvezérlés leállítása' }).click()
    expect(
      await page.evaluate(() => window.cameraTracks.every((track) => track.readyState === 'ended'))
    ).toBe(true)
    await expect(page.locator('.hand-cursor')).toBeHidden()
  })
}

test('egy később megnyitott natív popover sem takarja el az AR-kurzort', async ({ page }) => {
  await mockTracker(page)
  await page.goto('/')
  await start(page)
  await setHand(page, 'point')
  await expect(page.locator('.hand-cursor')).toBeVisible()
  await page.evaluate(() => {
    const popup = document.createElement('div')
    popup.id = 'covering-popover'
    popup.setAttribute('popover', 'manual')
    popup.style.cssText = 'position:fixed;inset:0;margin:0;width:100vw;height:100vh;background:white;'
    document.body.append(popup)
    popup.showPopover()
  })
  await expect(page.locator('#covering-popover')).toBeVisible()
  await expect
    .poll(async () => {
      return page.locator('.hand-cursor').evaluate((cursor) => {
        cursor.style.pointerEvents = 'auto'
        const rect = cursor.getBoundingClientRect()
        const onTop = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === cursor
        cursor.style.removeProperty('pointer-events')
        return onTop
      })
    })
    .toBe(true)
  await page.evaluate(() => document.getElementById('covering-popover').remove())
  await page.keyboard.press('Escape')
  await expect(page.locator('.hand-cursor')).toBeHidden()
})

test('valódi MediaPipe WASM és modell betöltése, csak bekapcsolás után', async ({ page }) => {
  const assets = []
  page.on('request', (request) => {
    if (request.url().includes('/hand-tracking/')) assets.push(request.url())
  })
  await observeCamera(page)
  await page.goto('/')
  expect(await page.evaluate(() => window.cameraCalls)).toBe(0)
  expect(assets).toHaveLength(0)
  await start(page)
  expect(await page.evaluate(() => window.cameraOptions.video.resizeMode.ideal)).toBe('none')
  expect(assets.some((url) => url.endsWith('.wasm'))).toBe(true)
  expect(assets.some((url) => url.endsWith('.task'))).toBe(true)
  await expect(page.locator('.hand-status')).toContainText('Nem látok kezet')
  await page.keyboard.press('Escape')
  await expect(page.locator('.hand-panel')).toHaveCount(0)
  expect(await page.evaluate(() => window.cameraTracks.every((track) => track.readyState === 'ended'))).toBe(
    true
  )
})

test('a teljes kép és kézváz aránya megegyezik; az előnézet nagyítható', async ({ page }) => {
  await mockTracker(page)
  await page.goto('/')
  await start(page)
  const aspect = await page.locator('.hand-preview').evaluate((element) => {
    const video = element.querySelector('video')
    const canvas = element.querySelector('canvas')
    return {
      video: video.videoWidth / video.videoHeight,
      overlay: canvas.width / canvas.height,
      preview: Number(getComputedStyle(element).aspectRatio.split('/')[0])
    }
  })
  expect(Math.abs(aspect.video - aspect.overlay)).toBeLessThan(0.02)
  expect(Math.abs(aspect.video - aspect.preview)).toBeLessThan(0.02)
  await page.getByText('Kamerakép és fény', { exact: true }).click()
  await page.getByRole('button', { name: 'Nagyobb előnézet' }).click()
  await expect(page.locator('.hand-panel')).toHaveClass(/hand-panel--wide/)
  await page.setViewportSize({ width: 375, height: 800 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('ellenfényjelzés világos háttérnél megjelenik, egyenletes fényben eltűnik', async ({ page }) => {
  await mockTracker(page)
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 360
      const ctx = canvas.getContext('2d')
      window.testBacklit = true
      const draw = () => {
        ctx.fillStyle = window.testBacklit ? '#fafafa' : '#888888'
        ctx.fillRect(0, 0, 640, 360)
        ctx.fillStyle = window.testBacklit ? '#202020' : '#888888'
        ctx.fillRect(190, 88, 260, 184)
      }
      draw()
      const timer = setInterval(draw, 80)
      const stream = canvas.captureStream(12)
      const track = stream.getTracks()[0]
      const stop = track.stop.bind(track)
      track.stop = () => {
        clearInterval(timer)
        stop()
      }
      return stream
    }
  })
  await page.goto('/')
  await start(page)
  await expect(page.locator('.hand-light-warning')).toContainText('ellenfény', { timeout: 10000 })
  await page.evaluate(() => {
    window.testBacklit = false
  })
  await expect(page.locator('.hand-light-warning')).toHaveCount(0, { timeout: 10000 })
  await page.keyboard.press('Escape')
})

test('a támogatott fényállítás a kamerára kerül, elutasítása mellett a követés folytatódik', async ({
  page
}) => {
  await mockTracker(page)
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia = async (options) => {
      const stream = await original(options)
      const track = stream.getVideoTracks()[0]
      window.cameraApplied = []
      track.getCapabilities = () => ({
        zoom: { min: 1 },
        exposureMode: ['continuous'],
        exposureCompensation: { min: -2, max: 2, step: 0.5 }
      })
      track.getSettings = () => ({ exposureCompensation: 0 })
      track.applyConstraints = async (constraints) => {
        if (window.rejectExposure) throw new Error('unsupported')
        window.cameraApplied.push(constraints)
      }
      return stream
    }
  })
  await page.goto('/')
  await start(page)
  await page.getByText('Kamerakép és fény', { exact: true }).click()
  const input = page.getByLabel('Kamera fényessége')
  await input.evaluate((element) => {
    element.value = '1'
    element.dispatchEvent(new Event('change', { bubbles: true }))
  })
  await expect
    .poll(() =>
      page.evaluate(() => window.cameraApplied.some((c) => c.advanced[0].exposureCompensation === 1))
    )
    .toBe(true)
  await page.evaluate(() => {
    window.rejectExposure = true
  })
  await input.evaluate((element) => {
    element.value = '2'
    element.dispatchEvent(new Event('change', { bubbles: true }))
  })
  await expect(page.locator('.hand-camera-options:has(#hand-exposure)')).toContainText('kamera elutasította')
  await expect(input).toHaveValue('1')
  await expect(
    page.getByRole('button', { name: 'AR kézvezérlés kikapcsolása', exact: true })
  ).toHaveAttribute('aria-pressed', 'true')
})

test('két ujjal célzás és hüvelykujjal kattintás navigál; tartott jel nem ismétel; tenyér görget', async ({
  page
}) => {
  await mockTracker(page)
  await observeCamera(page)
  await page.goto('/')
  await start(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  const button = page.getByRole('button', { name: 'A szakmáról', exact: true })
  const box = await button.boundingBox()
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  await setHand(page, 'single', point)
  await expect(page.locator('.hand-status')).toContainText('Pihenő')
  await expect(page.locator('.hand-cursor')).toBeHidden()
  await setHand(page, 'point', point)
  await expect(button).toHaveClass(/hand-hovered/)
  await setHand(page, 'ring', point)
  await expect(page.locator('.hand-status')).toContainText('Pihenő')
  await expect(page.locator('.hand-cursor')).toBeHidden()
  await setHand(page, 'point', point)
  await expect(button).toHaveClass(/hand-hovered/)
  // A stabil rámutatási időt a felhasználó is kivárja.
  await page.waitForTimeout(250)
  await setHand(page, 'click', point)
  await expect(page).toHaveURL(/\/szakma$/)
  await expect(page.locator('.hand-panel')).toBeVisible()
  await page.evaluate(() => {
    window.extraClicks = 0
    document.addEventListener('click', () => window.extraClicks++)
  })
  await page.waitForTimeout(350)
  expect(await page.evaluate(() => window.extraClicks)).toBe(0)
  await page.evaluate(() => window.scrollTo(0, 0))
  await setHand(page, 'scroll')
  await expect(page.locator('.hand-status')).toContainText('Görgetés')
  await page.evaluate(() =>
    window.handPoints.forEach((p) => {
      p.y += 0.18
    })
  )
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(40)
  await setHand(page, null)
  await expect(page.locator('.hand-hovered')).toHaveCount(0)
  await expect(page.locator('.hand-cursor')).toBeHidden()
  await page.getByRole('button', { name: 'Kézvezérlés leállítása' }).click()
  expect(
    await page.evaluate(
      () => window.trackerClosed && window.cameraTracks.every((t) => t.readyState === 'ended')
    )
  ).toBe(true)
})

test('engedélyhiba után újrapróbálható; felismerési hiba felszabadítja a kamerát', async ({ page }) => {
  await mockTracker(page)
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    let denied = false
    navigator.mediaDevices.getUserMedia = async (options) => {
      if (!denied) {
        denied = true
        throw new DOMException('denied', 'NotAllowedError')
      }
      const stream = await original(options)
      window.tracks = stream.getTracks()
      return stream
    }
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'AR kézvezérlés bekapcsolása', exact: true }).click()
  await expect(page.locator('.hand-notice')).toContainText('kameraengedélyt nem kaptuk meg')
  await start(page)
  await page.evaluate(() => {
    window.failTracking = true
  })
  await expect(page.locator('.hand-panel')).toHaveCount(0)
  expect(await page.evaluate(() => window.tracks.every((track) => track.readyState === 'ended'))).toBe(true)
  await expect(page.locator('.hand-notice')).toContainText('kézkövetés megszakadt')
})

test('indítás megszakítása a még függő kameraengedélynél is leállítja a később megkapott streamet', async ({
  page
}) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () =>
      new Promise((resolve) => {
        window.resolveCamera = resolve
      })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'AR kézvezérlés bekapcsolása', exact: true }).click()
  await page.getByRole('button', { name: 'Kézvezérlés leállítása' }).click()
  await page.evaluate(() => {
    window.lateTrackStopped = false
    window.resolveCamera({
      getTracks: () => [
        {
          stop() {
            window.lateTrackStopped = true
          }
        }
      ]
    })
  })
  await expect.poll(() => page.evaluate(() => window.lateTrackStopped)).toBe(true)
  await expect(page.locator('.hand-panel')).toHaveCount(0)
})

test('háttérbe kerüléskor leáll, keskeny nézetben sem lóg ki', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await mockTracker(page)
  await observeCamera(page)
  await page.goto('/')
  await start(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Kamera-előnézet és útmutató váltása' }).click()
  await expect(page.locator('.hand-preview')).toBeHidden()
  expect(await page.evaluate(() => window.cameraTracks.every((track) => track.readyState === 'live'))).toBe(
    true
  )
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.locator('.hand-panel')).toHaveCount(0)
  expect(await page.evaluate(() => window.cameraTracks.every((track) => track.readyState === 'ended'))).toBe(
    true
  )
})

test('a legördülőre kattintva kézzel is választható menü nyílik, és az érték átkerül a játékba', async ({
  page
}) => {
  await mockTracker(page)
  await page.goto('/kuldetes/robot')
  await start(page)
  const select = page.locator('#repeat-count')
  await select.scrollIntoViewIfNeeded()
  await expect(select).toHaveValue('1')

  // Célzás és kattintás a legördülőre: a natív lista helyett a saját menü nyílik meg
  const point = await aimAt(page, select)
  await page.waitForTimeout(250)
  await setHand(page, 'click', point)
  const menu = page.locator('[data-test="hand-select-menu"]')
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('option')).toHaveCount(await select.locator('option').count())
  await expect(menu.locator('[aria-selected="true"]')).toHaveAttribute('data-value', '1')

  // A menü egyik elemére célozva és kattintva az érték beáll, a menü bezárul
  const option = menu.locator('[data-value="3"]')
  const optionPoint = await aimAt(page, option)
  await page.waitForTimeout(250)
  await setHand(page, 'click', optionPoint)
  await expect(menu).toBeHidden()
  await expect(select).toHaveValue('3')
  // A v-model is megkapta: az új utasítás háromszoros ismétléssel kerül a sorba
  await page.locator('[data-direction="up"]').click()
  await expect(page.locator('.queue-item').first()).toContainText('3')

  // Újranyitva a menün kívülre kattintva bezárul, és az érték nem változik
  const again = await aimAt(page, select)
  await page.waitForTimeout(250)
  await setHand(page, 'click', again)
  await expect(menu).toBeVisible()
  await expect(menu.locator('[aria-selected="true"]')).toHaveAttribute('data-value', '3')
  await page.mouse.click(5, 300)
  await expect(menu).toBeHidden()
  await expect(select).toHaveValue('3')
})
