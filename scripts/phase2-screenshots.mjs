import { chromium } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, 'screenshots', 'phase2')
fs.mkdirSync(outDir, { recursive: true })

const BASE = 'http://localhost:3002'

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900',  width: 1440, height: 900  },
  { name: '1366x768',  width: 1366, height: 768  },
]

;(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  })

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await ctx.newPage()

    // Empty state
    await page.goto(`${BASE}/app`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outDir, `${vp.name}-empty.png`) })
    console.log(`${vp.name} empty state done`)

    // FTIR demo (data loaded)
    await page.goto(`${BASE}/app?demo=ftir`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(5000)
    await page.screenshot({ path: path.join(outDir, `${vp.name}-ftir.png`) })
    console.log(`${vp.name} FTIR demo done`)

    await ctx.close()
  }

  console.log('All done. Screenshots at:', outDir)
  await browser.close()
})().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
