/**
 * Captures 4 legend positioning screenshots.
 */
import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DEV_DIR = path.join(ROOT, 'public', 'dev')
const OUT_DIR = path.join(ROOT, 'scripts', 'screenshots')
const PORT = 3002

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

  // Apply XRD template (Templates panel opens)
  await page.locator('button[title="Templates"]').click()
  await page.waitForTimeout(400)
  await page.getByText('My Templates').first().click()
  await page.waitForTimeout(400)
  await page.getByText('[DEV] Stacked XRD Patterns').click()
  await page.waitForTimeout(1200)

  // Switch to Style panel (after loadXRD, Templates panel is open)
  await page.locator('button[title="Style"]').click()
  await page.waitForTimeout(800)
  // Wait until a select with the position options is in the DOM
  await page.waitForFunction(() => {
    const selects = Array.from(document.querySelectorAll('select'))
    return selects.some(s => Array.from(s.options).some(o => o.text.includes('Top left')))
  }, { timeout: 8000 })
  await page.waitForTimeout(300)
}

// Find the legend position select: the one that has a 'top-left' option
async function positionSelect(page) {
  const selects = await page.locator('select').all()
  for (const sel of selects) {
    const opts = await sel.locator('option').allTextContents()
    if (opts.some(o => o.includes('Top left'))) return sel
  }
  return null
}

async function setLegendPosition(page, position) {
  const sel = await positionSelect(page)
  if (!sel) { console.warn('  Position select not found'); return }
  await sel.selectOption(position)
  await page.waitForTimeout(800)
}

async function setLegendModeInline(page) {
  const btn = page.getByRole('button', { name: 'Right-edge labels' })
  await btn.waitFor({ timeout: 5000 })
  await btn.first().click()
  await page.waitForTimeout(800)
}

async function capture(page, label) {
  const outPath = path.join(OUT_DIR, `legend-${label}.png`)
  await page.screenshot({ path: outPath, fullPage: false })
  console.log(`  Saved: ${outPath}`)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  console.log('top-left…')
  await loadXRD(page, path.join(DEV_DIR, 'xrd-test-3.xlsx'))
  await setLegendPosition(page, 'top-left')
  await capture(page, 'top-left')

  console.log('top-right…')
  await loadXRD(page, path.join(DEV_DIR, 'xrd-test-3.xlsx'))
  await setLegendPosition(page, 'top-right')
  await capture(page, 'top-right')

  console.log('outside-right…')
  await loadXRD(page, path.join(DEV_DIR, 'xrd-test-3.xlsx'))
  await setLegendPosition(page, 'outside-right')
  await capture(page, 'outside-right')

  console.log('7-spectra inline labels…')
  await loadXRD(page, path.join(DEV_DIR, 'xrd-test-7.xlsx'))
  await setLegendModeInline(page)
  await capture(page, '7-spectra-inline')

  await browser.close()
  console.log('Done.')
}

main().catch(console.error)
