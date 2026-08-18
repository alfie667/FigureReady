// Generates:
//   1. public/templates/uv-vis-absorption.svg  (template card thumbnail)
//   2. public/dev/UVVis_Sample.xlsx            (demo Excel file)
//
// Band parameters are kept identical to lib/samples/uvvisSampleData.ts.

import * as XLSX from 'xlsx'
import { writeFileSync, mkdirSync } from 'fs'

const LN2 = Math.log(2)

function gaussian(lam, lam0, fwhm, A) {
  return A * Math.exp(-4 * LN2 * (lam - lam0) ** 2 / (fwhm ** 2))
}

function spectrum(lam, bands) {
  return Math.max(0, bands.reduce((s, [c, w, a]) => s + gaussian(lam, c, w, a), 0))
}

// ── Sample definitions (must match uvvisSampleData.ts) ────────────────────────
const SAMPLE_A = [[265, 38, 1.25], [310, 28, 0.16]]
const SAMPLE_B = [[250, 22, 0.30], [417, 16, 1.72], [515, 14, 0.09], [549, 13, 0.05]]
const SAMPLE_C = [[268, 30, 0.38], [395, 62, 0.22], [492, 88, 0.92]]

// ── Excel file ────────────────────────────────────────────────────────────────
const wavelengths = Array.from({ length: 301 }, (_, i) => 200 + i * 2)

const rows = wavelengths.map(lam => ({
  'Wavelength (nm)': lam,
  'Sample A': +spectrum(lam, SAMPLE_A).toFixed(4),
  'Sample B': +spectrum(lam, SAMPLE_B).toFixed(4),
  'Sample C': +spectrum(lam, SAMPLE_C).toFixed(4),
}))

const ws = XLSX.utils.json_to_sheet(rows)
ws['!cols'] = [{ wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 10 }]
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'UV-Vis Spectra')
mkdirSync('public/dev', { recursive: true })
const xlsxPath = 'public/dev/UVVis_Sample.xlsx'
writeFileSync(xlsxPath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
console.log(`✓ Written: ${xlsxPath}  (${rows.length} rows × 4 columns)`)

// ── SVG thumbnail ─────────────────────────────────────────────────────────────
// ViewBox: 0 0 700 500
// Plot area: left=70, right=660, top=40, bottom=450
// x: 200 nm → x=70,  800 nm → x=660  (range=600 nm → 590 px)
// y: 0.0 AU  → y=450, 2.0 AU → y=40   (range=2.0 AU → 410 px)

function toX(lam) { return 70 + (lam - 200) / 600 * 590 }
function toY(A)   { return 450 - Math.min(A, 2.0) / 2.0 * 410 }

// Dense sampling around narrow features (Soret at 417 nm, FWHM 16 nm)
const pts = new Set()
for (let lam = 200; lam <= 800; lam += 5) pts.add(lam)
// Exact peak positions for sharpness
for (const p of [250, 265, 310, 395, 413, 417, 421, 492, 515, 549]) pts.add(p)
const sampling = [...pts].sort((a, b) => a - b)

function makePoly(bands) {
  return sampling.map(lam => `${toX(lam).toFixed(1)},${toY(spectrum(lam, bands)).toFixed(1)}`).join(' ')
}

// X tick marks at 200, 300, 400, 500, 600, 700, 800 nm
const xTicks = [200, 300, 400, 500, 600, 700, 800]
// Y tick marks at 0, 0.5, 1.0, 1.5
const yTicks = [0, 0.5, 1.0, 1.5]

const tickLines = [
  ...xTicks.map(lam => {
    const x = toX(lam).toFixed(1)
    return `<line x1="${x}" y1="450" x2="${x}" y2="459" stroke="#111827" stroke-width="1.1"/>`
  }),
  ...yTicks.map(A => {
    const y = toY(A).toFixed(1)
    return `<line x1="62" y1="${y}" x2="70" y2="${y}" stroke="#111827" stroke-width="1.1"/>`
  }),
].join('\n  ')

const svg = `<svg viewBox="0 0 700 500" xmlns="http://www.w3.org/2000/svg">
  <rect width="700" height="500" fill="white"/>
  <line x1="70" y1="40" x2="70" y2="450" stroke="#111827" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="70" y1="450" x2="660" y2="450" stroke="#111827" stroke-width="1.5" stroke-linecap="round"/>
  ${tickLines}
  <polyline points="${makePoly(SAMPLE_A)}" fill="none" stroke="#2166ac" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/>
  <polyline points="${makePoly(SAMPLE_B)}" fill="none" stroke="#ca0020" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/>
  <polyline points="${makePoly(SAMPLE_C)}" fill="none" stroke="#1a9850" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/>
</svg>`

mkdirSync('public/templates', { recursive: true })
const svgPath = 'public/templates/uv-vis-absorption.svg'
writeFileSync(svgPath, svg)
console.log(`✓ Written: ${svgPath}`)
