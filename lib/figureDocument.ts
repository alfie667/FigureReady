import type { ChartAnnotation } from './annotations'
import type { StyleOverrides } from './chartStyles'
import type { ChartType } from './templateStorage'
import type { SampleType } from './analytics'

// ── FigureDocument ────────────────────────────────────────────────────────────
// Single source of truth for one scientific figure.
// All fields are serialisable so the document can be persisted to localStorage.

export interface FigureDocument {
  // Identity
  id: string
  name: string
  createdAt: number
  updatedAt: number

  // Dataset — stored separately (fr_data_{id}) to avoid localStorage quota issues
  data: Record<string, unknown>[]
  columns: string[]

  // Column mapping
  xCol: string
  yCols: string[]
  errorCols: Record<string, string>

  // Chart configuration
  chartType: ChartType
  seriesNames: Record<string, string>
  xAxisLabel: string
  yAxisLabel: string

  // Visual style
  styleOverrides: StyleOverrides

  // Annotations
  annotations: ChartAnnotation[]

  // Editor flags (persisted so they survive figure switches)
  figureConfigured: boolean

  // Template undo snapshot — cleared after use
  preTemplateSnap?: { chartType: ChartType; styleOverrides: StyleOverrides }
  appliedTemplateName?: string

  // Analytics metadata
  dataSource?: 'user_upload' | 'sample'
  sampleType?: SampleType
  workflow?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

let _idCounter = 0
function shortId(): string {
  // Lightweight ID: timestamp + counter. Not cryptographic, just unique per session.
  return `fig_${Date.now()}_${++_idCounter}`
}

export function createFigure(overrides: Partial<FigureDocument> = {}): FigureDocument {
  const now = Date.now()
  return {
    id: shortId(),
    name: 'Untitled figure',
    createdAt: now,
    updatedAt: now,
    data: [],
    columns: [],
    xCol: '',
    yCols: [],
    errorCols: {},
    chartType: 'line',
    seriesNames: {},
    xAxisLabel: '',
    yAxisLabel: '',
    styleOverrides: {},
    annotations: [],
    figureConfigured: false,
    ...overrides,
  }
}

// Extracts all ChartPreview-compatible props from a FigureDocument.
// ChartPreview keeps its existing prop signature — no refactoring needed.
export function figureToChartProps(fig: FigureDocument) {
  return {
    data:           fig.data,
    columns:        fig.columns,
    xCol:           fig.xCol,
    yCols:          fig.yCols,
    errorCols:      fig.errorCols,
    chartType:      fig.chartType,
    seriesNames:    fig.seriesNames,
    xAxisLabel:     fig.xAxisLabel,
    yAxisLabel:     fig.yAxisLabel,
    styleOverrides: fig.styleOverrides,
    annotations:    fig.annotations,
  }
}

// Patch applied from the page.tsx editor state back into a FigureDocument.
// Called by the autosave effect.
export type FigureEditorState = Pick<
  FigureDocument,
  | 'data' | 'columns' | 'xCol' | 'yCols' | 'errorCols'
  | 'chartType' | 'seriesNames' | 'xAxisLabel' | 'yAxisLabel'
  | 'styleOverrides' | 'annotations' | 'figureConfigured'
  | 'preTemplateSnap' | 'appliedTemplateName'
  | 'dataSource' | 'sampleType' | 'workflow'
>
