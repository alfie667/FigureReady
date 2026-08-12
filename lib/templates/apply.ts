import type { StyleOverrides } from '../chartStyles'
import type { MarkerShape } from '../markerShapes'
import type { FigureTemplate } from './types'

function remapIndexed<T>(list: T[] | undefined, yCols: string[]): Record<string, T> | undefined {
  if (!list || list.length === 0 || yCols.length === 0) return undefined
  return Object.fromEntries(yCols.map((col, i) => [col, list[i % list.length]]))
}

export function buildTemplateOverrides(
  tpl: Pick<
    FigureTemplate,
    'overrides' | 'seriesColorsList' | 'seriesStrokeWidthsList' | 'seriesMarkerSizesList' | 'seriesMarkerShapesList'
  >,
  yCols: string[]
): StyleOverrides {
  const overrides: StyleOverrides = { ...tpl.overrides }

  const colors = remapIndexed(tpl.seriesColorsList, yCols)
  const widths = remapIndexed(tpl.seriesStrokeWidthsList, yCols)
  const sizes = remapIndexed(tpl.seriesMarkerSizesList, yCols)
  const shapes = remapIndexed(tpl.seriesMarkerShapesList as MarkerShape[] | undefined, yCols)

  if (colors) overrides.seriesColors = colors
  if (widths) overrides.seriesStrokeWidths = widths
  if (sizes) overrides.seriesMarkerSizes = sizes
  if (shapes) overrides.seriesMarkerShapes = shapes

  return overrides
}
