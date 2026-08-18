// Deterministic unit tests for lib/curveFit4PL.ts
// Runner: node:test + tsx  →  npm run test:fit
//
// Sign convention (documented here so tests are self-explanatory):
//   eval4PL(x, bottom, top, logIC50, h)  with h > 0 (always, after normalization):
//     x → 0   : y → top    (LEFT asymptote)
//     x → ∞   : y → bottom (RIGHT asymptote)
//   INHIBITION (decreasing): top > bottom (e.g. top=100, bottom=0)
//   ACTIVATION (increasing): top < bottom (e.g. top=0,   bottom=100)
//
// Tolerances (documented):
//   Clean data (zero noise): IC50 ±1%, hillSlope ±2%, bottom/top ±1%
//   Noisy data (fixed ±5% additive): IC50 ±15%

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { fit4PL, sample4PLCurve, buildLogTicks, logFmt, eval4PL } from '../curveFit4PL.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Generate 4PL curve values from known parameters.
// bottom = right asymptote, top = left asymptote (see convention above).
function make4PL(
  bottom: number,
  top: number,
  ic50: number,
  hillSlope: number,
  xs: number[],
): number[] {
  const logIC50 = Math.log10(ic50)
  return xs.map(x => eval4PL(x, bottom, top, logIC50, hillSlope))
}

// Fixed deterministic noise — zero mean over one full period of 12 values.
const NOISE_PATTERN = [0, 1, -1, 2, -2, 1, -1, 0, 1, -1, 2, -2]
function addNoise(ys: number[], pct: number): number[] {
  const range = Math.max(...ys) - Math.min(...ys)
  return ys.map((y, i) => y + (NOISE_PATTERN[i % NOISE_PATTERN.length] / 2) * pct * range)
}

// Relative tolerance check (not suitable when expected ≈ 0 — use assertAbs instead).
function assertClose(actual: number, expected: number, relTol: number, label: string) {
  const err = Math.abs(actual - expected) / (Math.abs(expected) + 1e-10)
  assert.ok(
    err <= relTol,
    `${label}: expected ${expected}, got ${actual} (relative error ${(err * 100).toFixed(2)}% > ${(relTol * 100).toFixed(0)}%)`,
  )
}
// Absolute tolerance check (use when expected is zero or near-zero).
function assertAbs(actual: number, absTol: number, label: string) {
  assert.ok(
    Math.abs(actual) <= absTol,
    `${label}: |${actual}| > ${absTol} (absolute tolerance)`,
  )
}

// ─── Shared concentration ranges ─────────────────────────────────────────────
const XS_STANDARD = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30, 100]
const XS_NARROW   = [0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30, 100]

// ─── Clean data: inhibition curves ───────────────────────────────────────────

