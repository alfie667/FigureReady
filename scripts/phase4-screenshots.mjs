import { chromium } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, 'screenshots', 'phase4')
fs.mkdirSync(outDir, { recursive: true })

const BASE = 'http://localhost:3002'
const VP = { width: 1440, height: 900 }

;(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  })

  // Warm up
  {
    const ctx = await browser.newContext({ viewport: VP })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/app?demo=ftir`, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(2000)
    await ctx.close()
    console.log('Warm-up done')
  }

  // State 1: no data
  {
    const ctx = await browser.newContext({ viewport: VP })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/app`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(outDir, 'state1-empty.png') })
    console.log('State 1 done')
    await ctx.close()
  }

  // State 3: FTIR demo (figureConfigured=true)
  {
    const ctx = await browser.newContext({ viewport: VP })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/app?demo=ftir`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(4000)
    await page.screenshot({ path: path.join(outDir, 'state3-ready.png') })
    console.log('State 3 done')
    await ctx.close()
  }

  await browser.close()
  console.log('All done. Screenshots at:', outDir)
})().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
