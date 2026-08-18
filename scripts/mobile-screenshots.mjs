/**
 * Playwright screenshot script for Commit 2 mobile validation.
 * Run: node scripts/mobile-screenshots.mjs
 * Output: scripts/screenshots/
 */
import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'screenshots')
await mkdir(OUT, { recursive: true })

const BASE = 'http://localhost:3101'

const VIEWPORTS = [
  { name: '320x568',  width: 320,  height: 568 },
  { name: '375x667',  width: 375,  height: 667 },
  { name: '390x844',  width: 390,  height: 844 },
  { name: '412x915',  width: 412,  height: 915 },
]

const PANELS = ['data', 'style', 'journal', 'annotate']

// Tab bar button labels match SIDEBAR_TABS
const TAB_LABELS = {
  data:     'Data',
  style:    'Style',
  journal:  'Journal',
  annotate: 'Annotate',
}

async function shot(page, name) {
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false })
  console.log(`  ✓ ${name}.png`)
}

async function openPanel(page, panelId) {
  const label = TAB_LABELS[panelId]
  // Mobile nav has class "md:hidden" (`:` needs escaping in CSS) — click via JS
  // to bypass Playwright's visibility heuristic on fixed-positioned elements.
  await page.evaluate((lbl) => {
    // The mobile bottom nav is the one with md:hidden
    const navs = Array.from(document.querySelectorAll('nav'))
    const mobileNav = navs.find(n => n.classList.contains('md:hidden'))
    if (!mobileNav) { console.warn('mobile nav not found'); return }
    const btns = Array.from(mobileNav.querySelectorAll('button'))
    const btn = btns.find(b => b.textContent.trim().includes(lbl))
    if (btn) btn.click()
    else console.warn('tab button not found for', lbl)
  }, label)
  await page.waitForTimeout(600)
}

async function closePanel(page) {
  // Click the X close button in the mobile panel header
  const closeBtn = page.locator('[aria-label="Close"], button').filter({ hasText: '' })
    .locator('xpath=//div[contains(@class,"shrink-0") and contains(@class,"flex-col")]//button[last()]')
  // Simpler: click the first svg close button inside the panel
  const panelClose = page.locator('.md\\:hidden.shrink-0.flex-col button').last()
  try {
    await panelClose.click({ timeout: 1000 })
  } catch {
    // already closed
  }
  await page.waitForTimeout(300)
}

const browser = await chromium.launch({ headless: true })

// ─── 1. Sample data at each viewport (no panel) ──────────────────────────────
console.log('\n── Base screenshots (sample data, no panel) ──')
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/app?demo=1`, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(2000)
  await shot(page, `${vp.name}_base`)
  await ctx.close()
}

// ─── 2. Each panel open at 390×844 ───────────────────────────────────────────
console.log('\n── Panels open (390×844) ──')
for (const panelId of PANELS) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/app?demo=1`, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(1500)
  await openPanel(page, panelId)
  await shot(page, `390x844_panel_${panelId}`)
  await ctx.close()
}

// Also at 320×568 for the tightest viewport
console.log('\n── Panels open (320×568) ──')
for (const panelId of PANELS) {
  const ctx = await browser.newContext({ viewport: { width: 320, height: 568 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/app?demo=1`, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(1500)
  await openPanel(page, panelId)
  await shot(page, `320x568_panel_${panelId}`)
  await ctx.close()
}

// ─── 3. Panel open then closed (chart still visible) ─────────────────────────
console.log('\n── Panel open → closed (390×844) ──')
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/app?demo=1`, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(1500)
  await openPanel(page, 'style')
  await shot(page, '390x844_panel_style_open')

  // Close via the X button
  const xBtn = page.locator('div.md\\:hidden button svg path[d*="M6 18"]').locator('..')
    .locator('..')
  // Fallback: click close by finding the button in panel header
  const closeBtn = page.locator('text=Style').locator('..').locator('..').locator('button').last()
  try {
    await closeBtn.click()
  } catch {
    // click anywhere outside
    await page.mouse.click(195, 200)
  }
  await page.waitForTimeout(400)
  await shot(page, '390x844_panel_closed')
  await ctx.close()
}

// ─── 4. Landscape (simulated rotation) ───────────────────────────────────────
console.log('\n── Landscape rotation ──')
{
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/app?demo=1`, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(1500)
  await shot(page, '844x390_landscape')
  await ctx.close()
}

// ─── 5. Desktop reference (1440×900) ─────────────────────────────────────────
console.log('\n── Desktop reference ──')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/app?demo=1`, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(1500)
  await shot(page, '1440x900_desktop')
  await ctx.close()
}

// ─── 6. Multi-series: inject 4-series data via URL localStorage trick ─────
// We'll add Y columns by clicking the ColumnSelector; sample data has multiple columns.
// For now, capture the sample data default (which may already have multiple series).
console.log('\n── Multi-series check (375×667) ──')
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/app?demo=1`, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(1500)
  // Open data panel to see column selectors
  await openPanel(page, 'data')
  await shot(page, '375x667_data_panel_series')
  await ctx.close()
}

await browser.close()
console.log('\n✅ All screenshots saved to scripts/screenshots/')