describe('fit4PL — clean data', () => {
  it('recovers known IC50 on clean decreasing curve (inhibition, h=1)', () => {
    // Inhibition: top=100 (high at low dose), bottom=0 (low at high dose)
    const ys = make4PL(0, 100, 0.3, 1, XS_STANDARD)
    const r = fit4PL(XS_STANDARD, ys)
    assert.equal(r.converged, true, `Not converged: ${!r.converged ? (r as {reason:string}).reason : ''}`)
    if (!r.converged) return
    assertClose(r.ic50,       0.3,  0.01, 'ic50')
    assertClose(r.hillSlope,  1.0,  0.02, 'hillSlope')
    assertAbs(r.bottom, 0.1, 'bottom (should be ≈0)')  // relative tol undefined at 0
    assertClose(r.top,      100,    0.01, 'top')
    assert.ok(r.r2 > 0.9999, `R² too low: ${r.r2}`)
    assert.ok(r.hillSlope > 0, `hillSlope must be positive after normalization, got ${r.hillSlope}`)
    assert.ok(r.top > r.bottom, `top > bottom for inhibition curve`)
  })

  it('recovers known EC50 on clean increasing curve (activation, top<bottom)', () => {
    // Activation: top=0 (low at low dose), bottom=1 (high at high dose)
    const ys = make4PL(1, 0, 5.0, 1, XS_STANDARD)
    const r = fit4PL(XS_STANDARD, ys)
    assert.equal(r.converged, true, `Not converged: ${!r.converged ? (r as {reason:string}).reason : ''}`)
    if (!r.converged) return
    assertClose(r.ic50,     5.0,  0.01, 'ec50')
    assertClose(r.hillSlope, 1.0, 0.02, 'hillSlope')
    assert.ok(r.r2 > 0.9999, `R² too low: ${r.r2}`)
    assert.ok(r.hillSlope > 0, 'hillSlope must be positive after normalization')
    assert.ok(r.top < r.bottom, `top < bottom for activation curve (top=${r.top}, bottom=${r.bottom})`)
  })

  it('recovers steep Hill slope (n=2.5, inhibition)', () => {
    const ys = make4PL(5, 95, 2.5, 2.5, XS_STANDARD)
    const r = fit4PL(XS_STANDARD, ys)
    assert.equal(r.converged, true, `Not converged: ${!r.converged ? (r as {reason:string}).reason : ''}`)
    if (!r.converged) return
    assertClose(r.ic50,      2.5,  0.01, 'ic50')
    assertClose(r.hillSlope, 2.5,  0.02, 'hillSlope')
    assertClose(r.bottom,    5,    0.01, 'bottom')
    assertClose(r.top,      95,    0.01, 'top')
    assert.ok(r.r2 > 0.9999, `R² too low: ${r.r2}`)
  })

  it('recovers non-zero bottom and non-100 top', () => {
    const ys = make4PL(15, 88, 0.07, 1.2, XS_NARROW)
    const r = fit4PL(XS_NARROW, ys)
    assert.equal(r.converged, true, `Not converged: ${!r.converged ? (r as {reason:string}).reason : ''}`)
    if (!r.converged) return
    assertClose(r.ic50,       0.07, 0.01, 'ic50')
    assertClose(r.hillSlope,  1.2,  0.02, 'hillSlope')
    assertClose(r.bottom,    15,    0.01, 'bottom')
    assertClose(r.top,       88,    0.01, 'top')
    assert.ok(r.r2 > 0.9999, `R² too low: ${r.r2}`)
  })

  it('nPoints matches number of valid input points', () => {
    const ys = make4PL(0, 100, 1, 1, XS_STANDARD)
    const r = fit4PL(XS_STANDARD, ys)
    if (r.converged) assert.equal(r.nPoints, XS_STANDARD.length)
  })
})

// ─── Noisy data ──────────────────────────────────────────────────────────────

describe('fit4PL — noisy data (fixed ±5% pattern)', () => {
  it('IC50 within 15% on noisy inhibition curve', () => {
    const ys = addNoise(make4PL(0, 100, 0.3, 1, XS_STANDARD), 0.05)
    const r = fit4PL(XS_STANDARD, ys)
    assert.equal(r.converged, true, `Not converged: ${!r.converged ? (r as {reason:string}).reason : ''}`)
    if (!r.converged) return
    assertClose(r.ic50, 0.3, 0.15, 'ic50')
    assert.ok(r.r2 > 0.95, `R² too low under noise: ${r.r2}`)
  })

  it('hillSlope is always positive after normalization (noisy data)', () => {
    const ys = addNoise(make4PL(0, 100, 5, 1.5, XS_STANDARD), 0.05)
    const r = fit4PL(XS_STANDARD, ys)
    assert.equal(r.converged, true, `Not converged: ${!r.converged ? (r as {reason:string}).reason : ''}`)
    if (!r.converged) return
    assert.ok(r.hillSlope > 0, `Hill slope must be positive (post-normalization), got ${r.hillSlope}`)
    assertClose(r.ic50, 5, 0.15, 'ic50 under noise')
  })
})

// ─── Input validation ─────────────────────────────────────────────────────────

