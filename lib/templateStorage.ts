import type { StyleOverrides } from './chartStyles'
import type { MarkerShape } from './markerShapes'

export type ChartType = 'line' | 'lineOnly' | 'scatter' | 'bar'

export interface ChartTemplate {
  id: string
  name: string
  builtIn?: boolean
  chartType: ChartType
  // Global style overrides (no per-series keys)
  overrides: StyleOverrides
  // Per-series settings stored by index so they remap to any column names
  seriesColorsList?: string[]
  seriesStrokeWidthsList?: number[]
  seriesMarkerSizesList?: number[]
  seriesMarkerShapesList?: MarkerShape[]
}

const STORAGE_KEY = 'figureready-templates'

const PER_SERIES_KEYS: (keyof StyleOverrides)[] = [
  'seriesColors',
  'seriesStrokeWidths',
  'seriesMarkerSizes',
  'seriesMarkerShapes',
]

export const BUILTIN_TEMPLATES: ChartTemplate[] = []

function stripPerSeries(overrides: StyleOverrides): StyleOverrides {
  const clean = { ...overrides }
  for (const key of PER_SERIES_KEYS) delete clean[key]
  return clean
}

export function loadUserTemplates(): ChartTemplate[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ChartTemplate[]) : []
  } catch {
    return []
  }
}

export function saveUserTemplate(template: Omit<ChartTemplate, 'id' | 'builtIn'>): ChartTemplate {
  const created: ChartTemplate = {
    id: `user-${Date.now()}`,
    name: template.name,
    chartType: template.chartType,
    overrides: stripPerSeries(template.overrides),
    seriesColorsList: template.seriesColorsList,
    seriesStrokeWidthsList: template.seriesStrokeWidthsList,
    seriesMarkerSizesList: template.seriesMarkerSizesList,
    seriesMarkerShapesList: template.seriesMarkerShapesList,
  }
  const existing = loadUserTemplates()
  existing.push(created)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  return created
}

export function deleteUserTemplate(id: string): void {
  if (typeof window === 'undefined') return
  const remaining = loadUserTemplates().filter(t => t.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining))
}

export function getAllTemplates(): ChartTemplate[] {
  return [...BUILTIN_TEMPLATES, ...loadUserTemplates()]
}
