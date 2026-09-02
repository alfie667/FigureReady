// Unit tests for lib/molarityCalc.ts
// Runner: node:test + tsx  →  npm run test:molarity
//
// Tolerances:
//   ±1e-10 for exact unit conversions
//   ±0.001 for NaCl worked examples (floating-point accumulation)

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { calcMolarity } from '../molarityCalc.js'

// ── Helper ────────────────────────────────────────────────────────────────────

function assertM(result: ReturnType<typeof calcMolarity>, expected: number, tol: number, label?: string) {
  assert.ok(result.ok, `${label ?? ''}: expected success, got: ${!result.ok ? result.error : ''}`)
  if (!result.ok) return
  const diff = Math.abs(result.molarityM - expected)
  assert.ok(diff <= tol, `${label ?? ''}: M=${result.molarityM} vs expected=${expected} (diff ${diff} > tol ${tol})`)
}

function assertErr(result: ReturnType<typeof calcMolarity>, substr: string, label?: string) {
  assert.ok(!result.ok, `${label ?? ''}: expected error, got molarityM=${result.ok ? result.molarityM : ''}`)
  if (!result.ok) {
    assert.ok(
      result.error.toLowerCase().includes(substr.toLowerCase()),
      `${label ?? ''}: error "${result.error}" does not contain "${substr}"`,
    )
  }
}

// ── Mode: moles ───────────────────────────────────────────────────────────────

describe('calcMolarity — moles mode', () => {

  it('1 mol in 1 L = 1 M', () => {
    assertM(calcMolarity({ mode: 'moles', amount: 1, amountUnit: 'mol', volume: 1, volumeUnit: 'L' }), 1, 1e-10)
  })

  it('0.1 mol in 1 L = 0.1 M', () => {
    assertM(calcMolarity({ mode: 'moles', amount: 0.1, amountUnit: 'mol', volume: 1, volumeUnit: 'L' }), 0.1, 1e-10)
  })

  it('100 mmol in 500 mL = 0.2 M', () => {
    assertM(calcMolarity({ mode: 'moles', amount: 100, amountUnit: 'mmol', volume: 500, volumeUnit: 'mL' }), 0.2, 1e-10)
  })

  it('5 mmol in 250 mL = 0.02 M', () => {
    assertM(calcMolarity({ mode: 'moles', amount: 5, amountUnit: 'mmol', volume: 250, volumeUnit: 'mL' }), 0.02, 1e-10)
  })

  it('1 µmol in 1 L = 1e-6 M', () => {
    assertM(calcMolarity({ mode: 'moles', amount: 1, amountUnit: 'µmol', volume: 1, volumeUnit: 'L' }), 1e-6, 1e-15)
  })

  it('500 mmol in 1 L = 0.5 M', () => {
    assertM(calcMolarity({ mode: 'moles', amount: 500, amountUnit: 'mmol', volume: 1, volumeUnit: 'L' }), 0.5, 1e-10)
  })

})

// ── Mode: mass ────────────────────────────────────────────────────────────────

describe('calcMolarity — mass mode', () => {

  it('5.844 g NaCl (58.44 g/mol) in 1 L ≈ 0.1 M', () => {
    assertM(
      calcMolarity({ mode: 'mass', mass: 5.844, massUnit: 'g', molarMass: 58.44, volume: 1, volumeUnit: 'L' }),
      0.1, 0.001,
    )
  })

  it('2.922 g NaCl (58.44 g/mol) in 500 mL ≈ 0.1 M', () => {
    assertM(
      calcMolarity({ mode: 'mass', mass: 2.922, massUnit: 'g', molarMass: 58.44, volume: 500, volumeUnit: 'mL' }),
      0.1, 0.001,
    )
  })

  it('18.015 g H2O (18.015 g/mol) in 1 L = 1 M', () => {
    assertM(
      calcMolarity({ mode: 'mass', mass: 18.015, massUnit: 'g', molarMass: 18.015, volume: 1, volumeUnit: 'L' }),
      1, 1e-10,
    )
  })

  it('1000 mg / 100 g/mol in 1 L = 0.01 M', () => {
    assertM(
      calcMolarity({ mode: 'mass', mass: 1000, massUnit: 'mg', molarMass: 100, volume: 1, volumeUnit: 'L' }),
      0.01, 1e-10,
    )
  })

  it('1 kg / 100 g/mol in 1 L = 10 M', () => {
    assertM(
      calcMolarity({ mode: 'mass', mass: 1, massUnit: 'kg', molarMass: 100, volume: 1, volumeUnit: 'L' }),
      10, 1e-10,
    )
  })

  it('1 µg / 100 g/mol in 1 L = 1e-8 M', () => {
    assertM(
      calcMolarity({ mode: 'mass', mass: 1, massUnit: 'µg', molarMass: 100, volume: 1, volumeUnit: 'L' }),
      1e-8, 1e-17,
    )
  })

})

// ── Unit conversions ──────────────────────────────────────────────────────────

