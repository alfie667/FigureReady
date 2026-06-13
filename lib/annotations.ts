export interface ChartAnnotation {
  id: string
  text: string
  // Position as a percentage of the chart container, so it stays
  // aligned with the figure across different sizes/exports.
  xPct: number
  yPct: number
}
