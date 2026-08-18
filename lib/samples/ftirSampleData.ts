// Generates realistic simulated FTIR absorbance spectra for DEV template validation.
// Data is stored in ascending wavenumber order (500 → 4000 cm⁻¹).
// Axis reversal (4000 → 500 display convention) is a pure display property
// handled by xReversed: true — the raw numbers are never reversed or reordered.

type Band = [number, number, number] // [center cm⁻¹, FWHM cm⁻¹, peak absorbance]

function lorentz(x: number, x0: number, fwhm: number, A: number): number {
  const g = fwhm / 2
  return A * g * g / ((x - x0) ** 2 + g * g)
}

function computeSpectrum(wn: number, bands: Band[]): number {
  const raw = bands.reduce((sum, [c, w, a]) => sum + lorentz(wn, c, w, a), 0)
  return Number(Math.max(0, raw).toFixed(4))
}

// Stearic acid — saturated C18 fatty acid
// Key bands: broad acid O-H (2500–3300), CH₂ stretches, sharp C=O at 1712, CH₂ rocking
const STEARIC_ACID: Band[] = [
  [2918, 25, 0.92], [2850, 20, 0.76],   // C-H antisym / sym stretch
  [2650, 350, 0.18], [2900, 420, 0.14],  // broad acid O-H (carboxyl dimer)
  [1712, 22, 1.40],                       // C=O stretch (carboxylic acid)
  [1472, 18, 0.55], [1378, 16, 0.30],    // CH₂ scissor / CH₃ umbrella
  [1300, 40, 0.44], [1176, 30, 0.50],    // C-O-H bending / C-O stretch
  [722,  12, 0.42],                       // CH₂ rocking
]

// Nylon 6 — semicrystalline polyamide
// Key bands: N-H at 3297, Amide I at 1637 (C=O), Amide II at 1540 (N-H + C-N)
const NYLON6: Band[] = [
  [3297, 70, 0.95],                       // N-H stretch
  [2927, 28, 0.40], [2855, 22, 0.30],    // C-H antisym / sym stretch
  [1637, 32, 1.50],                       // Amide I (C=O stretch)
  [1540, 26, 1.10],                       // Amide II (N-H bend + C-N stretch)
  [1466, 18, 0.40],                       // CH₂ scissor
  [1265, 28, 0.45], [1196, 20, 0.35],    // Amide III / CH₂ wagging
  [690,  80, 0.50],                       // N-H out-of-plane (Amide V)
]

// Polystyrene — aromatic polymer reference standard
// Key bands: aromatic C-H cluster 3000–3100, monosubstituted pattern 698+759
const POLYSTYRENE: Band[] = [
  [3082, 15, 0.45], [3060, 14, 0.55], [3025, 16, 0.65], // aromatic =C-H stretch
  [2924, 22, 0.35], [2851, 18, 0.25],                    // aliphatic C-H stretch
  [1601, 14, 0.75], [1583, 12, 0.35],                    // C=C ring stretch
  [1492, 12, 0.72], [1453, 14, 0.50],                    // C=C ring / CH₂ scissor
  [1073, 16, 0.30], [1028, 12, 0.30],                    // aromatic C-H in-plane
  [759,  12, 1.10], [698,  10, 0.95],                    // C-H o.o.p. (monosubst. pattern)
]

// PEG 400 — polyethylene glycol
// Key bands: broad O-H at 3462, strong C-O-C at 1113
const PEG: Band[] = [
  [3462, 220, 0.55],                      // O-H stretch (broad, terminal)
  [2879,  25, 0.85], [2860, 20, 0.65],   // C-H antisym / sym stretch
  [1468,  18, 0.45], [1360, 20, 0.30],   // CH₂ scissor / wagging
  [1279,  18, 0.38],                      // CH₂ twisting
  [1113,  65, 1.35],                      // C-O-C stretch (dominant, broad)
  [960,   28, 0.42],                      // C-O-C secondary
  [843,   18, 0.30],                      // CH₂ rocking
]

// 351 data points: 500, 510, 520, …, 4000 cm⁻¹  (step = 10 cm⁻¹)
const WAVENUMBERS = Array.from({ length: 351 }, (_, i) => 500 + i * 10)

export const FTIR_COLUMNS = ['Wavenumber (cm-1)', 'Stearic Acid', 'Nylon 6', 'Polystyrene', 'PEG']
export const FTIR_X_COL = 'Wavenumber (cm-1)'
export const FTIR_Y_COLS = ['Stearic Acid', 'Nylon 6', 'Polystyrene', 'PEG']

export const FTIR_SAMPLE_ROWS: Record<string, unknown>[] = WAVENUMBERS.map(wn => ({
  'Wavenumber (cm-1)': wn,
  'Stearic Acid': computeSpectrum(wn, STEARIC_ACID),
  'Nylon 6':      computeSpectrum(wn, NYLON6),
  'Polystyrene':  computeSpectrum(wn, POLYSTYRENE),
  'PEG':          computeSpectrum(wn, PEG),
}))
