export type PaletteId = 'okabe-ito' | 'tol-bright' | 'tol-muted' | 'grayscale'

export interface ColorPalette {
  id: PaletteId
  name: string
  colors: string[]
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'okabe-ito',
    name: 'Okabe-Ito',
    colors: ['#000000', '#E69F00', '#56B4E9', '#009E73', '#0072B2', '#D55E00', '#CC79A7'],
  },
  {
    id: 'tol-bright',
    name: 'Tol Bright',
    colors: ['#4477AA', '#EE6677', '#228833', '#CCBB44', '#66CCEE', '#AA3377', '#BBBBBB'],
  },
  {
    id: 'tol-muted',
    name: 'Tol Muted',
    colors: ['#332288', '#117733', '#44AA99', '#88CCEE', '#DDCC77', '#CC6677', '#AA4499', '#882255'],
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    colors: ['#000000', '#333333', '#555555', '#777777', '#999999', '#BBBBBB', '#DDDDDD'],
  },
]

export function getPaletteById(id: PaletteId): ColorPalette | undefined {
  return COLOR_PALETTES.find(p => p.id === id)
}

export function getPaletteColor(paletteId: PaletteId, index: number): string {
  const palette = getPaletteById(paletteId)
  if (!palette) return '#000000'
  return palette.colors[index % palette.colors.length]
}
