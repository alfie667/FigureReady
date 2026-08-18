// 4-Parameter Logistic (4PL) curve fitting for dose–response / concentration–response data.
//
// Model: f(x) = bottom + (top − bottom) / (1 + (x / IC50)^hillSlope)
//
// Fitted in the parameter space θ = [bottom, top, logIC50, hillSlope]:
//   IC50 = 10^logIC50 — always positive, optimizer is unconstrained on logIC50
//   hillSlope < 0 → inhibition (decreasing), hillSlope > 0 → activation (increasing)
//
// Numerical evaluation uses the log-space identity:
//   (x/IC50)^h = exp(h · (ln x − logIC50 · ln 10))
// clamped to [−500, 500] to avoid overflow before exp().

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Fit4PLSuccess {
  converged: true
  bottom: number
  top: number
  ic50: number      // = 10^logIC50 (raw concentration units)
  logIC50: number   // the fitted parameter
  hillSlope: number // sign encodes direction: negative = inhibition, positive = activation
  r2: number        // unweighted R² = 1 − SS_res/SS_tot; can be negative if fit is poor
  nPoints: number   // valid (x>0, finite y) points used
}

export interface Fit4PLFailure {
  converged: false
  reason: string
}

export type Fit4PLResult = Fit4PLSuccess | Fit4PLFailure

// ─── Core model (exported for testing) ──────────────────────────────────────

export function eval4PL(
  x: number,
  bottom: number,
  top: number,
  logIC50: number,
  hillSlope: number,
): number {
  if (x <= 0) return NaN
  const ratio = hillSlope * (Math.log(x) - logIC50 * Math.LN10)
  const clamped = Math.max(-500, Math.min(500, ratio))
  return bottom + (top - bottom) / (1 + Math.exp(clamped))
}

// ─── Input filtering and validation ─────────────────────────────────────────

function filterValid(xs: number[], ys: number[]): [number[], number[]] {
  const vx: number[] = [], vy: number[] = []
  for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
    if (Number.isFinite(xs[i]) && xs[i] > 0 && Number.isFinite(ys[i])) {
      vx.push(xs[i])
      vy.push(ys[i])
    }
  }
  return [vx, vy]
}

function validateFiltered(vx: number[], vy: number[]): string | null {
  if (vx.length < 4) {
    return `Need ≥4 valid points (x>0, finite y); found ${vx.length}`
  }
  const xMin = Math.min(...vx), xMax = Math.max(...vx)
  if (xMax / xMin < 1 + 1e-6) {
    return 'X range too narrow — all concentrations are nearly identical'
  }
  const yMin = Math.min(...vy), yMax = Math.max(...vy)
  const yScale = Math.abs(yMin) + Math.abs(yMax) + 1
  if ((yMax - yMin) < 1e-12 * yScale) {
    return 'Y range too narrow — flat response, no detectable dose-effect'
  }
  return null
}

// ─── Initial guess ────────────────────────────────────────────────────────────

function initialGuess(vx: number[], vy: number[]): [number, number, number, number] {
  const pairs = vx.map((x, i) => [x, vy[i]] as [number, number])
  pairs.sort((a, b) => a[0] - b[0])

  // With eval4PL(x, bottom, top, logIC50, h), h > 0 means:
  //   x → 0 : y → top   (LEFT asymptote)
  //   x → ∞ : y → bottom (RIGHT asymptote)
  // So we initialize directly from the empirical left/right ends.
  const top    = pairs[0][1]                      // response at lowest dose = left asymptote
  const bottom = pairs[pairs.length - 1][1]       // response at highest dose = right asymptote
  const midY   = (top + bottom) / 2

  // Estimate logIC50 by linear interpolation in log-X at the midpoint crossing
  const logXMin = Math.log10(pairs[0][0])
  const logXMax = Math.log10(pairs[pairs.length - 1][0])
  let logIC50 = (logXMin + logXMax) / 2  // geometric mean fallback

  for (let i = 0; i < pairs.length - 1; i++) {
    const [x1, y1] = pairs[i]
    const [x2, y2] = pairs[i + 1]
    if ((y1 - midY) * (y2 - midY) <= 0) {
      const dY = y2 - y1
      const t = Math.abs(dY) < 1e-15 ? 0.5 : (midY - y1) / dY
      logIC50 = Math.log10(x1) + t * (Math.log10(x2) - Math.log10(x1))
      break
    }
  }

  // Always start with hillSlope = 1.
  // For inhibition (top > bottom): h=1 gives decreasing curve from top to bottom ✓
  // For activation (top < bottom): h=1 also gives y from top (low) to bottom (high) ✓
  return [bottom, top, logIC50, 1]
}

// ─── Objective function (sum of squared residuals) ───────────────────────────

function ssr(theta: number[], vx: number[], vy: number[]): number {
  const [b, t, lIC50, h] = theta
  let s = 0
  for (let i = 0; i < vx.length; i++) {
    const r = vy[i] - eval4PL(vx[i], b, t, lIC50, h)
    s += r * r
  }
  return Number.isFinite(s) ? s : 1e30
}

