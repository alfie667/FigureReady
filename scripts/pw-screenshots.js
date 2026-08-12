const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, '..', 'scripts', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  // 1. Desktop gallery
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/templates', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: path.join(outDir, '1-gallery-desktop.png'), fullPage: true });
  console.log('Screenshot 1: gallery desktop');

  // 2. Column mapping modal
  await page.click('button:has-text("Use template")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, '2-mapping-modal.png') });
  console.log('Screenshot 2: mapping modal');

  // 3. Mobile gallery
  const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto('http://localhost:3000/templates', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.screenshot({ path: path.join(outDir, '3-gallery-mobile.png'), fullPage: true });
  console.log('Screenshot 3: gallery mobile');

  // 4. /app editor
  const appPage = await ctx.newPage();
  await appPage.goto('http://localhost:3000/app', { waitUntil: 'networkidle', timeout: 30000 });
  await appPage.screenshot({ path: path.join(outDir, '4-app-editor.png') });
  console.log('Screenshot 4: app editor');

  console.log('Done. Screenshots at:', outDir);
  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