describe('fit4PL — input validation', () => {
  it('fails with explicit reason when <4 valid points', () => {
    const r = fit4PL([0.1, 1, 10], [100, 50, 0])
    assert.equal(r.converged, false)
    assert.ok((r as {reason:string}).reason.includes('≥4'), `reason: ${(r as {reason:string}).reason}`)
  })

  it('filters non-positive X values — still fits if enough remain', () => {
    const xs = [-1, 0, ...XS_STANDARD]
    const ys = [999, 999, ...make4PL(0, 100, 0.3, 1, XS_STANDARD)]
    const r = fit4PL(xs, ys)
    assert.equal(r.converged, true, `Not converged: ${!r.converged ? (r as {reason:string}).reason : ''}`)
    if (r.converged) assertClose(r.ic50, 0.3, 0.02, 'ic50 after invalid X filter')
  })

  it('fails when all X <= 0 (no valid points at all)', () => {
    const r = fit4PL([-3, -2, -1, 0], [100, 80, 50, 0])
    assert.equal(r.converged, false)
    assert.ok((r as {reason:string}).reason.includes('valid'), `reason: ${(r as {reason:string}).reason}`)
  })

  it('fails when all X are NaN or Infinity', () => {
    const r = fit4PL([NaN, Infinity, NaN, Infinity], [100, 50, 25, 0])
    assert.equal(r.converged, false)
  })

  it('fails when fewer than 4 finite Y values', () => {
    const r = fit4PL([0.1, 1, 10], [100, NaN, NaN])
    assert.equal(r.converged, false)
  })

  it('fails when all Y values are identical (flat response)', () => {
    const r = fit4PL(XS_STANDARD, XS_STANDARD.map(() => 50))
    assert.equal(r.converged, false)
    const reason = (r as {reason:string}).reason.toLowerCase()
    assert.ok(
      reason.includes('flat') || reason.includes('narrow'),
      `reason: ${(r as {reason:string}).reason}`,
    )
  })

  it('fails when all X values are identical', () => {
    const r = fit4PL([1, 1, 1, 1, 1], [100, 80, 60, 40, 20])
    assert.equal(r.converged, false)
    const reason = (r as {reason:string}).reason.toLowerCase()
    assert.ok(
      reason.includes('range') || reason.includes('narrow') || reason.includes('identical'),
      `reason: ${(r as {reason:string}).reason}`,
    )
  })

  it('mixed valid and invalid rows — uses only the valid subset', () => {
    // valid: [0.01, 0.1, 1, 10, 100] = 5 points → should converge
    const xs = [NaN, 0.01, 0, 0.1, -5, 1, Infinity, 10, null as unknown as number, 100]
    const ys = [50,  90,  80, 75,  60, 50, 30,       20, 10,                        5]
    const r = fit4PL(xs, ys)
    assert.equal(r.converged, true, `Not converged: ${!r.converged ? (r as {reason:string}).reason : ''}`)
  })
})

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('fit4PL — edge cases', () => {
  it('returns converged=false (never throws) on degenerate inputs', () => {
    assert.doesNotThrow(() => fit4PL([1], [50]))
    assert.equal(fit4PL([1], [50]).converged, false)

    assert.doesNotThrow(() => fit4PL([], []))
    assert.equal(fit4PL([], []).converged, false)

    // Mismatched length — shorter y array
    assert.doesNotThrow(() => fit4PL([1, 2, 3, 4, 5], [100, 80]))
    assert.equal(fit4PL([1, 2, 3, 4, 5], [100, 80]).converged, false)
  })

  it('IC50 near bottom of concentration range converges', () => {
    const xs = [0.0001, 0.0003, 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3]
    const ys = make4PL(0, 100, 0.0005, 1, xs)
    const r = fit4PL(xs, ys)
    assert.equal(r.converged, true, `Not converged: ${!r.converged ? (r as {reason:string}).reason : ''}`)
    if (r.converged) assertClose(r.ic50, 0.0005, 0.05, 'ic50 at left edge')
  })

  it('IC50 near top of concentration range converges', () => {
    const xs = [0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30, 100, 300]
    const ys = make4PL(0, 100, 250, 1, xs)
    const r = fit4PL(xs, ys)
    assert.equal(r.converged, true, `Not converged: ${!r.converged ? (r as {reason:string}).reason : ''}`)
    if (r.converged) assertClose(r.ic50, 250, 0.05, 'ic50 at right edge')
  })
})

