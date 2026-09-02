// Unit tests for lib/dilutionCalc.ts
// Runner: node:test + tsx  →  npm run test:dilution
//
// All five spec test cases + unit conversions + validation errors

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { calcDilution } from '../dilutionCalc.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function assertVal(r: ReturnType<typeof calcDilution>, expected: number, tol: number, label = '') {
  assert.ok(r.ok, `${label}: expected success, got "${!r.ok ? r.error : ''}"`)
  if (!r.ok) return
  const diff = Math.abs(r.value - expected)
  assert.ok(diff <= tol, `${label}: value=${r.value} expected=${expected} diff=${diff} tol=${tol}`)
}

function assertErr(r: ReturnType<typeof calcDilution>, substr: string, label = '') {
  assert.ok(!r.ok, `${label}: expected error, got value=${r.ok ? r.value : ''}`)
  if (!r.ok) {
    assert.ok(
      r.error.toLowerCase().includes(substr.toLowerCase()),
      `${label}: error "${r.error}" does not contain "${substr}"`,
    )
  }
}

// ── Spec test cases ───────────────────────────────────────────────────────────

describe('calcDilution — spec test cases', () => {

  it('Spec 1: C1=1M, C2=0.1M, V2=100mL → V1=10mL', () => {
    const r = calcDilution({
      solveFor: 'V1',
      C1: 1, C1Unit: 'M', V1: 0, V1Unit: 'mL',
      C2: 0.1, C2Unit: 'M', V2: 100, V2Unit: 'mL',
    })
    assertVal(r, 10, 1e-8)
    assert.ok(r.ok && r.unit === 'mL', 'unit should be mL')
  })

  it('Spec 2: C1=100mM, V1=2mL, C2=10mM → V2=20mL', () => {
    const r = calcDilution({
      solveFor: 'V2',
      C1: 100, C1Unit: 'mM', V1: 2, V1Unit: 'mL',
      C2: 10, C2Unit: 'mM', V2: 0, V2Unit: 'mL',
    })
    assertVal(r, 20, 1e-8)
    assert.ok(r.ok && r.unit === 'mL', 'unit should be mL')
  })

  it('Spec 3: C1=10mM, V1=5mL, V2=50mL → C2=1mM', () => {
    const r = calcDilution({
      solveFor: 'C2',
      C1: 10, C1Unit: 'mM', V1: 5, V1Unit: 'mL',
      C2: 0, C2Unit: 'mM', V2: 50, V2Unit: 'mL',
    })
    assertVal(r, 1, 1e-10)
    assert.ok(r.ok && r.unit === 'mM', 'unit should be mM')
  })

  it('Spec 4: V1=10mL, C2=50µM, V2=100mL → C1=500µM', () => {
    const r = calcDilution({
      solveFor: 'C1',
      C1: 0, C1Unit: 'µM', V1: 10, V1Unit: 'mL',
      C2: 50, C2Unit: 'µM', V2: 100, V2Unit: 'mL',
    })
    assertVal(r, 500, 1e-8)
    assert.ok(r.ok && r.unit === 'µM', 'unit should be µM')
  })

  it('Spec 5: C1=2mg/mL, C2=0.2mg/mL, V2=10mL → V1=1mL', () => {
    const r = calcDilution({
      solveFor: 'V1',
      C1: 2, C1Unit: 'mg/mL', V1: 0, V1Unit: 'mL',
      C2: 0.2, C2Unit: 'mg/mL', V2: 10, V2Unit: 'mL',
    })
    assertVal(r, 1, 1e-10)
    assert.ok(r.ok && r.unit === 'mL', 'unit should be mL')
  })

})

// ── Unit conversions ──────────────────────────────────────────────────────────

