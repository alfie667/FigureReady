// Realistic UV–Vis absorption spectra for the UV–Vis template demo.
// 301 data points from 200 to 800 nm (2 nm step).
// Bands modelled as Gaussian components — physically appropriate for solution-phase
// Beer–Lambert absorption. Intensities are in absorbance units (a.u.).
//
// Sample A: UV-absorbing aromatic molecule
//   π→π* band at 265 nm (ε ≫ 10 000), weak n→π* shoulder at 310 nm
// Sample B: Porphyrin-like macrocycle
//   Soret band at 417 nm (very sharp, intense), Q-bands at 515 and 549 nm
//   Faint UV band at 250 nm
// Sample C: Charge-transfer organic dye (broad visible absorber)
//   Main band at 492 nm, blue shoulder at 395 nm, minor UV contribution

type Band = [number, number, number] // [center nm, FWHM nm, amplitude]

function gaussian(lam: number, lam0: number, fwhm: number, A: number): number {
  return A * Math.exp(-4 * Math.LN2 * (lam - lam0) ** 2 / (fwhm ** 2))
}

function computeSpectrum(lam: number, bands: Band[]): number {
  const raw = bands.reduce((sum, [c, w, a]) => sum + gaussian(lam, c, w, a), 0)
  return Number(Math.max(0, raw).toFixed(4))
}

// UV-absorbing aromatic — π→π* at 265 nm, n→π* shoulder at 310 nm
const SAMPLE_A: Band[] = [
  [265, 38, 1.25],
  [310, 28, 0.16],
]

// Porphyrin-like — Soret at 417 nm, Q-bands at 515 and 549 nm, UV at 250 nm
const SAMPLE_B: Band[] = [
  [250, 22, 0.30],
  [417, 16, 1.72],
  [515, 14, 0.09],
  [549, 13, 0.05],
]

// Charge-transfer dye — broad visible band at 492 nm, shoulder at 395 nm
const SAMPLE_C: Band[] = [
  [268, 30, 0.38],
  [395, 62, 0.22],
  [492, 88, 0.92],
]

// 301 points: 200, 202, 204, …, 800 nm
const WAVELENGTHS = Array.from({ length: 301 }, (_, i) => 200 + i * 2)

export const UVVIS_COLUMNS = ['Wavelength (nm)', 'Sample A', 'Sample B', 'Sample C']
export const UVVIS_X_COL   = 'Wavelength (nm)'
export const UVVIS_Y_COLS  = ['Sample A', 'Sample B', 'Sample C']

export const UVVIS_SAMPLE_ROWS: Record<string, unknown>[] = WAVELENGTHS.map(lam => ({
  'Wavelength (nm)': lam,
  'Sample A':        computeSpectrum(lam, SAMPLE_A),
  'Sample B':        computeSpectrum(lam, SAMPLE_B),
  'Sample C':        computeSpectrum(lam, SAMPLE_C),
}))