// ─── sample4PLCurve ───────────────────────────────────────────────────────────

describe('sample4PLCurve', () => {
  it('returns 200 points by default', () => {
    const r = fit4PL(XS_STANDARD, make4PL(0, 100, 1, 1, XS_STANDARD))
    assert.equal(r.converged, true)
    if (!r.converged) return
    assert.equal(sample4PLCurve(r, 0.001, 100).length, 200)
  })

  it('x values are log-uniformly spaced (constant log ratio)', () => {
    const r = fit4PL(XS_STANDARD, make4PL(0, 100, 1, 1, XS_STANDARD))
    assert.equal(r.converged, true)
    if (!r.converged) return
    const pts = sample4PLCurve(r, 0.01, 100, 50)
    const logRatios = pts.slice(1).map((p, i) => Math.log10(p.x) - Math.log10(pts[i].x))
    const firstRatio = logRatios[0]
    for (const ratio of logRatios) {
      assert.ok(Math.abs(ratio - firstRatio) < 1e-9, `Non-uniform log spacing: ${ratio} vs ${firstRatio}`)
    }
  })

  it('first and last x match xMin and xMax exactly', () => {
    const r = fit4PL(XS_STANDARD, make4PL(0, 100, 1, 1, XS_STANDARD))
    assert.equal(r.converged, true)
    if (!r.converged) return
    const pts = sample4PLCurve(r, 0.001, 100, 10)
    assertClose(pts[0].x,              0.001, 1e-9, 'first x')
    assertClose(pts[pts.length - 1].x, 100,   1e-9, 'last x')
  })

  it('returns [] for invalid xMin or xMax', () => {
    const r = fit4PL(XS_STANDARD, make4PL(0, 100, 1, 1, XS_STANDARD))
    assert.equal(r.converged, true)
    if (!r.converged) return
    assert.deepEqual(sample4PLCurve(r, -1, 100), [])
    assert.deepEqual(sample4PLCurve(r, 0, 100), [])
    assert.deepEqual(sample4PLCurve(r, 10, 1), [])
  })
})

// ─── buildLogTicks ────────────────────────────────────────────────────────────

describe('buildLogTicks', () => {
  it('[0.003, 40] → decade ticks within domain', () => {
    const ticks = buildLogTicks(0.003, 40)
    assert.ok(ticks.length >= 2, `Too few ticks: ${ticks}`)
    // All ticks must be within or at domain boundaries (inclusive with 0.1% tolerance)
    for (const t of ticks) {
      assert.ok(t >= 0.003 * 0.999 && t <= 40 * 1.001, `Tick ${t} out of range [0.003, 40]`)
    }
    // 0.001 and 100 should NOT be included (outside the 0.1% guard)
    assert.ok(!ticks.some(t => Math.abs(t - 0.001) / 0.001 < 0.01), '0.001 should not appear')
    assert.ok(!ticks.some(t => Math.abs(t - 100) / 100 < 0.01), '100 should not appear')
    // 0.01, 0.1, 1, 10 must all be present
    for (const expected of [0.01, 0.1, 1, 10]) {
      assert.ok(
        ticks.some(t => Math.abs(t - expected) / expected < 1e-9),
        `Missing decade tick ${expected}`,
      )
    }
  })

  it('[1e-3, 1e3] → full decade range', () => {
    const ticks = buildLogTicks(1e-3, 1e3)
    for (const expected of [0.001, 0.01, 0.1, 1, 10, 100, 1000]) {
      assert.ok(
        ticks.some(t => Math.abs(t - expected) / expected < 1e-9),
        `Missing decade tick ${expected}`,
      )
    }
  })

  it('narrow range [1, 5] → returns ≥2 ticks, all within/at domain', () => {
    const ticks = buildLogTicks(1, 5)
    assert.ok(ticks.length >= 2, `Too few ticks for [1, 5]: ${JSON.stringify(ticks)}`)
    // Ticks should be within or at the domain (inclusive boundaries)
    for (const t of ticks) {
      assert.ok(t >= 1 && t <= 5, `Tick ${t} out of [1, 5]`)
    }
  })

  it('returns [] for invalid inputs', () => {
    assert.deepEqual(buildLogTicks(0, 10), [])
    assert.deepEqual(buildLogTicks(-1, 10), [])
    assert.deepEqual(buildLogTicks(10, 1), [])
    assert.deepEqual(buildLogTicks(5, 5), [])
  })
})