describe('calcMolarity — unit conversions', () => {

  it('1 mol / 1000 mL = 1 M', () => {
    assertM(calcMolarity({ mode: 'moles', amount: 1, amountUnit: 'mol', volume: 1000, volumeUnit: 'mL' }), 1, 1e-10)
  })

  it('1 mol / 1e6 µL = 1 M', () => {
    assertM(calcMolarity({ mode: 'moles', amount: 1, amountUnit: 'mol', volume: 1e6, volumeUnit: 'µL' }), 1, 1e-10)
  })

  it('1000 mmol / 1 L = 1 M', () => {
    assertM(calcMolarity({ mode: 'moles', amount: 1000, amountUnit: 'mmol', volume: 1, volumeUnit: 'L' }), 1, 1e-10)
  })

  it('1e6 µmol / 1 L = 1 M', () => {
    assertM(calcMolarity({ mode: 'moles', amount: 1e6, amountUnit: 'µmol', volume: 1, volumeUnit: 'L' }), 1, 1e-9)
  })

  it('1000 mmol / 500 mL = 2 M', () => {
    assertM(calcMolarity({ mode: 'moles', amount: 1000, amountUnit: 'mmol', volume: 500, volumeUnit: 'mL' }), 2, 1e-10)
  })

})

// ── Display format ────────────────────────────────────────────────────────────

describe('calcMolarity — display format', () => {

  it('M ≥ 1: display in M, no secondary', () => {
    const r = calcMolarity({ mode: 'moles', amount: 2, amountUnit: 'mol', volume: 1, volumeUnit: 'L' })
    assert.ok(r.ok)
    if (!r.ok) return
    assert.ok(r.display.includes('M'), `display="${r.display}" should contain M`)
    assert.ok(r.secondary === undefined, 'no secondary for M ≥ 1')
  })

  it('0.001 ≤ M < 1: display in M with mM secondary', () => {
    const r = calcMolarity({ mode: 'moles', amount: 0.1, amountUnit: 'mol', volume: 1, volumeUnit: 'L' })
    assert.ok(r.ok)
    if (!r.ok) return
    assert.ok(r.display.endsWith('M'), `display="${r.display}"`)
    assert.ok(r.secondary?.includes('mM'), `secondary="${r.secondary}" should contain mM`)
  })

  it('M < 0.001: display in µM', () => {
    const r = calcMolarity({ mode: 'moles', amount: 1, amountUnit: 'µmol', volume: 1, volumeUnit: 'L' })
    assert.ok(r.ok)
    if (!r.ok) return
    assert.ok(r.display.includes('µM'), `display="${r.display}" should contain µM`)
  })

})

// ── Validation errors ─────────────────────────────────────────────────────────

describe('calcMolarity — validation errors', () => {

  // Volume errors
  it('NaN volume → error', () => {
    assertErr(
      calcMolarity({ mode: 'moles', amount: 1, amountUnit: 'mol', volume: NaN, volumeUnit: 'L' }),
      'valid volume',
    )
  })

  it('zero volume → error', () => {
    assertErr(
      calcMolarity({ mode: 'moles', amount: 1, amountUnit: 'mol', volume: 0, volumeUnit: 'L' }),
      'zero',
    )
  })

  it('negative volume → error', () => {
    assertErr(
      calcMolarity({ mode: 'moles', amount: 1, amountUnit: 'mol', volume: -1, volumeUnit: 'L' }),
      'zero',
    )
  })

  // Amount errors
  it('NaN amount → error', () => {
    assertErr(
      calcMolarity({ mode: 'moles', amount: NaN, amountUnit: 'mol', volume: 1, volumeUnit: 'L' }),
      'valid',
    )
  })

  it('zero amount → error', () => {
    assertErr(
      calcMolarity({ mode: 'moles', amount: 0, amountUnit: 'mol', volume: 1, volumeUnit: 'L' }),
      'zero',
    )
  })

  it('negative amount → error', () => {
    assertErr(
      calcMolarity({ mode: 'moles', amount: -5, amountUnit: 'mol', volume: 1, volumeUnit: 'L' }),
      'zero',
    )
  })

  // Mass errors
  it('NaN mass → error', () => {
    assertErr(
      calcMolarity({ mode: 'mass', mass: NaN, massUnit: 'g', molarMass: 58.44, volume: 1, volumeUnit: 'L' }),
      'valid',
    )
  })

  it('zero mass → error', () => {
    assertErr(
      calcMolarity({ mode: 'mass', mass: 0, massUnit: 'g', molarMass: 58.44, volume: 1, volumeUnit: 'L' }),
      'zero',
    )
  })

  it('negative mass → error', () => {
    assertErr(
      calcMolarity({ mode: 'mass', mass: -1, massUnit: 'g', molarMass: 58.44, volume: 1, volumeUnit: 'L' }),
      'zero',
    )
  })

  // Molar mass errors
  it('NaN molar mass → error', () => {
    assertErr(
      calcMolarity({ mode: 'mass', mass: 1, massUnit: 'g', molarMass: NaN, volume: 1, volumeUnit: 'L' }),
      'valid',
    )
  })

  it('zero molar mass → error', () => {
    assertErr(
      calcMolarity({ mode: 'mass', mass: 1, massUnit: 'g', molarMass: 0, volume: 1, volumeUnit: 'L' }),
      'zero',
    )
  })

  it('negative molar mass → error', () => {
    assertErr(
      calcMolarity({ mode: 'mass', mass: 1, massUnit: 'g', molarMass: -58, volume: 1, volumeUnit: 'L' }),
      'zero',
    )
  })

})
