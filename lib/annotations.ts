export interface TextAnnotation {
  id: string
  type: 'text'
  text: string
  xPct: number
  yPct: number
  color?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
}

// Legacy – kept for backward compat. Rendered as a solid arrow.
export interface ArrowAnnotation {
  id: string
  type: 'arrow'
  x1Pct: number
  y1Pct: number
  x2Pct: number
  y2Pct: number
  color?: string
  strokeWidth?: number
}

// Full-featured line: solid/dashed, optional arrowheads at each end.
export interface LineAnnotation {
  id: string
  type: 'line'
  dash: boolean
  headStart: boolean
  headEnd: boolean
  x1Pct: number
  y1Pct: number
  x2Pct: number
  y2Pct: number
  color?: string
  strokeWidth?: number
}

export interface RectAnnotation {
  id: string
  type: 'rect'
  xPct: number
  yPct: number
  widthPct: number
  heightPct: number
  fillColor?: string
  fillOpacity?: number
  borderColor?: string
  borderWidth?: number
}

export interface EllipseAnnotation {
  id: string
  type: 'ellipse'
  xPct: number
  yPct: number
  widthPct: number
  heightPct: number
  fillColor?: string
  fillOpacity?: number
  borderColor?: string
  borderWidth?: number
}

export interface PeakLabelAnnotation {
  id: string
  type: 'peak-label'
  text: string
  dataX: number
  dataY: number
  seriesKey?: string
  // Label offset from anchor in % of chart container (draggable)
  offsetXPct: number
  offsetYPct: number
  leaderLine: boolean
  color?: string
  fontSize?: number
}

export type ChartAnnotation =
  | TextAnnotation
  | ArrowAnnotation
  | LineAnnotation
  | RectAnnotation
  | EllipseAnnotation
  | PeakLabelAnnotation
