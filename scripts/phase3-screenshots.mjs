import { chromium } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, 'screenshots', 'phase3')
fs.mkdirSync(outDir, { recursive: true })

const BASE = 'http://localhost:3002'

;(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  })

  // Warm up: load the page once so Next.js compiles all chunks before screenshots
  {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/app?demo=ftir`, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(3000)
    await ctx.close()
    console.log('Warm-up done')
  }

  const viewports = [
    { name: '1920x1080', width: 1920, height: 1080 },
    { name: '1440x900',  width: 1440, height: 900  },
    { name: '1366x768',  width: 1366, height: 768  },
  ]

  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await ctx.newPage()

    // FTIR demo with data loaded
    await page.goto(`${BASE}/app?demo=ftir`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(4000)
    await page.screenshot({ path: path.join(outDir, `${vp.name}-ftir.png`) })
    console.log(`${vp.name} FTIR done`)

    // At 1366 also show with RightInspector collapsed
    if (vp.width === 1366) {
      // Click the collapse chevron in the RightInspector tab bar
      try {
        const collapseBtn = page.locator('aside.w-\\[272px\\] button[title="Collapse inspector"]')
        if (await collapseBtn.count() > 0) {
          await collapseBtn.click()
          await page.waitForTimeout(400)
          await page.screenshot({ path: path.join(outDir, `${vp.name}-ftir-collapsed.png`) })
          console.log(`${vp.name} collapsed done`)
        }
      } catch { console.log('collapse button not found, skipping') }
    }

    await ctx.close()
  }

  console.log('All done. Screenshots at:', outDir)
  await browser.close()
})().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
