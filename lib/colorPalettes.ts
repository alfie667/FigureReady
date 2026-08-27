// ── Palette types ─────────────────────────────────────────────────────────────

export type PaletteId =
  | 'classic'        // ACS-style: black, red, blue, green, purple
  | 'modern'         // ColorBrewer Paired dark subset — Cynthia Brewer
  | 'high-contrast'  // Matplotlib tab10 / Tableau — maximally distinct
  | 'okabe-ito'      // Okabe & Ito 2008 — colorblind universal design
  | 'tol-bright'     // Paul Tol Bright — SRON/EPS/TN/09-002
  | 'tol-muted'      // Paul Tol Muted — SRON/EPS/TN/09-002
  | 'viridis'        // Viridis — Smith & van der Walt 2015 (Matplotlib)
  | 'plasma'         // Plasma — Ibáñez, Schewe & Wunsche 2018 (Matplotlib)
  | 'blues'          // ColorBrewer Blues — Cynthia Brewer
  | 'rdbu'           // ColorBrewer RdBu — diverging red↔blue
  | 'coolwarm'       // Moreland Cool-Warm diverging — K. Moreland 2009
  | 'grayscale'      // Monochrome — perceptually even steps

export type PaletteCategory = 'scientific' | 'colorblind' | 'sequential' | 'diverging' | 'monochrome'

export interface ColorPalette {
  id: PaletteId
  name: string
  category: PaletteCategory
  colors: string[]
}

// ── Palette definitions ───────────────────────────────────────────────────────

