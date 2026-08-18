export type ChartElementType =
  | 'figure'
  | 'series'
  | 'xAxisLabel'
  | 'yAxisLabel'
  | 'xAxisTicks'
  | 'yAxisTicks'
  | 'legend'

export interface SelectedChartElement {
  type: ChartElementType
  seriesKey?: string // when type === 'series'
}
