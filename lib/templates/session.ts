import type { StyleOverrides } from '../chartStyles'
import type { MarkerShape } from '../markerShapes'
import type { ChartType } from '../templateStorage'

const KEY = 'fr_template_pending'
const MAX_ROWS = 10_000

export interface PendingTemplate {
  templateId: string
  templateName: string
  chartType: ChartType
  columns: string[]
  rows: Record<string, unknown>[]
  xCol: string
  yCols: string[]
  errorCols: Record<string, string>
  xAxisLabel: string
  yAxisLabel: string
  overrides: StyleOverrides
  seriesColorsList?: string[]
  seriesStrokeWidthsList?: number[]
  seriesMarkerSizesList?: number[]
  seriesMarkerShapesList?: MarkerShape[]
}

export function setPendingTemplate(data: PendingTemplate): void {
  if (typeof window === 'undefined') return
  const capped: PendingTemplate = { ...data, rows: data.rows.slice(0, MAX_ROWS) }
  try {
    sessionStorage.setItem(KEY, JSON.stringify(capped))
  } catch {
    // sessionStorage quota exceeded — editor will open without pre-applied data
  }
}

export function getPendingTemplate(): PendingTemplate | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as PendingTemplate) : null
  } catch {
    return null
  }
}

export function clearPendingTemplate(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(KEY)
}
