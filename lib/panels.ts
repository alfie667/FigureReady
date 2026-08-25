import type { ChartAnnotation } from './annotations'
import type { StyleOverrides } from './chartStyles'
import type { ChartType } from './templateStorage'

export type PanelLayout = '1' | '2h' | '2v' | '4' | '3h'

export interface PanelConfig {
  id: string
  data: Record<string, unknown>[]
  columns: string[]
  xCol: string
  yCols: string[]
  chartType: ChartType
  styleOverrides: StyleOverrides
  seriesNames: Record<string, string>
  errorCols: Record<string, string>
  xAxisLabel: string
  yAxisLabel: string
  annotations: ChartAnnotation[]
}

export interface PanelLabelConfig {
  format: 'none' | 'uppercase' | 'lowercase' | 'paren-lower' | 'paren-upper'
  //                A              a             (a)              (A)
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  fontSize: number
}

export interface ComposerConfig {
  gapH: number          // horizontal gap between panels (px)
  gapV: number          // vertical gap between panels (px)
  paddingH: number      // outer horizontal padding (px)
  paddingV: number      // outer vertical padding (px)
  figureWidthMm: number // physical output width — used to compute real pixel resolution on export
}

export const DEFAULT_LABEL_CONFIG: PanelLabelConfig = {
  format: 'paren-lower',
  position: 'top-left',
  fontSize: 13,
}

export const DEFAULT_COMPOSER_CONFIG: ComposerConfig = {
  gapH: 20,
  gapV: 20,
  paddingH: 24,
  paddingV: 24,
  figureWidthMm: 180,
}

export function getLayoutCount(layout: PanelLayout): number {
  if (layout === '1') return 1
  if (layout === '4') return 4
  if (layout === '3h') return 3
  return 2
}

const LABEL_BASE = ['a', 'b', 'c', 'd'] as const

export function getLabelText(index: number, config: PanelLabelConfig): string {
  const char = index < LABEL_BASE.length
    ? LABEL_BASE[index]
    : String.fromCharCode(97 + index)
  switch (config.format) {
    case 'none':        return ''
    case 'uppercase':   return char.toUpperCase()
    case 'lowercase':   return char
    case 'paren-lower': return `(${char})`
    case 'paren-upper': return `(${char.toUpperCase()})`
  }
}

// Kept for panel ID assignment (not display labels — use getLabelText for that).
export const PANEL_LABELS = ['A', 'B', 'C', 'D'] as const

// Presentation-only keys safe to harmonize across panels.
// NEVER includes scientific/data properties: ranges, scales, stacking, fit, colors, series visibility.
export const HARMONIZABLE_KEYS: ReadonlyArray<keyof StyleOverrides> = [
  'fontFamily',
  'xTitleSize',
  'yTitleSize',
  'xTickSize',
  'yTickSize',
  'boldLabels',
  'axisWidth',
  'showGrid',
  'legendFontSize',
  'annotationFontSize',
]
