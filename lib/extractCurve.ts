import * as XLSX from 'xlsx'

export interface RGB {
  r: number
  g: number
  b: number
}

export interface DataPoint {
  x: number
  y: number
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2)
}

interface ColorBucket {
  count: number
  r: number
  g: number
  b: number
}

/**
 * Guesses the color of the plotted curve: the most frequent non-white,
 * non-grayscale color in the image (axes, gridlines, text and background
 * are typically black, gray or white). Falls back to the most frequent
 * non-white color if no saturated color is found (e.g. a black curve).
 */
export function detectCurveColor(imageData: ImageData): RGB {
  const { data } = imageData
  const colored = new Map<string, ColorBucket>()
  const nonWhite = new Map<string, ColorBucket>()

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    if (max > 235 && min > 235) continue // background (near-white)

    const key = `${Math.round(r / 16)}-${Math.round(g / 16)}-${Math.round(b / 16)}`
    addToBucket(nonWhite, key, r, g, b)

    if (max - min > 25) { // saturated (non-grayscale) pixel
      addToBucket(colored, key, r, g, b)
    }
  }

  const best = pickLargestBucket(colored) ?? pickLargestBucket(nonWhite)
  if (!best) return { r: 0, g: 0, b: 0 }
  return { r: Math.round(best.r / best.count), g: Math.round(best.g / best.count), b: Math.round(best.b / best.count) }
}

function addToBucket(map: Map<string, ColorBucket>, key: string, r: number, g: number, b: number) {
  const entry = map.get(key)
  if (entry) {
    entry.count++
    entry.r += r
    entry.g += g
    entry.b += b
  } else {
    map.set(key, { count: 1, r, g, b })
  }
}

function pickLargestBucket(map: Map<string, ColorBucket>): ColorBucket | null {
  let best: ColorBucket | null = null
  for (const entry of map.values()) {
    if (!best || entry.count > best.count) best = entry
  }
  return best
}

/**
 * Scans the image column by column for pixels matching the target color and
 * returns one point per column, in pixel coordinates (Y is flipped so that
 * up in the image means a higher value, matching a standard chart).
 *
 * Matching pixels in a column are grouped into clusters of consecutive rows
 * (allowing small gaps from anti-aliasing) and only the largest cluster is
 * kept, so stray same-colored pixels elsewhere (text, legend, ticks) don't
 * skew the result.
 */
export function extractCurvePoints(imageData: ImageData, target: RGB, tolerance: number): DataPoint[] {
  const { width, height, data } = imageData
  const points: DataPoint[] = []

  for (let px = 0; px < width; px++) {
    const matches: number[] = []
    for (let py = 0; py < height; py++) {
      const idx = (py * width + px) * 4
      const color: RGB = { r: data[idx], g: data[idx + 1], b: data[idx + 2] }
      if (colorDistance(color, target) <= tolerance) {
        matches.push(py)
      }
    }
    if (matches.length === 0) continue

    let bestCluster: number[] = []
    let current: number[] = [matches[0]]
    for (let i = 1; i < matches.length; i++) {
      if (matches[i] - matches[i - 1] <= 2) {
        current.push(matches[i])
      } else {
        if (current.length > bestCluster.length) bestCluster = current
        current = [matches[i]]
      }
    }
    if (current.length > bestCluster.length) bestCluster = current

    const avgPy = bestCluster.reduce((a, b) => a + b, 0) / bestCluster.length
    points.push({ x: px, y: height - avgPy })
  }

  return points
}

export function exportPointsToExcel(
  points: DataPoint[],
  xLabel: string,
  yLabel: string,
  filename = 'extracted_data.xlsx'
) {
  const rows = points.map(p => ({ [xLabel]: p.x, [yLabel]: p.y }))
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
  XLSX.writeFile(workbook, filename)
}
