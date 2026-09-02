// Molarity calculator — pure functions.
//
// Mode 1 (moles):  M = n / V
// Mode 2 (mass):   n = mass / molarMass  →  M = mass / (molarMass × V)
//
// All conversions use exact multipliers to SI base units (mol, g, L).

export type AmountUnit = 'mol' | 'mmol' | 'µmol'
export type MassUnit   = 'kg'  | 'g'   | 'mg'  | 'µg'
export type VolumeUnit = 'L'   | 'mL'  | 'µL'

export const AMOUNT_UNITS: AmountUnit[] = ['mol', 'mmol', 'µmol']
export const MASS_UNITS:   MassUnit[]   = ['kg', 'g', 'mg', 'µg']
export const VOLUME_UNITS: VolumeUnit[] = ['L', 'mL', 'µL']

const TO_MOL: Record<AmountUnit, number> = { mol: 1,    mmol: 1e-3, µmol: 1e-6 }
const TO_G:   Record<MassUnit,   number> = { kg: 1e3,  g: 1,       mg: 1e-3,  µg: 1e-6 }
const TO_L:   Record<VolumeUnit, number> = { L: 1,     mL: 1e-3,   µL: 1e-6  }

export interface MolarityFromMoles {
  mode:       'moles'
  amount:     number
  amountUnit: AmountUnit
  volume:     number
  volumeUnit: VolumeUnit
}

export interface MolarityFromMass {
  mode:       'mass'
  mass:       number
  massUnit:   MassUnit
  molarMass:  number      // g/mol
  volume:     number
  volumeUnit: VolumeUnit
}

export type MolarityInput = MolarityFromMoles | MolarityFromMass

export interface MolaritySuccess {
  ok:         true
  molarityM:  number      // canonical mol/L
  display:    string      // e.g. "0.1 M"
  secondary?: string      // e.g. "= 100 mM"
}

export interface MolarityFailure {
  ok:    false
  error: string
}

export type MolarityResult = MolaritySuccess | MolarityFailure

// ── Public API ────────────────────────────────────────────────────────────────

export function calcMolarity(input: MolarityInput): MolarityResult {
  // Volume (shared)
  const volErr = validate(input.volume, 'volume')
  if (volErr) return { ok: false, error: volErr }
  const vL = input.volume * TO_L[input.volumeUnit]

  let nMol: number

  if (input.mode === 'moles') {
    const err = validate(input.amount, 'amount')
    if (err) return { ok: false, error: err }
    nMol = input.amount * TO_MOL[input.amountUnit]
  } else {
    const massErr = validate(input.mass, 'mass')
    if (massErr) return { ok: false, error: massErr }
    const mmErr = validate(input.molarMass, 'molar mass')
    if (mmErr) return { ok: false, error: mmErr }
    nMol = (input.mass * TO_G[input.massUnit]) / input.molarMass
  }

  const M = nMol / vL
  if (!isFinite(M) || isNaN(M)) return { ok: false, error: 'Could not compute molarity — check your values.' }

  return { ok: true, molarityM: M, ...formatM(M) }
}

// ── Formatting ────────────────────────────────────────────────────────────────

function formatM(M: number): { display: string; secondary?: string } {
  if (M >= 1) {
    return { display: `${sf(M)} M` }
  }
  if (M >= 1e-3) {
    return { display: `${sf(M)} M`, secondary: `= ${sf(M * 1e3)} mM` }
  }
  if (M >= 1e-6) {
    return { display: `${sf(M * 1e6)} µM` }
  }
  return { display: `${sf(M * 1e6)} µM` }
}

// 4 significant figures, trailing zeros stripped
function sf(x: number): number {
  return parseFloat(x.toPrecision(4))
}

// ── Validation ────────────────────────────────────────────────────────────────

function validate(n: number, field: string): string | null {
  const cap = field.charAt(0).toUpperCase() + field.slice(1)
  if (isNaN(n) || !isFinite(n)) return `Enter a valid ${field}.`
  if (n <= 0) return `${cap} must be greater than zero.`
  return null
}
