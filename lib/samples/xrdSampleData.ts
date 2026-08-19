// Simulated XRD powder diffraction patterns — DEMO DATA ONLY.
// Generated programmatically from Lorentzian peak profiles.
// Peak positions match published reference values (JCPDS cards).
// NOT real experimental data. NOT for citation or publication.
//
// TiO₂ Anatase   — JCPDS 21-1272 — tetragonal I41/amd
// ZnO Wurtzite   — JCPDS 36-1451 — hexagonal P63mc
// Fe₂O₃ Hematite — JCPDS 33-0664 — rhombohedral R-3c

export const XRD_X_COL = '2θ (°)'
export const XRD_Y_COLS = ['TiO₂ Anatase', 'ZnO Wurtzite', 'Fe₂O₃ Hematite']
export const XRD_COLUMNS = [XRD_X_COL, ...XRD_Y_COLS]

type Peak = [number, number, number]  // [2θ°, FWHM°, relative_intensity]

function lorentz(x: number, x0: number, fwhm: number, I: number): number {
  const g = fwhm / 2
  return I * g * g / ((x - x0) ** 2 + g * g)
}

function background(x: number): number {
  return 22 * Math.exp(-0.015 * (x - 10)) + 8
}

// Deterministic pseudo-noise — reproducible across renders
function noise(x: number): number {
  return 1.8 * Math.sin(x * 193.7 + 0.4) * Math.cos(x * 87.3) * Math.sin(x * 41.9 + 1.2)
}

const TIO2: Peak[] = [
  [25.30, 0.40, 1000],
  [37.98, 0.45,  200],
  [38.58, 0.45,  175],
  [48.02, 0.50,  350],
  [53.94, 0.50,  200],
  [55.10, 0.50,  120],
  [62.72, 0.55,  190],
  [68.80, 0.55,  150],
  [70.34, 0.55,  115],
  [75.14, 0.60,   90],
]

const ZNO: Peak[] = [
  [31.77, 0.35,  570],
  [34.42, 0.35,  440],
  [36.25, 0.35, 1000],
  [47.54, 0.40,  220],
  [56.60, 0.45,  320],
  [62.86, 0.50,  285],
  [66.38, 0.50,   75],
  [67.96, 0.50,  235],
  [69.10, 0.50,  200],
  [72.56, 0.55,   80],
]

const FE2O3: Peak[] = [
  [24.14, 0.40,  460],
  [33.15, 0.40, 1000],
  [35.61, 0.40,  780],
  [40.86, 0.45,  260],
  [49.48, 0.50,  440],
  [54.09, 0.50,  365],
  [57.60, 0.50,  140],
  [62.45, 0.55,  440],
  [64.00, 0.55,  200],
  [71.95, 0.60,  160],
]

function pattern(x: number, peaks: Peak[]): number {
  let y = background(x) + noise(x)
  for (const [x0, fwhm, I] of peaks) y += lorentz(x, x0, fwhm, I)
  return Math.max(0, y)
}

const TWO_THETA = Array.from({ length: 701 }, (_, i) => 10 + i * 0.1)

export const XRD_SAMPLE_ROWS: Record<string, unknown>[] = TWO_THETA.map(x => ({
  [XRD_X_COL]:        parseFloat(x.toFixed(1)),
  'TiO₂ Anatase':    parseFloat(pattern(x, TIO2).toFixed(1)),
  'ZnO Wurtzite':    parseFloat(pattern(x, ZNO).toFixed(1)),
  'Fe₂O₃ Hematite': parseFloat(pattern(x, FE2O3).toFixed(1)),
}))
