import type { ChartType } from './templateStorage'
import type { StyleOverrides } from './chartStyles'

// ── Types ─────────────────────────────────────────────────────────────────────

export type CompatibilityReason =
  | 'no_data'
  | 'no_series'
  | 'requires_positive_x'   // doseResponse: log scale needs x > 0
  | 'x_range_mismatch'      // template xMin/xMax clips all data out of view

export interface CompatibilityResult {
  compatible: boolean
  reason?: CompatibilityReason
  message?: string
}

/**
 * Lightweight context — computed once in page.tsx (useMemo), passed down.
 * Uses pre-computed xRange instead of raw data to avoid passing large arrays.
 */
export interface CompatibilityContext {
  currentChartType: ChartType
  xCol: string
  yCols: string[]
  /** [min, max] of all finite numeric X values in the dataset. null = no data / non-numeric X. */
  xRange: [number, number] | null
}

// ── Core check ────────────────────────────────────────────────────────────────

/**
 * Pure function — no side-effects, no React imports.
 * Returns whether a template can be safely applied without producing an empty chart.
 *
 * Checks (in order):
 * 1. No Y series selected → incompatible
 * 2. No data (xRange null) → incompatible
 * 3. doseResponse + any X ≤ 0 → incompatible (log scale requires x > 0)
 * 4. Template has xMin/xMax + data range has no overlap → incompatible (data invisible)
 * 5. Otherwise → compatible
 */
export function checkTemplateCompatibility(
  template: { chartType: ChartType; overrides: StyleOverrides },
  ctx: CompatibilityContext,
): CompatibilityResult {

  // ── 1. No Y series ─────────────────────────────────────────────────────────
  if (ctx.yCols.length === 0) {
    return {
      compatible: false,
      reason: 'no_series',
      message: 'No Y series selected. Assign at least one Y column before applying a template.',
    }
  }

  // ── 2. No data ─────────────────────────────────────────────────────────────
  if (!ctx.xRange) {
    return {
      compatible: false,
      reason: 'no_data',
      message: 'No data loaded. Upload a file before applying a template.',
    }
  }

  const [dataXMin, dataXMax] = ctx.xRange

  // ── 3. doseResponse requires all X > 0 ────────────────────────────────────
  if (template.chartType === 'doseResponse' && dataXMin <= 0) {
    return {
      compatible: false,
      reason: 'requires_positive_x',
      message:
        `Dose–Response requires strictly positive X values (log-concentration axis). ` +
        `Your X column ranges from ${fmt(dataXMin)} to ${fmt(dataXMax)}.`,
    }
  }

  // ── 4. xMin / xMax range mismatch ─────────────────────────────────────────
  // If the template forces a specific axis window and the data falls entirely
  // outside that window, the chart will be empty.
  const tMin = template.overrides.xMin
  const tMax = template.overrides.xMax
  if (tMin !== undefined && tMax !== undefined) {
    // No overlap: data is completely below or completely above the template range
    if (dataXMax < tMin || dataXMin > tMax) {
      return {
        compatible: false,
        reason: 'x_range_mismatch',
        message:
          `This template shows X from ${fmt(tMin)} to ${fmt(tMax)}, ` +
          `but your data spans ${fmt(dataXMin)} – ${fmt(dataXMax)}. ` +
          `Applying it would produce an empty chart.`,
      }
    }
  }

  return { compatible: true }
}

// ── Utility ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (!isFinite(n)) return String(n)
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

/**
 * Compute the xRange from raw data rows. Call this once with useMemo in page.tsx.
 */
export function computeXRange(
  data: Record<string, unknown>[],
  xCol: string,
): [number, number] | null {
  if (!xCol || data.length === 0) return null
  let min = Infinity
  let max = -Infinity
  for (const row of data) {
    const v = Number(row[xCol])
    if (isFinite(v)) {
      if (v < min) min = v
      if (v > max) max = v
    }
  }
  return isFinite(min) && isFinite(max) ? [min, max] : null
}
