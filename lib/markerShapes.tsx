import type { Key } from 'react'

export type MarkerShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'cross'

export const markerShapeOptions: { value: MarkerShape; label: string }[] = [
  { value: 'circle', label: 'Cercle' },
  { value: 'square', label: 'Carré' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'diamond', label: 'Losange' },
  { value: 'cross', label: 'Croix' },
]

// Renders a marker shape centered at (cx, cy) with the given "radius" size.
// Used as a custom dot/shape renderer for Recharts Line and Scatter so we
// can support shapes beyond Recharts' built-in circle dot.
export function renderMarker(cx: number, cy: number, shape: MarkerShape, size: number, color: string, key?: Key) {
  if (size <= 0) return undefined
  switch (shape) {
    case 'square':
      return <rect key={key} x={cx - size} y={cy - size} width={size * 2} height={size * 2} fill={color} />
    case 'triangle': {
      const points = `${cx},${cy - size} ${cx - size * 0.866},${cy + size * 0.5} ${cx + size * 0.866},${cy + size * 0.5}`
      return <polygon key={key} points={points} fill={color} />
    }
    case 'diamond': {
      const points = `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`
      return <polygon key={key} points={points} fill={color} />
    }
    case 'cross': {
      const t = size * 0.35
      const d = `M ${cx - t} ${cy - size} H ${cx + t} V ${cy - t} H ${cx + size} V ${cy + t} H ${cx + t} V ${cy + size} H ${cx - t} V ${cy + t} H ${cx - size} V ${cy - t} H ${cx - t} Z`
      return <path key={key} d={d} fill={color} />
    }
    default:
      return <circle key={key} cx={cx} cy={cy} r={size} fill={color} />
  }
}