// ─── logFmt ───────────────────────────────────────────────────────────────────

describe('logFmt', () => {
  it('formats exact decades correctly', () => {
    assert.equal(logFmt(0.001), '0.001')
    assert.equal(logFmt(0.01),  '0.01')
    assert.equal(logFmt(0.1),   '0.1')
    assert.equal(logFmt(1),     '1')
    assert.equal(logFmt(10),    '10')
    assert.equal(logFmt(100),   '100')
    assert.equal(logFmt(1000),  '1000')
  })

  it('formats 0 as "0"', () => {
    assert.equal(logFmt(0), '0')
  })

  it('formats non-decade values as compact decimal or exponential', () => {
    const v = logFmt(3.5)
    assert.ok(v.length > 0 && !v.includes('undefined'), `logFmt(3.5) = "${v}"`)
  })

  it('returns empty string for non-positive or non-finite values', () => {
    assert.equal(logFmt(-1), '')
    assert.equal(logFmt(NaN), '')
    assert.equal(logFmt(Infinity), '')
  })
})

// ─── eval4PL model correctness ────────────────────────────────────────────────

describe('eval4PL — model correctness', () => {
  it('returns midpoint (bottom+top)/2 at x = IC50', () => {
    // bottom=10, top=90, IC50=1 (logIC50=0), h=1: y at x=1 should be 50
    const y = eval4PL(1, 10, 90, 0, 1)
    assertClose(y, (10 + 90) / 2, 1e-9, 'y at IC50')
  })

  it('returns NaN for x <= 0', () => {
    assert.ok(Number.isNaN(eval4PL(0,  0, 100, 0, 1)))
    assert.ok(Number.isNaN(eval4PL(-1, 0, 100, 0, 1)))
  })

  it('approaches bottom as x → ∞ (h=1, inhibition: bottom=0, top=100)', () => {
    // With h=1: x→∞ → ratio→+∞ → denom→∞ → y → bottom
    const y = eval4PL(1e10, 0, 100, 0, 1)
    assert.ok(y < 0.001, `y at x=1e10 should be near bottom=0, got ${y}`)
  })

  it('approaches top as x → 0 (h=1, inhibition: bottom=0, top=100)', () => {
    // With h=1: x→0 → ratio→-∞ → denom→1 → y → top
    const y = eval4PL(1e-10, 0, 100, 0, 1)
    assert.ok(y > 99.999, `y at x=1e-10 should be near top=100, got ${y}`)
  })

  it('approaches top as x → ∞ (activation: top=0, bottom=100, h=1)', () => {
    // bottom=100, top=0, h=1: x→∞ → y → bottom=100
    const y = eval4PL(1e10, 100, 0, 0, 1)
    assert.ok(y > 99.999, `Activation x→∞: y should be near bottom=100, got ${y}`)
  })

  it('approaches top (=0) as x → 0 (activation: top=0, bottom=100, h=1)', () => {
    const y = eval4PL(1e-10, 100, 0, 0, 1)
    assert.ok(y < 0.001, `Activation x→0: y should be near top=0, got ${y}`)
  })

  it('no NaN or Infinity at extreme x values', () => {
    for (const x of [1e-15, 1e-10, 1e-5, 1, 1e5, 1e10, 1e15]) {
      const y = eval4PL(x, 0, 100, 0, 3)
      assert.ok(Number.isFinite(y), `eval4PL(${x}) = ${y} (not finite)`)
    }
  })
})
