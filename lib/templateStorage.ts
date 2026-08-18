import type { StyleOverrides } from './chartStyles'
import type { MarkerShape } from './markerShapes'
import type { PaletteId } from './colorPalettes'

export type ChartType = 'line' | 'lineOnly' | 'scatter' | 'bar' | 'doseResponse'

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
  seriesYOffsetsList?: number[]
  // Default axis labels applied when template is selected in-editor
  defaultAxisLabels?: { x?: string; y?: string }
  // Optional palette: colors auto-cycle through this palette unless overridden per-series
  paletteId?: PaletteId
}

const STORAGE_KEY = 'figureready-templates'

const PER_SERIES_KEYS: (keyof StyleOverrides)[] = [
  'seriesColors',
  'seriesStrokeWidths',
  'seriesMarkerSizes',
  'seriesMarkerShapes',
  'seriesYOffsets',
]

// Gallery-style built-in templates live in lib/templates/definitions.ts and are
// imported directly by the /templates page. BUILTIN_TEMPLATES here is kept for
// the in-editor TemplateSelector (development/internal templates only).
const XRD_DEV_TEMPLATE: ChartTemplate = {
  id: 'internal-xrd-stacked',
  name: '[DEV] Stacked XRD Patterns',
  builtIn: true,
  chartType: 'lineOnly',
  overrides: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    xTitleSize: 16,
    yTitleSize: 16,
    xTickSize: 14,
    yTickSize: 14,
    axisWidth: 1.5,
    axisColor: '#111827',
    showGrid: false,
    boldLabels: false,
    showLegend: true,
    legendPosition: 'outside-right',
    legendFontSize: 12,
    legendOrientation: 'v',
    legendBg: false,
    figureWidth: 760,
    figureHeight: 520,
    xMin: 10,
    xMax: 80,
    showYTickLabels: false,
    stackingMode: 'auto',
    stackGap: 0.25,
    stackTopPaddingRatio: 0.15,
    stackBottomPaddingRatio: 0.05,
  },
  seriesColorsList: ['#111827', '#1d4ed8', '#b91c1c', '#15803d', '#92400e', '#065f46', '#7c3aed', '#be123c', '#0369a1', '#4d7c0f'],
  seriesStrokeWidthsList: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  seriesMarkerSizesList: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  defaultAxisLabels: { x: '2θ (°)', y: 'Intensity (a.u.)' },
}

export const FTIR_DEV_TEMPLATE: ChartTemplate = {
  id: 'internal-ftir-stacked',
  name: '[DEV] Stacked FTIR — Absorbance',
  builtIn: true,
  chartType: 'lineOnly',
  overrides: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    xTitleSize: 16,
    yTitleSize: 16,
    xTickSize: 14,
    yTickSize: 14,
    axisWidth: 1.5,
    axisColor: '#111827',
    showGrid: false,
    boldLabels: false,
    showLegend: true,
    legendMode: 'inline',
    legendFontSize: 12,
    figureWidth: 760,
    figureHeight: 520,
    xMin: 500,
    xMax: 4000,
    xReversed: true,
    showYTickLabels: false,
    stackingMode: 'auto',
    stackGap: 0.20,
    stackTopPaddingRatio: 0.10,
    stackBottomPaddingRatio: 0.05,
  },
  seriesColorsList:      ['#111827', '#1d4ed8', '#b91c1c', '#15803d'],
  seriesStrokeWidthsList: [1.0, 1.0, 1.0, 1.0],
  seriesMarkerSizesList:  [0, 0, 0, 0],
  defaultAxisLabels: { x: 'Wavenumber (cm⁻¹)', y: 'Absorbance (a.u.)' },
}

export const PL_DEV_TEMPLATE_OVERLAY: ChartTemplate = {
  id: 'internal-pl-overlay',
  name: '[DEV] PL Spectra — Overlaid',
  builtIn: true,
  chartType: 'lineOnly',
  overrides: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    xTitleSize: 16,
    yTitleSize: 16,
    xTickSize: 14,
    yTickSize: 14,
    axisWidth: 1.5,
    axisColor: '#111827',
    showGrid: false,
    boldLabels: false,
    showLegend: true,
    legendPosition: 'outside-right',
    legendFontSize: 12,
    legendOrientation: 'v',
    legendBg: false,
    figureWidth: 760,
    figureHeight: 520,
    xMin: 350,
    xMax: 750,
    yMin: 0,
    showYTickLabels: true,
  },
  seriesColorsList: ['#4477AA', '#228833', '#E69F00', '#AA3377'],
  seriesStrokeWidthsList: [1.5, 1.5, 1.5, 1.5],
  seriesMarkerSizesList: [0, 0, 0, 0],
  defaultAxisLabels: { x: 'Wavelength (nm)', y: 'Intensity (a.u.)' },
}

