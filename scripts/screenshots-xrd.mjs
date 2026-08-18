/**
 * Captures 3 screenshots of auto-stacked XRD patterns (3, 7, 10 spectra).
 * Run after `npm run dev` is up.
 */
import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DEV_DIR = path.join(ROOT, 'public', 'dev')
const OUT_DIR = path.join(ROOT, 'scripts', 'screenshots')
const PORT = 3002

async function captureXRD(page, xlsxFile, label) {
  // Load app — use 'load' not 'networkidle' (HMR websocket prevents idle)
  await page.goto(`http://localhost:${PORT}/app`, { waitUntil: 'load', timeout: 30000 })
  await page.waitForTimeout(1500) // let React hydrate

  // Upload file — the file input is inside FileUploader (may need the label click)
  const fileInput = page.locator('input[type=file]')
  await fileInput.waitFor({ timeout: 15000 })
  await fileInput.setInputFiles(xlsxFile)

  // Wait for column checkboxes to appear
  await page.waitForSelector('input[type=checkbox]', { timeout: 15000 })
  await page.waitForTimeout(500)

  // Check ALL Y checkboxes
  const checkboxes = await page.locator('input[type=checkbox]').all()
  for (const cb of checkboxes) {
    const checked = await cb.isChecked()
    if (!checked) await cb.click()
  }
  await page.waitForTimeout(400)

  // Open Templates panel
  await page.locator('button[title="Templates"]').click()
  await page.waitForTimeout(400)

  // Open the My Templates dropdown
  await page.getByText('My Templates').first().click()
  await page.waitForTimeout(400)

  // Click the XRD built-in template
  await page.getByText('[DEV] Stacked XRD Patterns').click()
  await page.waitForTimeout(1000) // wait for chart to re-render with auto offsets

  // Screenshot
  const { default: fs } = await import('fs')
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const outPath = path.join(OUT_DIR, `xrd-auto-stacked-${label}.png`)
  await page.screenshot({ path: outPath, fullPage: false })
  console.log(`Saved: ${outPath}`)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  const cases = [
    { file: path.join(DEV_DIR, 'xrd-test-3.xlsx'),  label: '3-spectra'  },
    { file: path.join(DEV_DIR, 'xrd-test-7.xlsx'),  label: '7-spectra'  },
    { file: path.join(DEV_DIR, 'xrd-test-10.xlsx'), label: '10-spectra' },
  ]

  for (const { file, label } of cases) {
    console.log(`Capturing ${label}…`)
    try {
      await captureXRD(page, file, label)
    } catch (err) {
      console.error(`Failed for ${label}:`, err.message)
    }
  }

  await browser.close()
  console.log('Done.')
}

main().catch(console.error)
