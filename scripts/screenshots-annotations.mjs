/**
 * Validates annotation UX improvements:
 * 1. Free text + position presets in context bar
 * 2. Keyboard nudging (Arrow / Shift+Arrow)
 * 3. Peak label anchored to data point with leader line
 */
import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DEV_DIR = path.join(ROOT, 'public', 'dev')
const OUT_DIR = path.join(ROOT, 'scripts', 'screenshots')
const PORT = 3000

fs.mkdirSync(OUT_DIR, { recursive: true })

async function loadXRD(page, xlsxFile) {
  await page.goto(`http://localhost:${PORT}/app`, { waitUntil: 'load', timeout: 30000 })
  await page.waitForTimeout(2000)
  await page.locator('input[type=file]').setInputFiles(xlsxFile)
  await page.waitForSelector('input[type=checkbox]', { timeout: 10000 })
  await page.waitForTimeout(500)
  for (const cb of await page.locator('input[type=checkbox]').all()) {
    if (!await cb.isChecked()) await cb.click()
  }
  await page.waitForTimeout(300)
  await page.locator('button[title="Templates"]').click()
  await page.waitForTimeout(400)
  await page.getByText('My Templates').first().click()
  await page.waitForTimeout(400)
  await page.getByText('[DEV] Stacked XRD Patterns').click()
  await page.waitForTimeout(1500)
}

async function openAnnotate(page) {
  await page.locator('button[title="Annotate"]').click()
  await page.waitForTimeout(1500)
  // Wait for at least one "Add text" button to appear in DOM (force=true bypasses visibility)
  await page.waitForFunction(() =>
    document.querySelectorAll('button[title="Add text"]').length > 0, { timeout: 8000 }
  )
  await page.waitForTimeout(300)
}

async function clickAddText(page) {
  // Find the first visible "Add text" button (side panel or ChartPreview toolbar)
  const btns = await page.locator('button[title="Add text"]').all()
  for (const btn of btns) {
    const visible = await btn.isVisible()
    if (visible) { await btn.click(); return }
  }
  // Fallback: force-click the first one
  await page.locator('button[title="Add text"]').first().click({ force: true })
}

async function clickPeakLabel(page) {
  const btns = await page.locator('button[title="Add peak label (anchored to data point)"]').all()
  for (const btn of btns) {
    const visible = await btn.isVisible()
    if (visible) { await btn.click(); return }
  }
  await page.locator('button[title="Add peak label (anchored to data point)"]').first().click({ force: true })
}

async function capture(page, label) {
  const out = path.join(OUT_DIR, `annotation-${label}.png`)
  await page.screenshot({ path: out, fullPage: false })
  console.log(`  Saved: ${out}`)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  // ── Case 1: Free text + position presets ─────────────────────────────────
  console.log('Case 1: text annotation + position presets…')
  await loadXRD(page, path.join(DEV_DIR, 'xrd-test-3.xlsx'))
  await openAnnotate(page)

  await clickAddText(page)
  await page.waitForTimeout(600)
  await capture(page, '1a-text-added')

  // Select the text annotation (at 50% 50%)
  const textAnns = page.locator('.absolute.group.select-none')
  const count = await textAnns.count()
  console.log(`  Text annotation divs found: ${count}`)
  if (count > 0) {
    await textAnns.first().click({ force: true })
    await page.waitForTimeout(400)
  }
  await capture(page, '1b-text-selected')

  // Check if position presets appear in context bar
  const presetCount = await page.locator('button', { hasText: 'Top-right' }).count()
  console.log(`  Position preset buttons found: ${presetCount}`)

  const topRightBtn = page.locator('button').filter({ hasText: /^Top-right$/ })
  if (await topRightBtn.count() > 0) {
    await topRightBtn.first().click()
    await page.waitForTimeout(400)
    await capture(page, '1c-text-preset-top-right')
  } else {
    console.log('  Top-right preset not found')
    await capture(page, '1c-no-preset')
  }

  const bottomCenterBtn = page.locator('button').filter({ hasText: /^Bottom-center$/ })
  if (await bottomCenterBtn.count() > 0) {
    await bottomCenterBtn.first().click()
    await page.waitForTimeout(400)
    await capture(page, '1d-text-preset-bottom-center')
  }

  // ── Case 2: Keyboard nudging ──────────────────────────────────────────────
  console.log('Case 2: keyboard nudging…')
  // Ensure text is still selected
  const textAnns2 = page.locator('.absolute.group.select-none')
  if (await textAnns2.count() > 0) {
    await textAnns2.first().click({ force: true })
    await page.waitForTimeout(200)
  }
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(200)
  await capture(page, '2a-nudge-right-5px')

  await page.keyboard.press('Shift+ArrowUp')
  await page.waitForTimeout(200)
  await capture(page, '2b-nudge-up-10px')

  // ── Case 3: Peak label ───────────────────────────────────────────────────
  console.log('Case 3: peak label…')
  await loadXRD(page, path.join(DEV_DIR, 'xrd-test-3.xlsx'))
  await openAnnotate(page)

  await clickPeakLabel(page)
  await page.waitForTimeout(800)
  await capture(page, '3a-peak-label-added')

  // Find and click the peak label's draggable rect in the SVG
  const grabInfo = await page.evaluate(() => {
    const rects = document.querySelectorAll('svg rect')
    for (const r of rects) {
      const s = window.getComputedStyle(r)
      if (s.cursor === 'grab' || r.style.cursor === 'grab') {
        const b = r.getBoundingClientRect()
        return { x: b.x + b.width / 2, y: b.y + b.height / 2, found: true, w: b.width, h: b.height }
      }
    }
    return { found: false }
  })

  console.log(`  Peak label SVG rect:`, grabInfo)

  if (grabInfo.found) {
    await page.mouse.click(grabInfo.x, grabInfo.y)
    await page.waitForTimeout(400)
    await capture(page, '3b-peak-label-selected')

    // Check leader line toggle in context bar
    const leaderBtn = page.locator('button').filter({ hasText: /^Leader line$/ })
    if (await leaderBtn.count() > 0) {
      await leaderBtn.first().click()
      await page.waitForTimeout(300)
      await capture(page, '3c-peak-no-leader')
      await leaderBtn.first().click()
      await page.waitForTimeout(300)
      await capture(page, '3d-peak-with-leader')
    } else {
      console.log('  Leader line button not found in context bar')
    }

    // Arrow nudging for peak label
    await page.keyboard.press('Shift+ArrowLeft')
    await page.keyboard.press('Shift+ArrowLeft')
    await page.keyboard.press('Shift+ArrowUp')
    await page.waitForTimeout(300)
    await capture(page, '3e-peak-nudged')
  } else {
    console.log('  Peak label SVG rect not found — checking all SVG rects...')
    const allRects = await page.evaluate(() =>
      Array.from(document.querySelectorAll('svg rect')).map(r => ({
        cursor: r.style.cursor, fill: r.getAttribute('fill'),
        w: r.getBoundingClientRect().width, h: r.getBoundingClientRect().height,
      }))
    )
    console.log('  All SVG rects:', JSON.stringify(allRects.slice(0, 10)))
    await capture(page, '3-peak-not-found')
  }

  await browser.close()
  console.log('Done.')
}

main().catch(console.error)