export const COLOR_PALETTES: ColorPalette[] = [

  // ── Scientific ───────────────────────────────────────────────────────────────

  {
    id: 'classic',
    name: 'Classic',
    category: 'scientific',
    // ACS-style palette: black + saturated primaries. Standard for chemistry/physics publications.
    // Black as series-1 matches the ACS single-curve convention (main data = black line).
    colors: ['#000000', '#C0392B', '#1F4FA8', '#1E8449', '#6C3483', '#D68910', '#117A65'],
  },
  {
    id: 'modern',
    name: 'Modern',
    category: 'scientific',
    // ColorBrewer "Paired" dark subset — Cynthia Brewer, colorbrewer2.org
    // Saturated but publication-quality; good for multi-series line charts.
    colors: ['#1F78B4', '#33A02C', '#E31A1C', '#FF7F00', '#6A3D9A', '#B15928', '#A6CEE3'],
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    category: 'scientific',
    // Matplotlib default ("tab10") — origins in Tableau.
    // Designed for maximum visual distinctiveness across series.
    colors: ['#1F77B4', '#D62728', '#2CA02C', '#FF7F0E', '#9467BD', '#8C564B', '#17BECF'],
  },

  // ── Colorblind Safe ──────────────────────────────────────────────────────────

  {
    id: 'okabe-ito',
    name: 'Okabe-Ito',
    category: 'colorblind',
    // Okabe & Ito (2008), "Color Universal Design (CUD)" — iamcal.com/color-blind/
    // Recommended by Nature Methods (doi:10.1038/nmeth.1618).
    // #F0E442 yellow omitted (low contrast on white). Black moved to last position.
    colors: ['#E69F00', '#56B4E9', '#009E73', '#0072B2', '#D55E00', '#CC79A7', '#000000'],
  },
  {
    id: 'tol-bright',
    name: 'Tol Bright',
    category: 'colorblind',
    // Paul Tol, SRON Technical Note SRON/EPS/TN/09-002 — personal.sron.nl/~pault/
    // Optimised for categorical data, distinct under common colour-vision deficiencies.
    colors: ['#4477AA', '#EE6677', '#228833', '#CCBB44', '#66CCEE', '#AA3377', '#BBBBBB'],
  },
  {
    id: 'tol-muted',
    name: 'Tol Muted',
    category: 'colorblind',
    // Paul Tol, SRON Technical Note SRON/EPS/TN/09-002 — personal.sron.nl/~pault/
    // Lower saturation; optimised for print and colourblind readers. 8 colours.
    colors: ['#332288', '#117733', '#44AA99', '#88CCEE', '#DDCC77', '#CC6677', '#AA4499', '#882255'],
  },

  // ── Sequential ───────────────────────────────────────────────────────────────

  {
    id: 'viridis',
    name: 'Viridis',
    category: 'sequential',
    // Smith & van der Walt (2015), Matplotlib — perceptually uniform, colorblind-safe.
    // matplotlib.org/stable/gallery/color/colormap_reference.html
    // Sampled at t = 0.0, 0.2, 0.4, 0.6, 0.8, 1.0
    colors: ['#440154', '#3B518B', '#21908C', '#5DC963', '#ADDC30', '#FDE725'],
  },
  {
    id: 'plasma',
    name: 'Plasma',
    category: 'sequential',
    // Ibáñez, Schewe & Wunsche (2018), Matplotlib — perceptually uniform.
    // Sampled at t = 0.0, 0.2, 0.4, 0.6, 0.8, 1.0
    colors: ['#0D0887', '#6A00A8', '#B12A90', '#E16462', '#FCA636', '#F0F921'],
  },
  {
    id: 'blues',
    name: 'Blues',
    category: 'sequential',
    // ColorBrewer "Blues" (6-class) — Cynthia Brewer, colorbrewer2.org
    // Dark-to-light; first series = darkest = most prominent.
    colors: ['#084594', '#2171B5', '#4292C6', '#6BAED6', '#9ECAE1', '#C6DBEF'],
  },

  // ── Diverging ────────────────────────────────────────────────────────────────

  {
    id: 'rdbu',
    name: 'Red ↔ Blue',
    category: 'diverging',
    // ColorBrewer "RdBu" (7-class) — Cynthia Brewer, colorbrewer2.org
    // Red = negative/low, neutral = white, Blue = positive/high.
    colors: ['#B2182B', '#D6604D', '#F4A582', '#F7F7F7', '#92C5DE', '#4393C3', '#2166AC'],
  },
  {
    id: 'coolwarm',
    name: 'Cool ↔ Warm',
    category: 'diverging',
    // Moreland (2009), "Diverging Color Maps for Scientific Visualization"
    // kennethmoreland.com/color-maps/
    colors: ['#3B4CC0', '#688AEF', '#99BAF9', '#F7F7F7', '#F6A385', '#E0432B', '#B40426'],
  },

  // ── Monochrome ───────────────────────────────────────────────────────────────

  {
    id: 'grayscale',
    name: 'Grayscale',
    category: 'monochrome',
    // Perceptually even steps — avoids near-white values that vanish on white backgrounds.
    colors: ['#000000', '#2D2D2D', '#555555', '#7A7A7A', '#A0A0A0', '#C4C4C4'],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getPaletteById(id: PaletteId): ColorPalette | undefined {
  return COLOR_PALETTES.find(p => p.id === id)
}

/**
 * Resolve n series colors from a palette.
 *
 * - Categorical (scientific / colorblind / monochrome): colors used in order, cycling if n > length.
 * - Sequential / diverging: colors spread evenly so 2 series get palette extremes, not neighbors.
 *
 * This prevents e.g. Viridis series 1 & 2 being nearly identical purple shades.
 */
export function resolveSeriesColors(palette: ColorPalette, n: number): string[] {
  const c = palette.colors
  if (n <= 0) return []
  if (n === 1) return [c[0]]

  if (palette.category === 'sequential' || palette.category === 'diverging') {
    if (n >= c.length) return Array.from({ length: n }, (_, i) => c[i % c.length])
    return Array.from({ length: n }, (_, i) =>
      c[Math.round((i / (n - 1)) * (c.length - 1))]
    )
  }

  return Array.from({ length: n }, (_, i) => c[i % c.length])
}

// Legacy helper — prefer resolveSeriesColors for multi-series charts.
export function getPaletteColor(paletteId: PaletteId, index: number): string {
  const p = getPaletteById(paletteId)
  if (!p) return '#000000'
  return p.colors[index % p.colors.length]
}
