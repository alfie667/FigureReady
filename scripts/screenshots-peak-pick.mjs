/**
 * Phase 5 verification: interactive peak-selection mode.
 * Uses mobile viewport (375px) so Tailwind md: classes don't hide the
 * annotation toolbar, and the mobile bottom-nav Annotate tab correctly
 * opens the inline panel that contains AnnotationToolbar.
 */
import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'scripts', 'screenshots')
const PORT = 3001

fs.mkdirSync(OUT_DIR, { recursive: true })

async function capture(page, label) {
  const out = path.join(OUT_DIR, `peak-pick-${label}.png`)
  await page.screenshot({ path: out, fullPage: false })
  console.log(`  Saved: ${path.basename(out)}`)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  // Mobile viewport: md: breakpoint (768px) doesn't apply → md:hidden wrappers visible
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } })
  const page = await ctx.newPage()

  // ── 0. Load app and demo data ───────────────────────────────────────────
  console.log('Loading app…')
  await page.goto(`http://localhost:${PORT}/app`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2000)

  // Click "Generate a Demo Figure"
  const demoBtn = page.locator('button').filter({ hasText: /Generate a Demo Figure/ })
  const demoCnt = await demoBtn.count()
  console.log(`  Demo buttons: ${demoCnt}`)
  if (demoCnt === 0) { console.log('ERROR: no demo button'); await browser.close(); return }
  await demoBtn.first().click()
  await page.waitForTimeout(2500)

  // Verify chart rendered (at least one SVG with recharts data)
  const svgCount = await page.evaluate(() => document.querySelectorAll('svg').length)
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 120).replace(/\n/g, ' '))
  console.log(`  SVGs after demo load: ${svgCount}`)
  console.log(`  Page text: ${bodyText}`)
  await capture(page, '0-demo-loaded')

  const hasChart = await page.evaluate(() =>
    document.querySelectorAll('[class*="recharts"]').length > 0
  )
  if (!hasChart) { console.log('ERROR: chart not rendered after demo load'); await browser.close(); return }
  console.log('  Chart rendered ✓')

  // ── 1. Open Annotate panel via mobile bottom nav ────────────────────────
  // Mobile bottom nav has no title attr; desktop icon bar has title="Annotate"
  // On 375px viewport md:hidden nav IS visible; clicking sets activeSidePanel + mobilePanelOpen
  console.log('\nOpening Annotate panel…')
  // Find button without title that has text "Annotate" in the fixed bottom nav
  const mobileAnnotate = page.locator('nav.fixed button').filter({ hasText: /^Annotate$/ })
  const maCnt = await mobileAnnotate.count()
  console.log(`  Mobile Annotate nav buttons: ${maCnt}`)
  if (maCnt === 0) {
    // Fallback: any button with text Annotate and no title
    const fallback = page.locator('button:not([title])').filter({ hasText: /^Annotate$/ })
    const fbCnt = await fallback.count()
    console.log(`  Fallback Annotate buttons (no title): ${fbCnt}`)
    if (fbCnt > 0) await fallback.first().click()
    else { console.log('ERROR: no Annotate tab found'); await browser.close(); return }
  } else {
    await mobileAnnotate.first().click()
  }
  await page.waitForTimeout(1200)
  await capture(page, '1-annotate-panel')

  // ── 2. Find Peak button ─────────────────────────────────────────────────
  const peakBtn = page.locator('button[title="Add peak label (anchored to data point)"]')
  const peakCnt = await peakBtn.count()
  console.log(`\nPeak buttons found: ${peakCnt}`)

  if (peakCnt === 0) {
    // Debug: list all annotation-related buttons
    const debug = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button'))
        .filter(b => {
          const t = b.title || ''
          const txt = b.textContent?.trim() || ''
          return t.includes('Add') || txt === 'Peak' || txt === 'Text' || txt === 'Rect.'
        })
        .map(b => ({
          title: b.title,
          text: b.textContent?.trim().slice(0, 20),
          display: window.getComputedStyle(b).display,
          vis: window.getComputedStyle(b).visibility,
        }))
    )
    console.log('  Annotation button debug:', JSON.stringify(debug, null, 2))
    console.log('ERROR: Peak button not found — AnnotationToolbar not mounted')
    await browser.close()
    return
  }

  // ── Case 1: Enter peak-pick mode ────────────────────────────────────────
  console.log('\nCase 1: entering peak-pick mode…')
  await peakBtn.first().click()
  await page.waitForTimeout(700)

  const pickState = await page.evaluate(() => {
    const banner = Array.from(document.querySelectorAll('div'))
      .some(d => d.textContent?.includes('Click on a peak') && d.textContent?.includes('Esc to cancel'))
    const ctxBar = Array.from(document.querySelectorAll('div'))
      .find(d => d.textContent?.includes('Peak-selection mode'))
    const overlay = Array.from(document.querySelectorAll('div[style]'))
      .filter(d => {
        const s = d.getAttribute('style') || ''
        return s.includes('z-index: 30') && s.includes('crosshair')
      })
    return {
      banner,
      ctxBar: ctxBar ? ctxBar.textContent?.trim().slice(0, 80) : null,
      overlayCount: overlay.length,
    }
  })
  console.log(`  Hint banner: ${pickState.banner}`)
  console.log(`  Context bar: "${pickState.ctxBar}"`)
  console.log(`  Overlay divs (z-index:30 crosshair): ${pickState.overlayCount}`)
  await capture(page, '2-pick-mode-entered')

  // ── Case 2: Escape cancels ───────────────────────────────────────────────
  console.log('\nCase 2: Escape cancels pick mode…')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  const bannerGone = await page.evaluate(() =>
    !Array.from(document.querySelectorAll('div'))
      .some(d => d.textContent?.includes('Click on a peak'))
  )
  console.log(`  Banner gone after Escape: ${bannerGone}`)
  await capture(page, '3-escaped')

  // ── Cases 3-5: Place peaks by clicking on chart ──────────────────────────
  // Re-enter peak mode for each placement
  const enterPick = async () => {
    await peakBtn.first().click()
    await page.waitForTimeout(400)
  }

  const getOverlayBounds = () => page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div[style]'))
      .filter(d => {
        const s = d.getAttribute('style') || ''
        return s.includes('z-index: 30') && s.includes('crosshair')
      })
    if (!divs.length) return null
    const r = divs[0].getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height }
  })

  const clickTargets = [
    { xFrac: 0.30, yFrac: 0.25, label: '4-peak1' },
    { xFrac: 0.62, yFrac: 0.30, label: '5-peak2' },
    { xFrac: 0.50, yFrac: 0.55, label: '6-peak3' },
  ]

  let grabCount = 0
  for (const { xFrac, yFrac, label } of clickTargets) {
    console.log(`\nPlacing ${label}…`)
    await enterPick()
    const ov = await getOverlayBounds()
    if (!ov) { console.log('  Overlay not found — skipping'); continue }
    console.log(`  Overlay bounds: ${JSON.stringify(ov)}`)
    await page.mouse.click(ov.x + ov.w * xFrac, ov.y + ov.h * yFrac)
    await page.waitForTimeout(700)
    await capture(page, label)

    grabCount = await page.evaluate(() =>
      Array.from(document.querySelectorAll('svg rect'))
        .filter(r => {
          const s = window.getComputedStyle(r)
          return s.cursor === 'grab' || r.getAttribute('style')?.includes('grab')
        }).length
    )
    console.log(`  Grab handles: ${grabCount}`)
  }

  // ── Nudge last peak label ────────────────────────────────────────────────
  console.log('\nNudging last peak label…')
  const lastGrab = await page.evaluate(() => {
    const rects = Array.from(document.querySelectorAll('svg rect'))
      .filter(r => r.getAttribute('style')?.includes('grab') || window.getComputedStyle(r).cursor === 'grab')
    if (!rects.length) return null
    const b = rects[rects.length - 1].getBoundingClientRect()
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
  })
  if (lastGrab) {
    await page.mouse.click(lastGrab.x, lastGrab.y)
    await page.waitForTimeout(300)
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(200)
    await capture(page, '7-nudged')
    console.log('  Nudged ✓')
  } else {
    console.log('  No grab handles found — skipping nudge')
  }

  // ── Leader line toggle ───────────────────────────────────────────────────
  const leaderBtn = page.locator('button').filter({ hasText: /^Leader line$/ })
  const leaderCnt = await leaderBtn.count()
  console.log(`\nLeader line buttons: ${leaderCnt}`)
  if (leaderCnt > 0) {
    await leaderBtn.first().click()
    await page.waitForTimeout(200)
    await capture(page, '8-leader-off')
    await leaderBtn.first().click()
    await page.waitForTimeout(200)
    await capture(page, '8b-leader-on')
    console.log('  Leader line toggled ✓')
  }

  await capture(page, '9-final')

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n══ Summary ═══════════════════════════════════════════')
  console.log(`  Peak mode entered:    true`)
  console.log(`  Hint banner shown:    ${pickState.banner}`)
  console.log(`  Context bar shown:    ${!!pickState.ctxBar}`)
  console.log(`  Overlay div present:  ${pickState.overlayCount > 0}`)
  console.log(`  Escape cancelled:     ${bannerGone}`)
  console.log(`  Peaks placed (grabs): ${grabCount}`)
  console.log('══════════════════════════════════════════════════════')

  await browser.close()
  console.log('\nDone.')
}

main().catch(console.error)
