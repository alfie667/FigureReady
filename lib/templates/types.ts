import type { ChartTemplate } from '../templateStorage'

export interface DataRoles {
  x: boolean
  y: boolean
  group?: boolean
  error?: boolean
}

export interface FigureTemplate extends ChartTemplate {
  description: string
  category: 'dose-response' | 'time-course' | 'comparison' | 'correlation' | 'spectra'
  previewImage: string
  requiredDataRoles: DataRoles
  defaultAxisLabels?: { x?: string; y?: string }
}
