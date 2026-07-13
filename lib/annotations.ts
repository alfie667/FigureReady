export interface TextAnnotation {
  id: string
  type: 'text'
  text: string
  xPct: number
  yPct: number
}

// Legacy – kept for backward compat. Rendered as a solid arrow.
export interface ArrowAnnotation {
  id: string
  type: 'arrow'
  x1Pct: number
  y1Pct: number
  x2Pct: number
  y2Pct: number
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
}

export interface RectAnnotation {
  id: string
  type: 'rect'
  xPct: number
  yPct: number
  widthPct: number
  heightPct: number
}

export interface EllipseAnnotation {
  id: string
  type: 'ellipse'
  xPct: number
  yPct: number
  widthPct: number
  heightPct: number
}

export type ChartAnnotation =
  | TextAnnotation
  | ArrowAnnotation
  | LineAnnotation
  | RectAnnotation
  | EllipseAnnotation
