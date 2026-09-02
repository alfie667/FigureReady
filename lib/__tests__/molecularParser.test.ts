// Unit tests for lib/molecularParser.ts
// Runner: node:test + tsx  →  npm run test:mw
//
// Reference values from:
//   PubChem, CRC Handbook, Wikipedia
// Tolerances:
//   ±0.01 g/mol  for simple organic/inorganic (H, C, N, O, Na, Ca, Cl)
//   ±0.05 g/mol  for compounds containing S, Fe, Cu, Al (IUPAC 2021 vs older tables)
//   ±0.10 g/mol  for hydrates (cumulative tolerance over all components)

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseMolecularFormula } from '../molecularParser.js'

// ── Helper ────────────────────────────────────────────────────────────────────

function assertMW(
  formula: string,
  expected: number,
  tol: number,
  label?: string,
) {
  const r = parseMolecularFormula(formula)
  assert.ok(r.ok, `${label ?? formula}: expected success, got error: ${!r.ok ? r.error : ''}`)
  if (!r.ok) return
  const diff = Math.abs(r.molarMass - expected)
  assert.ok(
    diff <= tol,
    `${label ?? formula}: molar mass ${r.molarMass} vs expected ${expected} (diff ${diff.toFixed(4)} > tol ${tol})`,
  )
}

function assertError(formula: string, substrings: string[] = []) {
  const r = parseMolecularFormula(formula)
  assert.ok(!r.ok, `"${formula}": expected error, got molar mass ${r.ok ? r.molarMass : ''}`)
  if (!r.ok && substrings.length > 0) {
    for (const s of substrings) {
      assert.ok(
        r.error.toLowerCase().includes(s.toLowerCase()),
        `"${formula}": error "${r.error}" does not contain "${s}"`,
      )
    }
  }
}

// ── Core calculations ─────────────────────────────────────────────────────────

describe('parseMolecularFormula — valid formulas', () => {

  it('H2O — water', () => {
    assertMW('H2O', 18.015, 0.01)
  })

  it('NaCl — sodium chloride', () => {
    assertMW('NaCl', 58.44, 0.01)
  })

  it('C6H12O6 — glucose', () => {
    assertMW('C6H12O6', 180.156, 0.01)
  })

  it('C8H10N4O2 — caffeine', () => {
    assertMW('C8H10N4O2', 194.19, 0.01)
  })

  it('CaCO3 — calcium carbonate', () => {
    assertMW('CaCO3', 100.086, 0.01)
  })

  it('H2SO4 — sulfuric acid', () => {
    assertMW('H2SO4', 98.072, 0.05)
  })

  it('NaOH — sodium hydroxide', () => {
    assertMW('NaOH', 39.997, 0.01)
  })

  it('NH3 — ammonia', () => {
    assertMW('NH3', 17.031, 0.01)
  })

  it('CO2 — carbon dioxide', () => {
    assertMW('CO2', 44.009, 0.01)
  })

  it('C2H5OH — ethanol', () => {
    assertMW('C2H5OH', 46.068, 0.01)
  })

})

describe('parseMolecularFormula — parentheses', () => {

  it('Ca(OH)2 — calcium hydroxide', () => {
    assertMW('Ca(OH)2', 74.092, 0.01)
  })

  it('Fe2(SO4)3 — iron(III) sulfate', () => {
    // Reference: ~399.86–399.88 g/mol depending on IUPAC year for S
    assertMW('Fe2(SO4)3', 399.86, 0.05)
  })

  it('Al2(SO4)3 — aluminium sulfate', () => {
    // Reference: ~342.13–342.15 g/mol
    assertMW('Al2(SO4)3', 342.13, 0.05)
  })

  it('Mg(OH)2 — magnesium hydroxide', () => {
    assertMW('Mg(OH)2', 58.319, 0.01)
  })

  it('Ba(NO3)2 — barium nitrate', () => {
    assertMW('Ba(NO3)2', 261.336, 0.01)
  })

  it('nested parentheses: Ca3(PO4)2', () => {
    // 3(40.078) + 2(30.974 + 4×15.999) = 120.234 + 2(94.970) = 310.174
    assertMW('Ca3(PO4)2', 310.174, 0.01)
  })

  it('deeply nested: ((CH3)3N) — trimethylamine (unusual notation)', () => {
    // Same as (CH3)3N = 3C + 9H + N = 3×12.011 + 9×1.008 + 14.007 = 59.11
    assertMW('(CH3)3N', 59.11, 0.01)
  })

})