// ─── Nelder-Mead simplex optimizer ───────────────────────────────────────────
// Standard NM with α=1 (reflect), γ=2 (expand), ρ=0.5 (contract), σ=0.5 (shrink)

function nelderMead(
  f: (theta: number[]) => number,
  x0: number[],
  scale: number[],      // initial simplex step per dimension
  maxIter = 15000,
  tol = 1e-10,
): { theta: number[]; fval: number; converged: boolean } {
  const n = x0.length
  const alpha = 1.0, gamma = 2.0, rho = 0.5, sigma = 0.5

  // Build initial simplex: x0 + each coordinate perturbed by scale[i]
  const simplex: number[][] = Array.from({ length: n + 1 }, (_, i) => {
    const v = x0.slice()
    if (i > 0) v[i - 1] += scale[i - 1]
    return v
  })
  const fvals = simplex.map(v => f(v))

  for (let iter = 0; iter < maxIter; iter++) {
    // Sort indices by f value (ascending — best first)
    const idx = Array.from({ length: n + 1 }, (_, i) => i).sort((a, b) => fvals[a] - fvals[b])
    const iBest = idx[0], iWorst = idx[n], iSecondWorst = idx[n - 1]

    const fBest        = fvals[iBest]
    const fWorst       = fvals[iWorst]
    const fSecondWorst = fvals[iSecondWorst]

    // Convergence: f-value range < tol
    if (fWorst - fBest < tol) {
      return { theta: simplex[iBest].slice(), fval: fBest, converged: true }
    }

    // Centroid of the n best vertices (all except worst)
    const c = Array(n).fill(0) as number[]
    for (let j = 0; j < n; j++) {
      const v = simplex[idx[j]]
      for (let k = 0; k < n; k++) c[k] += v[k] / n
    }

    // Reflect worst through centroid
    const sWorst = simplex[iWorst]
    const r = c.map((ck, k) => ck + alpha * (ck - sWorst[k]))
    const fR = f(r)

    if (fR < fBest) {
      // Better than best → try expand
      const e = c.map((ck, k) => ck + gamma * (r[k] - ck))
      const fE = f(e)
      if (fE < fR) {
        simplex[iWorst] = e; fvals[iWorst] = fE
      } else {
        simplex[iWorst] = r; fvals[iWorst] = fR
      }
    } else if (fR < fSecondWorst) {
      // Accept reflection
      simplex[iWorst] = r; fvals[iWorst] = fR
    } else {
      // Contraction
      let accepted = false
      if (fR < fWorst) {
        // Outside contraction
        const co = c.map((ck, k) => ck + rho * (r[k] - ck))
        const fCo = f(co)
        if (fCo <= fR) { simplex[iWorst] = co; fvals[iWorst] = fCo; accepted = true }
      } else {
        // Inside contraction
        const ci = c.map((ck, k) => ck + rho * (sWorst[k] - ck))
        const fCi = f(ci)
        if (fCi < fWorst) { simplex[iWorst] = ci; fvals[iWorst] = fCi; accepted = true }
      }
      if (!accepted) {
        // Shrink: pull all vertices toward best
        const sBest = simplex[iBest]
        for (let j = 1; j <= n; j++) {
          const v = simplex[idx[j]]
          simplex[idx[j]] = sBest.map((b, k) => b + sigma * (v[k] - b))
          fvals[idx[j]] = f(simplex[idx[j]])
        }
      }
    }
  }

  // Max iterations reached
  const iBest = Array.from({ length: n + 1 }, (_, i) => i).reduce((a, b) => fvals[a] < fvals[b] ? a : b)
  return { theta: simplex[iBest].slice(), fval: fvals[iBest], converged: false }
}

// ─── R² (unweighted, on valid points only) ────────────────────────────────────

function computeR2(vx: number[], vy: number[], theta: number[]): number {
  const [b, t, lIC50, h] = theta
  const yMean = vy.reduce((a, v) => a + v, 0) / vy.length
  let ssRes = 0, ssTot = 0
  for (let i = 0; i < vx.length; i++) {
    const residual = vy[i] - eval4PL(vx[i], b, t, lIC50, h)
    ssRes += residual * residual
    const dev = vy[i] - yMean
    ssTot += dev * dev
  }
  if (ssTot < 1e-15) return 0
  return 1 - ssRes / ssTot
}

// ─── Public API — single series ───────────────────────────────────────────────

