import type { StyleOverrides } from './chartStyles'
import type { ChartType } from './templateStorage'

export type PanelLayout = '1' | '2h' | '2v' | '4'

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
}

export function getLayoutCount(layout: PanelLayout): number {
  return layout === '1' ? 1 : layout === '4' ? 4 : 2
}

export const PANEL_LABELS = ['A', 'B', 'C', 'D'] as const
