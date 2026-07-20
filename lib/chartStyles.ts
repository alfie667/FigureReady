import type { MarkerShape } from './markerShapes'

export type StyleName = 'ACS' | 'Nature' | 'Elsevier'
export type LegendPosition = 'top' | 'bottom' | 'left' | 'right'

export interface StyleOverrides {
  xTitleSize?: number
  yTitleSize?: number
  xTickSize?: number
  yTickSize?: number
  axisWidth?: number
  axisColor?: string
  showGrid?: boolean
  boldLabels?: boolean
  seriesColors?: Record<string, string>
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
  xStep?: number
  yStep?: number
  seriesStrokeWidths?: Record<string, number>
  seriesMarkerSizes?: Record<string, number>
  seriesMarkerShapes?: Record<string, MarkerShape>
  legendFontSize?: number
  legendPosition?: LegendPosition
  showLegend?: boolean
  figureWidth?: number
  figureHeight?: number
  fontFamily?: string
  annotationFontSize?: number
  xLabelDx?: number
  xLabelDy?: number
  yLabelDx?: number
  yLabelDy?: number
  legendXPct?: number
  legendYPct?: number
  legendOrientation?: 'h' | 'v'
  legendBg?: boolean
}

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
  ACS: {
    colors: ['#000000', '#E2211C', '#1F4FA8', '#1B9E4B', '#7B2D8E'],
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 18,
    tickFontSize: 16,
    gridColor: '#dddddd',
    showGrid: false,
    axisColor: '#000000',
    axisWidth: 1.5,
    strokeWidth: 1.5,
    dotRadius: 4,
    barRadius: 0,
    labelFontWeight: 'bold',
    labelOffset: 10,
    margin: { top: 12, right: 20, bottom: 56, left: 88 },
    chartHeight: 440,
  },
  Nature: {
    colors: ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#56B4E9'],
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 18,
    tickFontSize: 16,
    gridColor: '#eeeeee',
    showGrid: false,
    axisColor: '#000000',
    axisWidth: 1,
    strokeWidth: 1.5,
    dotRadius: 4,
    barRadius: 0,
    labelFontWeight: 'normal',
    labelOffset: 10,
    margin: { top: 12, right: 20, bottom: 56, left: 88 },
    chartHeight: 440,
  },
  Elsevier: {
    colors: ['#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD'],
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 18,
    tickFontSize: 16,
    gridColor: '#e0e0e0',
    showGrid: true,
    axisColor: '#333333',
    axisWidth: 1,
    strokeWidth: 1.5,
    dotRadius: 4,
    barRadius: 2,
    labelFontWeight: 'normal',
    labelOffset: 10,
    margin: { top: 12, right: 20, bottom: 56, left: 88 },
    chartHeight: 440,
  },
}

export const journalStyles: { name: StyleName; label: string; colors: string[] }[] = [
  { name: 'ACS',      label: 'ACS',      colors: ['#000000', '#E2211C', '#1F4FA8'] },
  { name: 'Nature',   label: 'Nature',   colors: ['#0072B2', '#E69F00', '#009E73'] },
  { name: 'Elsevier', label: 'Elsevier', colors: ['#1F77B4', '#FF7F0E', '#2CA02C'] },
]
