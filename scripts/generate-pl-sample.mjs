// Generates public/samples/PL_Spectra_Sample.xlsx from the same formulas as plSampleData.ts
import * as XLSX from 'xlsx'
import { writeFileSync, mkdirSync } from 'fs'

function gaussian(lam, lam0, fwhm, A) {
  return A * Math.exp(-4 * Math.LN2 * (lam - lam0) ** 2 / (fwhm ** 2))
}

function spectrum(lam, bands) {
  const raw = bands.reduce((sum, [c, w, a]) => sum + gaussian(lam, c, w, a), 0)
  return +Math.max(0, raw).toFixed(4)
}

const CDOTS      = [[430, 78, 1.00], [388, 42, 0.16]]
const PEROVSKITE = [[515, 24, 1.30]]
const CDSE_ZNS   = [[568, 38, 0.88], [612, 33, 0.17]]
const RHODAMINE  = [[622, 54, 0.72], [579, 36, 0.26]]

const wavelengths = Array.from({ length: 201 }, (_, i) => 350 + i * 2)

const rows = wavelengths.map(lam => ({
  'Wavelength (nm)': lam,
  'C-dots':          spectrum(lam, CDOTS),
  'Perovskite NC':   spectrum(lam, PEROVSKITE),
  'CdSe/ZnS QDs':   spectrum(lam, CDSE_ZNS),
  'Rhodamine B':     spectrum(lam, RHODAMINE),
}))

const ws = XLSX.utils.json_to_sheet(rows)

// Column widths
ws['!cols'] = [
  { wch: 18 }, // Wavelength (nm)
  { wch: 10 }, // C-dots
  { wch: 14 }, // Perovskite NC
  { wch: 14 }, // CdSe/ZnS QDs
  { wch: 14 }, // Rhodamine B
]

const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'PL Spectra')

mkdirSync('public/dev', { recursive: true })
const outPath = 'public/dev/PL_Spectra_Sample.xlsx'
writeFileSync(outPath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
console.log(`✓ Written: ${outPath}  (${rows.length} rows × 5 columns)`)
