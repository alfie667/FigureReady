import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await ctx.newPage()

const errs = []
const warns = []
page.on('console', msg => {
  if (msg.type() === 'error') errs.push(msg.text())
  if (msg.type() === 'warning') warns.push(msg.text())
})
page.on('pageerror', err => errs.push('[pageerror] ' + err.message))

await page.goto('http://localhost:3100/app?demo=1', { waitUntil: 'load' })
await page.waitForTimeout(3000)

console.log('=== ERRORS ===')
errs.forEach(e => console.log(e))
console.log('\n=== WARNINGS ===')
warns.slice(0, 10).forEach(w => console.log(w))

await browser.close()
