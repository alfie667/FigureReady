// Generates realistic simulated photoluminescence (PL) emission spectra for DEV template validation.
// Data spans 350–750 nm at 2 nm resolution (201 points).
// Peaks are Gaussian bands — physically appropriate for homogeneous broadening in PL spectroscopy.
// Each emitter has distinct λmax, FWHM and intensity to cover the visible spectrum.

type Band = [number, number, number] // [center nm, FWHM nm, amplitude]

function gaussian(lam: number, lam0: number, fwhm: number, A: number): number {
  return A * Math.exp(-4 * Math.LN2 * (lam - lam0) ** 2 / (fwhm ** 2))
}

function computeSpectrum(lam: number, bands: Band[]): number {
  const raw = bands.reduce((sum, [c, w, a]) => sum + gaussian(lam, c, w, a), 0)
  return Number(Math.max(0, raw).toFixed(4))
}

// Carbon dots — broad blue emission with UV shoulder (excitonic state)
const CDOTS: Band[] = [
  [430, 78, 1.00],
  [388, 42, 0.16],
]

// CsPbBr₃ perovskite nanocrystals — hallmark narrow green band
const PEROVSKITE: Band[] = [
  [515, 24, 1.30],
]

// CdSe/ZnS core-shell QDs — orange emission with faint phonon replica
const CDSE_ZNS: Band[] = [
  [568, 38, 0.88],
  [612, 33, 0.17],
]

// Organic dye (Rhodamine B analog) — broad red emission with blue vibronic shoulder
const RHODAMINE: Band[] = [
  [622, 54, 0.72],
  [579, 36, 0.26],
]

// 201 points: 350, 352, 354, …, 750 nm
const WAVELENGTHS = Array.from({ length: 201 }, (_, i) => 350 + i * 2)

export const PL_COLUMNS = ['Wavelength (nm)', 'C-dots', 'Perovskite NC', 'CdSe/ZnS QDs', 'Rhodamine B']
export const PL_X_COL   = 'Wavelength (nm)'
export const PL_Y_COLS  = ['C-dots', 'Perovskite NC', 'CdSe/ZnS QDs', 'Rhodamine B']

export const PL_SAMPLE_ROWS: Record<string, unknown>[] = WAVELENGTHS.map(lam => ({
  'Wavelength (nm)': lam,
  'C-dots':          computeSpectrum(lam, CDOTS),
  'Perovskite NC':   computeSpectrum(lam, PEROVSKITE),
  'CdSe/ZnS QDs':   computeSpectrum(lam, CDSE_ZNS),
  'Rhodamine B':     computeSpectrum(lam, RHODAMINE),
}))
