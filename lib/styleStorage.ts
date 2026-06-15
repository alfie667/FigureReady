import type { StyleOverrides } from './chartStyles'

const STORAGE_KEY = 'figureready-default-style'

// Fields that depend on the current dataset's columns and shouldn't be
// carried over as part of a saved default style.
const PER_SERIES_KEYS: (keyof StyleOverrides)[] = [
  'seriesColors',
  'seriesStrokeWidths',
  'seriesMarkerSizes',
  'seriesMarkerShapes',
]

export function loadDefaultStyle(): StyleOverrides | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StyleOverrides) : null
  } catch {
    return null
  }
}

export function saveDefaultStyle(overrides: StyleOverrides) {
  if (typeof window === 'undefined') return
  const toSave = { ...overrides }
  for (const key of PER_SERIES_KEYS) delete toSave[key]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
}