export function fit4PL(x: number[], y: number[]): Fit4PLResult {
  // 1. Filter valid points
  const [vx, vy] = filterValid(x, y)

  // 2. Validate
  const err = validateFiltered(vx, vy)
  if (err) return { converged: false, reason: err }

  // 3. Initial guess
  const [b0, t0, lIC50_0, h0] = initialGuess(vx, vy)

  // 4. Simplex scale: proportional to data range
  const yRange = Math.max(...vy) - Math.min(...vy)
  const xLogRange = Math.log10(Math.max(...vx)) - Math.log10(Math.min(...vx))
  const scale = [
    yRange * 0.15,      // bottom
    yRange * 0.15,      // top
    xLogRange * 0.15,   // logIC50
    0.4,                // hillSlope
  ]

  // 5. Optimize
  const obj = (theta: number[]) => ssr(theta, vx, vy)
  const { theta, converged } = nelderMead(obj, [b0, t0, lIC50_0, h0], scale)

  if (!converged) {
    return { converged: false, reason: 'Optimizer did not converge (max iterations reached)' }
  }

  // 6. Extract parameters — normalize to always report hillSlope > 0.
  // The model is symmetric: (bottom=b, top=t, h=n) ≡ (bottom=t, top=b, h=-n).
  // We enforce h > 0 so that hillSlope always represents steepness (magnitude).
  // Curve direction is encoded in top vs bottom: inhibition → top > bottom.
  let [bottom, top, logIC50, hillSlope] = theta
  if (hillSlope < 0) {
    ;[bottom, top, hillSlope] = [top, bottom, -hillSlope]
  }
  const ic50 = Math.pow(10, logIC50)

  if (!Number.isFinite(ic50) || ic50 <= 0) {
    return { converged: false, reason: 'IC50 is non-positive or infinite after optimization' }
  }
  const xMin = Math.min(...vx), xMax = Math.max(...vx)
  if (ic50 < xMin / 1e4 || ic50 > xMax * 1e4) {
    return {
      converged: false,
      reason: `IC50 (${ic50.toExponential(2)}) is far outside the data range — curve may be non-sigmoidal`,
    }
  }

  // 7. R²
  const r2 = computeR2(vx, vy, theta)

  return { converged: true, bottom, top, ic50, logIC50, hillSlope, r2, nPoints: vx.length }
}

// ─── Public API — multi-series ────────────────────────────────────────────────

export function fitAll(
  xValues: number[],
  seriesValues: Record<string, number[]>,
): Record<string, Fit4PLResult> {
  const results: Record<string, Fit4PLResult> = {}
  for (const [key, yValues] of Object.entries(seriesValues)) {
    results[key] = fit4PL(xValues, yValues)
  }
  return results
}

// ─── Fit curve sampling — log-uniform in X ────────────────────────────────────

export function sample4PLCurve(
  result: Fit4PLSuccess,
  xMin: number,
  xMax: number,
  n = 200,
): Array<{ x: number; y: number }> {
  if (xMin <= 0 || xMax <= 0 || xMin >= xMax || n < 2) return []
  const logMin = Math.log10(xMin)
  const logMax = Math.log10(xMax)
  return Array.from({ length: n }, (_, i) => {
    const logX = logMin + (logMax - logMin) * i / (n - 1)
    const x = Math.pow(10, logX)
    const y = eval4PL(x, result.bottom, result.top, result.logIC50, result.hillSlope)
    return { x, y }
  })
}

// ─── Log tick generation ─────────────────────────────────────────────────────
// Produces decade ticks within [min, max]. Manual domain is unchanged.
// For ranges spanning < 2 decades, adds 2× and 5× intermediate ticks.

export function buildLogTicks(min: number, max: number): number[] {
  if (min <= 0 || max <= 0 || min >= max) return []

  const expMin = Math.floor(Math.log10(min))
  const expMax = Math.ceil(Math.log10(max))

  // Decade ticks strictly inside the domain
  const decades: number[] = []
  for (let e = expMin; e <= expMax; e++) {
    const t = Math.pow(10, e)
    if (t > min * 0.999 && t < max * 1.001) decades.push(t)
  }

  if (decades.length >= 2) return decades

  // Fewer than 2 full decades — supplement with 2× and 5× multiples
  const extra: number[] = []
  for (let e = expMin; e < expMax; e++) {
    for (const m of [2, 5]) {
      const t = m * Math.pow(10, e)
      if (t > min && t < max) extra.push(t)
    }
  }

  return [...decades, ...extra].sort((a, b) => a - b)
}

// ─── Log tick formatter ───────────────────────────────────────────────────────
// Produces clean decimal strings for exact decades (e.g. 0.001, 0.01, 1, 10, 100).
// Falls back to toPrecision(2) for non-decade values.

const SUPERSCRIPT_DIGITS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹']
function toSup(n: number): string {
  const sign = n < 0 ? '⁻' : ''
  return sign + String(Math.abs(n)).split('').map(d => SUPERSCRIPT_DIGITS[Number(d)] ?? d).join('')
}

export function logFmt(v: number): string {
  if (v === 0) return '0'
  if (!Number.isFinite(v) || v < 0) return ''

  const log = Math.log10(v)
  const exp = Math.round(log)

  if (Math.abs(log - exp) < 1e-9) {
    // Exact decade
    if (exp >= -3 && exp <= 4) {
      // Decimal notation
      if (exp >= 0) return String(Math.round(Math.pow(10, exp)))
      return Math.pow(10, exp).toFixed(-exp)
    }
    return `10${toSup(exp)}`
  }

  // Non-decade: compact decimal
  if (v >= 0.001 && v < 10000) {
    const s = v.toPrecision(2)
    return String(+s)  // strips trailing zeros
  }
  return v.toExponential(1)
}