describe('calcDilution — unit conversions', () => {

  it('mM ↔ µM: C1=1mM, C2=100µM — same concentration, different units', () => {
    // 1 mM = 1000 µM, 100 µM = 0.1 mM → not equal → expect V1 ≠ V2
    // C1*V1 = C2*V2 → 1mM * V1 = 100µM * 100mL → V1 = 0.1*100/1 = 10mL
    const r = calcDilution({
      solveFor: 'V1',
      C1: 1, C1Unit: 'mM', V1: 0, V1Unit: 'mL',
      C2: 100, C2Unit: 'µM', V2: 100, V2Unit: 'mL',
    })
    assertVal(r, 10, 1e-8, 'mM↔µM V1')
  })

  it('mL ↔ µL: C1=1M, C2=0.1M, V2=1000µL → V1=100µL', () => {
    const r = calcDilution({
      solveFor: 'V1',
      C1: 1, C1Unit: 'M', V1: 0, V1Unit: 'µL',
      C2: 0.1, C2Unit: 'M', V2: 1000, V2Unit: 'µL',
    })
    assertVal(r, 100, 1e-8, 'µL units')
  })

  it('mixed volume units: V2 in L, V1 in mL', () => {
    // C1=1M, C2=0.01M, V2=1L → V1=10mL
    const r = calcDilution({
      solveFor: 'V1',
      C1: 1, C1Unit: 'M', V1: 0, V1Unit: 'mL',
      C2: 0.01, C2Unit: 'M', V2: 1, V2Unit: 'L',
    })
    assertVal(r, 10, 1e-8, 'mixed vol units')
  })

  it('mass conc units µg/mL ↔ ng/mL', () => {
    // C1=1µg/mL, C2=100ng/mL (= 0.1µg/mL), V2=100mL → V1=10mL
    const r = calcDilution({
      solveFor: 'V1',
      C1: 1, C1Unit: 'µg/mL', V1: 0, V1Unit: 'mL',
      C2: 100, C2Unit: 'ng/mL', V2: 100, V2Unit: 'mL',
    })
    assertVal(r, 10, 1e-8, 'µg/mL↔ng/mL')
  })

  it('nM concentration: C1=100nM, C2=10nM, V2=50µL → V1=5µL', () => {
    const r = calcDilution({
      solveFor: 'V1',
      C1: 100, C1Unit: 'nM', V1: 0, V1Unit: 'µL',
      C2: 10, C2Unit: 'nM', V2: 50, V2Unit: 'µL',
    })
    assertVal(r, 5, 1e-10, 'nM units')
  })

  it('solve V2 in L: C1=1M, V1=100mL, C2=10mM → V2=10L', () => {
    const r = calcDilution({
      solveFor: 'V2',
      C1: 1, C1Unit: 'M', V1: 100, V1Unit: 'mL',
      C2: 10, C2Unit: 'mM', V2: 0, V2Unit: 'L',
    })
    assertVal(r, 10, 1e-8, 'V2 in L')
  })

})

// ── Instruction text ──────────────────────────────────────────────────────────

describe('calcDilution — instruction text', () => {

  it('solve V1: instruction mentions stock and final volume', () => {
    const r = calcDilution({
      solveFor: 'V1',
      C1: 1, C1Unit: 'M', V1: 0, V1Unit: 'mL',
      C2: 0.1, C2Unit: 'M', V2: 100, V2Unit: 'mL',
    })
    assert.ok(r.ok)
    if (!r.ok) return
    assert.ok(r.instruction.includes('stock'), 'instruction should mention stock')
    assert.ok(r.instruction.includes('final volume'), 'instruction should mention final volume')
  })

  it('solve V2: instruction says "bring to a final volume"', () => {
    const r = calcDilution({
      solveFor: 'V2',
      C1: 100, C1Unit: 'mM', V1: 2, V1Unit: 'mL',
      C2: 10, C2Unit: 'mM', V2: 0, V2Unit: 'mL',
    })
    assert.ok(r.ok)
    if (!r.ok) return
    assert.ok(r.instruction.toLowerCase().includes('final volume'), 'instruction should mention final volume')
  })

  it('solve C2: instruction says "final concentration"', () => {
    const r = calcDilution({
      solveFor: 'C2',
      C1: 10, C1Unit: 'mM', V1: 5, V1Unit: 'mL',
      C2: 0, C2Unit: 'mM', V2: 50, V2Unit: 'mL',
    })
    assert.ok(r.ok)
    if (!r.ok) return
    assert.ok(r.instruction.toLowerCase().includes('final concentration'), 'instruction should mention final concentration')
  })

  it('solve C1: instruction says "stock concentration"', () => {
    const r = calcDilution({
      solveFor: 'C1',
      C1: 0, C1Unit: 'µM', V1: 10, V1Unit: 'mL',
      C2: 50, C2Unit: 'µM', V2: 100, V2Unit: 'mL',
    })
    assert.ok(r.ok)
    if (!r.ok) return
    assert.ok(r.instruction.toLowerCase().includes('stock concentration'), 'instruction should mention stock concentration')
  })

})

