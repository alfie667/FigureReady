// Dilution calculator — pure functions.
//
// Formula: C1 × V1 = C2 × V2  (solute amount is conserved)
//
// Solve for any one of the four variables given the other three.
//
// Concentration unit families (must not be mixed without molar mass):
//   Molar: M, mM, µM, nM           — base unit: mol/L (M)
//   Mass:  mg/mL, µg/mL, ng/mL    — base unit: mg/L
//
// Volume units: L, mL, µL, nL     — base unit: L

export type ConcUnit = 'M' | 'mM' | 'µM' | 'nM' | 'mg/mL' | 'µg/mL' | 'ng/mL'
export type VolUnit  = 'L' | 'mL' | 'µL' | 'nL'
export type SolveFor = 'C1' | 'V1' | 'C2' | 'V2'

export const MOLAR_CONC_UNITS: ConcUnit[] = ['M', 'mM', 'µM', 'nM']
export const MASS_CONC_UNITS:  ConcUnit[] = ['mg/mL', 'µg/mL', 'ng/mL']
export const ALL_CONC_UNITS:   ConcUnit[] = ['M', 'mM', 'µM', 'nM', 'mg/mL', 'µg/mL', 'ng/mL']
export const VOL_UNITS:        VolUnit[]  = ['L', 'mL', 'µL', 'nL']

// ── Unit multipliers to base units ─────────────────────────────────────────────
// Concentration → base:  value × multiplier = base-unit value
// Volume → L:            value × multiplier = litres

const TO_BASE_CONC: Record<ConcUnit, number> = {
  M:        1,
  mM:       1e-3,
  µM:       1e-6,
  nM:       1e-9,
  'mg/mL':  1e3,    // 1 mg/mL = 1000 mg/L
  'µg/mL':  1,      // 1 µg/mL = 1 mg/L
  'ng/mL':  1e-3,   // 1 ng/mL = 0.001 mg/L
}

const TO_L: Record<VolUnit, number> = {
  L:  1,
  mL: 1e-3,
  µL: 1e-6,
  nL: 1e-9,
}

// ── Public types ──────────────────────────────────────────────────────────────

export interface DilutionInput {
  solveFor: SolveFor
  C1: number; C1Unit: ConcUnit
  V1: number; V1Unit: VolUnit
  C2: number; C2Unit: ConcUnit
  V2: number; V2Unit: VolUnit
}

export interface DilutionSuccess {
  ok:          true
  value:       number  // result in the output unit
  unit:        string  // output unit string
  display:     string  // e.g. "10 mL"
  instruction: string  // lab-ready sentence
}

export interface DilutionFailure {
  ok:    false
  error: string
}

export type DilutionResult = DilutionSuccess | DilutionFailure

// ── Public API ────────────────────────────────────────────────────────────────

export function calcDilution(input: DilutionInput): DilutionResult {
  const { solveFor, C1, C1Unit, V1, V1Unit, C2, C2Unit, V2, V2Unit } = input

  // Concentration family check (C1 and C2 must be the same family)
  if (concFamily(C1Unit) !== concFamily(C2Unit)) {
    return {
      ok: false,
      error: `C1 (${C1Unit}) and C2 (${C2Unit}) use incompatible unit families. ` +
             `Converting between molar (M, mM, µM, nM) and mass concentration (mg/mL, µg/mL, ng/mL) requires molar mass — not supported here.`,
    }
  }

  // Validate the three known variables
  if (solveFor !== 'C1') { const e = validate(C1, 'stock concentration (C1)'); if (e) return { ok: false, error: e } }
  if (solveFor !== 'V1') { const e = validate(V1, 'stock volume (V1)');        if (e) return { ok: false, error: e } }
  if (solveFor !== 'C2') { const e = validate(C2, 'final concentration (C2)'); if (e) return { ok: false, error: e } }
  if (solveFor !== 'V2') { const e = validate(V2, 'final volume (V2)');        if (e) return { ok: false, error: e } }

  // Convert known values to base units
  const c1b = solveFor !== 'C1' ? C1 * TO_BASE_CONC[C1Unit] : 0
  const v1b = solveFor !== 'V1' ? V1 * TO_L[V1Unit]         : 0
  const c2b = solveFor !== 'C2' ? C2 * TO_BASE_CONC[C2Unit] : 0
  const v2b = solveFor !== 'V2' ? V2 * TO_L[V2Unit]         : 0

  // Solve C1V1 = C2V2
  let resultBase: number
  switch (solveFor) {
    case 'C1': resultBase = (c2b * v2b) / v1b; break
    case 'V1': resultBase = (c2b * v2b) / c1b; break
    case 'C2': resultBase = (c1b * v1b) / v2b; break
    case 'V2': resultBase = (c1b * v1b) / c2b; break
  }

  if (!isFinite(resultBase) || isNaN(resultBase) || resultBase <= 0) {
    return { ok: false, error: 'Could not compute — check that all values are valid and non-zero.' }
  }

  // Convert result from base units back to the user's chosen output unit
  const outUnit = solveFor === 'V1' ? V1Unit
                : solveFor === 'V2' ? V2Unit
                : solveFor === 'C1' ? C1Unit : C2Unit

  const value = (solveFor === 'V1' || solveFor === 'V2')
    ? resultBase / TO_L[outUnit as VolUnit]
    : resultBase / TO_BASE_CONC[outUnit as ConcUnit]

  const display = `${sf4(value)} ${outUnit}`
  const instruction = buildInstruction(solveFor, display, V2, V2Unit)

  return { ok: true, value, unit: outUnit, display, instruction }
}

// ── Instruction text ──────────────────────────────────────────────────────────

function buildInstruction(solveFor: SolveFor, display: string, V2: number, V2Unit: VolUnit): string {
  switch (solveFor) {
    case 'V1':
      return `Use ${display} of the stock solution and dilute to a final volume of ${sf4(V2)} ${V2Unit}.`
    case 'V2':
      return `Bring the solution to a final volume of ${display}.`
    case 'C2':
      return `The final concentration is ${display}.`
    case 'C1':
      return `The required stock concentration is ${display}.`
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function concFamily(u: ConcUnit): 'molar' | 'mass' {
  return (MOLAR_CONC_UNITS as string[]).includes(u) ? 'molar' : 'mass'
}

function validate(n: number, field: string): string | null {
  if (isNaN(n) || !isFinite(n)) return `Enter a valid ${field}.`
  if (n <= 0) return `${field.charAt(0).toUpperCase() + field.slice(1)} must be greater than zero.`
  return null
}

function sf4(x: number): number {
  return parseFloat(x.toPrecision(4))
}