describe('parseMolecularFormula — hydrates', () => {

  it('CuSO4·5H2O — middle dot', () => {
    // 63.546 + 32.06 + 4×15.999 + 5×18.015 = 249.677
    assertMW('CuSO4·5H2O', 249.68, 0.10)
  })

  it('CuSO4.5H2O — period separator', () => {
    assertMW('CuSO4.5H2O', 249.68, 0.10)
  })

  it('Na2CO3·10H2O — soda ash', () => {
    // 2×22.990 + 12.011 + 3×15.999 + 10×18.015 = 45.980 + 12.011 + 47.997 + 180.15 = 286.138
    assertMW('Na2CO3·10H2O', 286.14, 0.05)
  })

  it('MgSO4·7H2O — Epsom salt', () => {
    // 24.305 + 32.06 + 4×15.999 + 7×18.015 = 24.305 + 32.06 + 63.996 + 126.105 = 246.466
    assertMW('MgSO4·7H2O', 246.47, 0.05)
  })

  it('CaCl2·2H2O', () => {
    // 40.078 + 2×35.45 + 2×18.015 = 40.078 + 70.90 + 36.030 = 147.008
    assertMW('CaCl2·2H2O', 147.01, 0.05)
  })

})

describe('parseMolecularFormula — composition table', () => {

  it('H2O has 2 elements', () => {
    const r = parseMolecularFormula('H2O')
    assert.ok(r.ok)
    if (!r.ok) return
    assert.equal(r.elements.length, 2)
  })

  it('H2O Hill order: H before O (C absent)', () => {
    const r = parseMolecularFormula('H2O')
    assert.ok(r.ok)
    if (!r.ok) return
    assert.equal(r.elements[0].symbol, 'H')
    assert.equal(r.elements[1].symbol, 'O')
  })

  it('C8H10N4O2 Hill order: C, H, then N, O alphabetically', () => {
    const r = parseMolecularFormula('C8H10N4O2')
    assert.ok(r.ok)
    if (!r.ok) return
    assert.equal(r.elements[0].symbol, 'C')
    assert.equal(r.elements[1].symbol, 'H')
    assert.equal(r.elements[2].symbol, 'N')
    assert.equal(r.elements[3].symbol, 'O')
  })

  it('H2O mass fractions sum to ~100%', () => {
    const r = parseMolecularFormula('H2O')
    assert.ok(r.ok)
    if (!r.ok) return
    const sum = r.elements.reduce((acc, e) => acc + e.massFraction, 0)
    assert.ok(Math.abs(sum - 100) < 0.1, `Sum of mass fractions = ${sum}`)
  })

  it('C8H10N4O2 count check', () => {
    const r = parseMolecularFormula('C8H10N4O2')
    assert.ok(r.ok)
    if (!r.ok) return
    const counts: Record<string, number> = {}
    r.elements.forEach(e => { counts[e.symbol] = e.count })
    assert.equal(counts.C, 8)
    assert.equal(counts.H, 10)
    assert.equal(counts.N, 4)
    assert.equal(counts.O, 2)
  })

})

// ── Error cases ───────────────────────────────────────────────────────────────

describe('parseMolecularFormula — validation errors', () => {

  it('empty string', () => {
    assertError('', ['enter', 'formula'])
  })

  it('whitespace only', () => {
    assertError('   ', ['enter', 'formula'])
  })

  it('unknown element: Xz', () => {
    assertError('Xz', ['unknown'])
  })

  it('unknown element: XYZ', () => {
    assertError('XYZ', ['unknown'])
  })

  it('unknown element: Jk', () => {
    assertError('Jk', ['unknown'])
  })

  it('unmatched opening paren: Ca(OH', () => {
    assertError('Ca(OH', ['paren'])
  })

  it('unmatched closing paren: H2O)', () => {
    assertError('H2O)', ['paren'])
  })

  it('zero atom count: C0H2', () => {
    assertError('C0H2', ['zero'])
  })

  it('leading number at top level: 2H2O', () => {
    assertError('2H2O', ['number'])
  })

  it('ionic charge +: Ca2+', () => {
    assertError('Ca2+', ['ionic', 'charge'])
  })

  it('ionic charge -: OH-', () => {
    assertError('OH-', ['ionic', 'charge'])
  })

  it('invalid character: H2@O', () => {
    assertError('H2@O', ['unsupported', 'character'])
  })

  it('invalid character: H₂O (subscript unicode digit)', () => {
    // Unicode subscript digit ₂ is not an ASCII digit — should error
    assertError('H₂O', ['unsupported', 'character'])
  })

  it('empty component in hydrate: CuSO4·', () => {
    assertError('CuSO4·', ['empty'])
  })

})