// ── Incompatible units ────────────────────────────────────────────────────────

describe('calcDilution — incompatible concentration units', () => {

  it('molar C1 + mass C2 → error', () => {
    assertErr(
      calcDilution({ solveFor: 'V1', C1: 1, C1Unit: 'M', V1: 0, V1Unit: 'mL', C2: 1, C2Unit: 'mg/mL', V2: 10, V2Unit: 'mL' }),
      'incompatible',
    )
  })

  it('mass C1 + molar C2 → error', () => {
    assertErr(
      calcDilution({ solveFor: 'V1', C1: 1, C1Unit: 'µg/mL', V1: 0, V1Unit: 'mL', C2: 1, C2Unit: 'mM', V2: 10, V2Unit: 'mL' }),
      'incompatible',
    )
  })

})

// ── Validation errors ─────────────────────────────────────────────────────────

describe('calcDilution — validation errors', () => {

  // Zero values
  it('zero C1 → error', () => {
    assertErr(
      calcDilution({ solveFor: 'V1', C1: 0, C1Unit: 'M', V1: 0, V1Unit: 'mL', C2: 0.1, C2Unit: 'M', V2: 100, V2Unit: 'mL' }),
      'zero',
    )
  })

  it('zero V2 → error', () => {
    assertErr(
      calcDilution({ solveFor: 'V1', C1: 1, C1Unit: 'M', V1: 0, V1Unit: 'mL', C2: 0.1, C2Unit: 'M', V2: 0, V2Unit: 'mL' }),
      'zero',
    )
  })

  it('zero C2 → error', () => {
    assertErr(
      calcDilution({ solveFor: 'V1', C1: 1, C1Unit: 'M', V1: 0, V1Unit: 'mL', C2: 0, C2Unit: 'M', V2: 100, V2Unit: 'mL' }),
      'zero',
    )
  })

  // Negative values
  it('negative C1 → error', () => {
    assertErr(
      calcDilution({ solveFor: 'V1', C1: -1, C1Unit: 'M', V1: 0, V1Unit: 'mL', C2: 0.1, C2Unit: 'M', V2: 100, V2Unit: 'mL' }),
      'zero',
    )
  })

  it('negative V2 → error', () => {
    assertErr(
      calcDilution({ solveFor: 'V1', C1: 1, C1Unit: 'M', V1: 0, V1Unit: 'mL', C2: 0.1, C2Unit: 'M', V2: -10, V2Unit: 'mL' }),
      'zero',
    )
  })

  // NaN values
  it('NaN C1 → error', () => {
    assertErr(
      calcDilution({ solveFor: 'V1', C1: NaN, C1Unit: 'M', V1: 0, V1Unit: 'mL', C2: 0.1, C2Unit: 'M', V2: 100, V2Unit: 'mL' }),
      'valid',
    )
  })

  it('NaN V2 → error', () => {
    assertErr(
      calcDilution({ solveFor: 'V1', C1: 1, C1Unit: 'M', V1: 0, V1Unit: 'mL', C2: 0.1, C2Unit: 'M', V2: NaN, V2Unit: 'mL' }),
      'valid',
    )
  })

  it('NaN C2 when solving V2 → error', () => {
    assertErr(
      calcDilution({ solveFor: 'V2', C1: 1, C1Unit: 'M', V1: 10, V1Unit: 'mL', C2: NaN, C2Unit: 'M', V2: 0, V2Unit: 'mL' }),
      'valid',
    )
  })

  it('NaN V1 when solving C1 → error', () => {
    assertErr(
      calcDilution({ solveFor: 'C1', C1: 0, C1Unit: 'M', V1: NaN, V1Unit: 'mL', C2: 0.1, C2Unit: 'M', V2: 100, V2Unit: 'mL' }),
      'valid',
    )
  })

})
