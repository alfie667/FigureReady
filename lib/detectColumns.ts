const EXACT_KEYWORDS = ['error', 'err', 'errors', 'erreur', 'erreurs', 'sd', 'std', 'stdev', 'se', 'stderr', 'uncertainty', 'incertitude']
const CONTAINS_KEYWORDS = ['error', 'erreur', 'uncertainty', 'incertitude', 'stderr', 'stdev', 'écart-type', 'ecart-type', 'écart type', 'ecart type']

/**
 * True if a column header looks like it holds ± error/uncertainty values
 * (e.g. "Error", "SD", "Y Error", "Incertitude").
 */
export function isErrorColumn(col: string): boolean {
  const normalized = col.toLowerCase().trim()
  if (EXACT_KEYWORDS.includes(normalized)) return true
  return CONTAINS_KEYWORDS.some(kw => normalized.includes(kw))
}

/** All columns that look like error/uncertainty columns. */
export function detectErrorColumns(columns: string[]): string[] {
  return columns.filter(isErrorColumn)
}

/** First column that looks like an error/uncertainty column, if any. */
export function detectErrorColumn(columns: string[]): string | undefined {
  return columns.find(isErrorColumn)
}

const VALUE_SUFFIXES = ['mean', 'avg', 'average', 'value', 'val']
const SEPARATORS = /[\s_-]+/

/**
 * Reduces a column name to its "base" identity by dropping value/error
 * qualifiers, e.g. "Y1_mean" -> "y1", "Y1_error" -> "y1", "Y1 SD" -> "y1".
 */
function baseName(col: string): string {
  const parts = col.trim().split(SEPARATORS).filter(Boolean)
  const filtered = parts.filter(p => {
    const lower = p.toLowerCase()
    return !VALUE_SUFFIXES.includes(lower) && !isErrorColumn(p)
  })
  return (filtered.length > 0 ? filtered : parts).join(' ').toLowerCase()
}

/**
 * Finds the error column associated with a given Y column, by matching
 * their base names (e.g. "Y1_mean" <-> "Y1_error", "Y1_mean" <-> "Y1_SD").
 */
export function matchErrorColumn(yCol: string, columns: string[]): string | undefined {
  const base = baseName(yCol)
  const candidates = columns.filter(col => col !== yCol && isErrorColumn(col))
  return candidates.find(col => baseName(col) === base)
}
