export interface TextAnnotation {
  id: string
  type: 'text'
  text: string
  xPct: number
  yPct: number
}

export interface ArrowAnnotation {
  id: string
  type: 'arrow'
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

export type ChartAnnotation = TextAnnotation | ArrowAnnotation | RectAnnotation