export const PL_DEV_TEMPLATE_STACKED: ChartTemplate = {
  id: 'internal-pl-stacked',
  name: '[DEV] PL Spectra — Stacked',
  builtIn: true,
  chartType: 'lineOnly',
  overrides: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    xTitleSize: 16,
    yTitleSize: 16,
    xTickSize: 14,
    yTickSize: 14,
    axisWidth: 1.5,
    axisColor: '#111827',
    showGrid: false,
    boldLabels: false,
    showLegend: true,
    legendMode: 'inline',
    legendFontSize: 12,
    figureWidth: 760,
    figureHeight: 520,
    xMin: 350,
    xMax: 750,
    showYTickLabels: false,
    stackingMode: 'auto',
    stackGap: 0.20,
    stackTopPaddingRatio: 0.12,
    stackBottomPaddingRatio: 0.05,
  },
  seriesColorsList: ['#4477AA', '#228833', '#E69F00', '#AA3377'],
  seriesStrokeWidthsList: [1.5, 1.5, 1.5, 1.5],
  seriesMarkerSizesList: [0, 0, 0, 0],
  defaultAxisLabels: { x: 'Wavelength (nm)', y: 'Intensity (a.u.)' },
}

export const UVVIS_DEV_TEMPLATE_OVERLAY: ChartTemplate = {
  id: 'internal-uvvis-overlay',
  name: '[DEV] UV–Vis Absorption — Overlaid',
  builtIn: true,
  chartType: 'lineOnly',
  overrides: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    xTitleSize: 16,
    yTitleSize: 16,
    xTickSize: 14,
    yTickSize: 14,
    axisWidth: 1.5,
    axisColor: '#111827',
    showGrid: false,
    boldLabels: false,
    showLegend: true,
    legendPosition: 'outside-right',
    legendFontSize: 12,
    legendOrientation: 'v',
    legendBg: false,
    figureWidth: 760,
    figureHeight: 520,
    xMin: 200,
    xMax: 800,
    yMin: 0,
    showYTickLabels: true,
  },
  seriesColorsList: ['#2166ac', '#ca0020', '#1a9850'],
  seriesStrokeWidthsList: [1.5, 1.5, 1.5],
  seriesMarkerSizesList: [0, 0, 0],
  defaultAxisLabels: { x: 'Wavelength (nm)', y: 'Absorbance (a.u.)' },
}

export const UVVIS_DEV_TEMPLATE_STACKED: ChartTemplate = {
  id: 'internal-uvvis-stacked',
  name: '[DEV] UV–Vis Absorption — Stacked',
  builtIn: true,
  chartType: 'lineOnly',
  overrides: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    xTitleSize: 16,
    yTitleSize: 16,
    xTickSize: 14,
    yTickSize: 14,
    axisWidth: 1.5,
    axisColor: '#111827',
    showGrid: false,
    boldLabels: false,
    showLegend: true,
    legendMode: 'inline',
    legendFontSize: 12,
    figureWidth: 760,
    figureHeight: 520,
    xMin: 200,
    xMax: 800,
    showYTickLabels: false,
    stackingMode: 'auto',
    stackGap: 0.20,
    stackTopPaddingRatio: 0.12,
    stackBottomPaddingRatio: 0.05,
  },
  seriesColorsList: ['#2166ac', '#ca0020', '#1a9850'],
  seriesStrokeWidthsList: [1.5, 1.5, 1.5],
  seriesMarkerSizesList: [0, 0, 0],
  defaultAxisLabels: { x: 'Wavelength (nm)', y: 'Absorbance (a.u.)' },
}

export const DOSE_RESPONSE_DEV_TEMPLATE: ChartTemplate = {
  id: 'internal-dose-response',
  name: '[DEV] Dose–Response (4PL fit)',
  builtIn: true,
  chartType: 'doseResponse',
  overrides: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    xTitleSize: 16,
    yTitleSize: 16,
    xTickSize: 14,
    yTickSize: 14,
    axisWidth: 1.5,
    axisColor: '#111827',
    showGrid: false,
    boldLabels: false,
    showLegend: true,
    legendPosition: 'outside-right',
    legendFontSize: 12,
    legendOrientation: 'v',
    legendBg: false,
    figureWidth: 760,
    figureHeight: 520,
    yMin: 0,
    yMax: 110,
    xScale: 'log',
    showYTickLabels: true,
    showFit: true,
  },
  seriesColorsList: ['#2166ac', '#ca0020'],
  seriesStrokeWidthsList: [1.8, 1.8],
  seriesMarkerSizesList: [5, 5],
  seriesMarkerShapesList: ['circle', 'circle'],
  defaultAxisLabels: { x: 'Concentration (µM)', y: 'Inhibition (%)' },
}

export const BUILTIN_TEMPLATES: ChartTemplate[] = [
  XRD_DEV_TEMPLATE,
  FTIR_DEV_TEMPLATE,
  PL_DEV_TEMPLATE_OVERLAY,
  PL_DEV_TEMPLATE_STACKED,
  UVVIS_DEV_TEMPLATE_OVERLAY,
  UVVIS_DEV_TEMPLATE_STACKED,
  DOSE_RESPONSE_DEV_TEMPLATE,
]

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
