import type { ChartType } from './templateStorage'
import type { StyleOverrides } from './chartStyles'
import type { MarkerShape } from './markerShapes'
import type { PaletteId } from './colorPalettes'

export interface SmartTemplate {
  id: string
  name: string
  tagline: string
  bullets: string[]
  workflowType: 'ftir-stacked' | 'xrd-stacked' | 'dose-response'
  previewImage: string
  // ChartTemplate-compatible fields — passed directly to buildTemplateOverrides()
  chartType: ChartType
  overrides: StyleOverrides
  seriesColorsList: string[]
  seriesStrokeWidthsList: number[]
  seriesMarkerSizesList: number[]
  seriesMarkerShapesList?: MarkerShape[]
  seriesYOffsetsList?: number[]
  paletteId?: PaletteId
  defaultXLabel: string
  defaultYLabel: string
}

export const SMART_TEMPLATES: SmartTemplate[] = [
  {
    id: 'smart-ftir-stacked',
    name: 'FTIR Stacked',
    tagline: 'Automatically organize and vertically offset multiple FTIR spectra.',
    bullets: [
      'Auto vertical offset — no manual Y editing in Excel',
      'Publication-ready wavenumber axis (4000→500 cm⁻¹)',
      'Inline spectrum labels',
    ],
    workflowType: 'ftir-stacked',
    previewImage: '/templates/smart/ftir-stacked.png',
    chartType: 'lineOnly',
    overrides: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      xTitleSize: 16, yTitleSize: 16, xTickSize: 14, yTickSize: 14,
      axisWidth: 1.5, axisColor: '#111827',
      showGrid: false, boldLabels: false,
      showLegend: true, legendMode: 'inline', legendFontSize: 12,
      figureWidth: 760, figureHeight: 520,
      xMin: 500, xMax: 4000, xReversed: true,
      showYTickLabels: false,
      stackingMode: 'auto', stackGap: 0.20,
      stackTopPaddingRatio: 0.10, stackBottomPaddingRatio: 0.05,
    },
    seriesColorsList: ['#111827', '#1d4ed8', '#b91c1c', '#15803d', '#7c3aed', '#92400e', '#0891b2', '#be185d'],
    seriesStrokeWidthsList: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    seriesMarkerSizesList:  [0, 0, 0, 0, 0, 0, 0, 0],
    defaultXLabel: 'Wavenumber (cm⁻¹)',
    defaultYLabel: 'Absorbance (a.u.)',
  },
  {
    id: 'smart-xrd-stacked',
    name: 'XRD Stacked',
    tagline: 'Stack diffraction patterns with automatic spacing and publication-ready formatting.',
    bullets: [
      'Auto vertical offset — no manual Y editing',
      'Publication-ready 2θ axis (10°–80°)',
      'Up to 10 diffraction patterns',
    ],
    workflowType: 'xrd-stacked',
    previewImage: '/templates/smart/xrd-stacked.png',
    chartType: 'lineOnly',
    overrides: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      xTitleSize: 16, yTitleSize: 16, xTickSize: 14, yTickSize: 14,
      axisWidth: 1.5, axisColor: '#111827',
      showGrid: false, boldLabels: false,
      showLegend: true, legendPosition: 'outside-right', legendFontSize: 12,
      legendOrientation: 'v', legendBg: false,
      figureWidth: 760, figureHeight: 520,
      xMin: 10, xMax: 80,
      showYTickLabels: false,
      stackingMode: 'auto', stackGap: 0.25,
      stackTopPaddingRatio: 0.15, stackBottomPaddingRatio: 0.05,
    },
    seriesColorsList: ['#111827', '#1d4ed8', '#b91c1c', '#15803d', '#92400e', '#065f46', '#7c3aed', '#be123c', '#0369a1', '#4d7c0f'],
    seriesStrokeWidthsList: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    seriesMarkerSizesList:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    defaultXLabel: '2θ (°)',
    defaultYLabel: 'Intensity (a.u.)',
  },
  {
    id: 'smart-dose-response',
    name: 'Dose–Response 4PL',
    tagline: 'Fit concentration-response data and generate experimental points, error bars, and 4PL curves automatically.',
    bullets: [
      'Automatic 4-parameter logistic (4PL) curve fitting',
      'Log-concentration axis with experimental points + error bars',
      'IC₅₀ / EC₅₀ displayed in the Fit Results panel',
    ],
    workflowType: 'dose-response',
    previewImage: '/templates/smart/dose-response.png',
    chartType: 'doseResponse',
    overrides: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      xTitleSize: 16, yTitleSize: 16, xTickSize: 14, yTickSize: 14,
      axisWidth: 1.5, axisColor: '#111827',
      showGrid: false, boldLabels: false,
      showLegend: true, legendPosition: 'outside-right', legendFontSize: 12,
      legendOrientation: 'v', legendBg: false,
      figureWidth: 760, figureHeight: 520,
      yMin: 0, yMax: 110, xScale: 'log',
      showYTickLabels: true, showFit: true,
    },
    seriesColorsList: ['#2166ac', '#ca0020', '#1a9850', '#7b2d8b'],
    seriesStrokeWidthsList: [1.8, 1.8, 1.8, 1.8],
    seriesMarkerSizesList:  [5, 5, 5, 5],
    seriesMarkerShapesList: ['circle', 'circle', 'circle', 'circle'] as MarkerShape[],
    defaultXLabel: 'Concentration (µM)',
    defaultYLabel: 'Inhibition (%)',
  },
]
