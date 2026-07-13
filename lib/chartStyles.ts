import type { MarkerShape } from './markerShapes'

export type StyleName = 'ACS'
export type LegendPosition = 'top' | 'bottom' | 'left' | 'right'

// User-adjustable overrides applied on top of a base ChartStyle.
// Undefined fields fall back to the base style's values.
export interface StyleOverrides {
  xTitleSize?: number
  yTitleSize?: number
  xTickSize?: number
  yTickSize?: number
  axisWidth?: number
  axisColor?: string
  showGrid?: boolean
  // Bold axis titles and tick labels.
  boldLabels?: boolean
  // Per-series curve/marker colors, keyed by the Y column name.
  seriesColors?: Record<string, string>
  // Manual axis range bounds. Undefined means "auto" (computed from data).
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
  // Fixed tick interval ("pas"). When set, the spacing between
  // graduations stays constant regardless of the chosen range.
  xStep?: number
  yStep?: number
  // Per-series line width, marker size and marker shape, keyed by the Y column name.
  seriesStrokeWidths?: Record<string, number>
  seriesMarkerSizes?: Record<string, number>
  seriesMarkerShapes?: Record<string, MarkerShape>
  // Legend.
  legendFontSize?: number
  legendPosition?: LegendPosition
  showLegend?: boolean
  // Figure size. Undefined means "auto" (fills the available width, default height).
  figureWidth?: number
  figureHeight?: number
  // Font used for all chart text (titles, ticks, legend, annotations).
  // Undefined falls back to the base style's font.
  fontFamily?: string
  // Font size for text annotations added to the figure.
  // Kept separate from tick label size so both can be set independently.
  annotationFontSize?: number
  // Vertical offset (px) for the X and Y axis labels.
  // Positive = move down, negative = move up.
  xLabelDy?: number
  yLabelDy?: number
}

// Curated set of widely-available fonts suitable for publication figures.
export const fontOptions: { value: string; label: string }[] = [
  { value: 'Times New Roman, Times, serif', label: 'Times New Roman' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: '"Helvetica Neue", Helvetica, Arial, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Calibri, sans-serif', label: 'Calibri' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
]

export interface ChartMargin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ChartStyle {
  colors: string[]
  fontFamily: string
  fontSize: number
  tickFontSize: number
  gridColor: string
  showGrid: boolean
  axisColor: string
  axisWidth: number
  strokeWidth: number
  dotRadius: number
  barRadius: number
  labelFontWeight: 'normal' | 'bold'
  labelOffset: number
  margin: ChartMargin
  chartHeight: number
}

export const chartStyles: Record<StyleName, ChartStyle> = {
  // Derived from analysis of a reference ACS Applied Materials & Interfaces figure:
  // bold Helvetica axis titles, compact tick labels, no gridlines, a crisp
  // black axis frame, small solid markers, classic black/red/blue series
  // palette, and tight margins so the plot area fills nearly the whole figure.
  ACS: {
    colors: ['#000000', '#E2211C', '#1F4FA8', '#1B9E4B', '#7B2D8E'],
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: 14,
    tickFontSize: 14,
    gridColor: '#dddddd',
    showGrid: false,
    axisColor: '#000000',
    axisWidth: 1.5,
    strokeWidth: 1.25,
    dotRadius: 3.6,
    barRadius: 0,
    labelFontWeight: 'bold',
    labelOffset: 10,
    margin: { top: 10, right: 16, bottom: 42, left: 76 },
    chartHeight: 440,
  },
}
