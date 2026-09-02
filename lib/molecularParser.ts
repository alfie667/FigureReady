// Molecular formula parser and molar mass calculator.
//
// Supported syntax (V1):
//   • Elements: single- and multi-letter symbols (H, He, C, Na, Fe, ...)
//   • Counts:   H2O, C6H12O6, CaCO3
//   • Parentheses (any depth): Ca(OH)2, Fe2(SO4)3, Al2(SO4)3
//   • Hydrates:  CuSO4·5H2O  (U+00B7 middle dot)
//                CuSO4.5H2O  (ASCII period when followed by digit+element)
//
// NOT supported (explicit errors):
//   • Ionic charges:     Ca2+, SO4²⁻
//   • Isotopic notation: ²H, ¹⁴C, [14C]
//   • Fractional counts: C3.5H5
//   • Leading coefficient at top level: 2H2O (valid only after hydrate separator)
//   • Zero counts:       C0H2

import { ELEMENTS, type ElementData } from './atomicWeights'

// ── Public types ──────────────────────────────────────────────────────────────

export interface ElementEntry {
  symbol:       string
  name:         string
  count:        number
  atomicMass:   number  // g/mol (IUPAC 2021)
  contribution: number  // count × atomicMass, rounded to 4 dp
  massFraction: number  // 0–100 %, rounded to 2 dp
  radioactive:  boolean
}

export interface ParseSuccess {
  ok:         true
  molarMass:  number         // g/mol, rounded to 4 decimal places
  formula:    string         // original (trimmed) input
  elements:   ElementEntry[] // sorted by Hill order (C first, H second, then alphabetical)
}

export interface ParseFailure {
  ok:    false
  error: string
}

export type ParseResult = ParseSuccess | ParseFailure

// ── Tokeniser ─────────────────────────────────────────────────────────────────

type Token =
  | { t: 'el';  sym: string }
  | { t: 'num'; val: number }
  | { t: 'lp' }
  | { t: 'rp' }

function tokenise(s: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (ch >= 'A' && ch <= 'Z') {
      let sym = ch
      i++
      while (i < s.length && s[i] >= 'a' && s[i] <= 'z') {
        sym += s[i++]
      }
      tokens.push({ t: 'el', sym })
    } else if (ch >= '0' && ch <= '9') {
      let num = ''
      while (i < s.length && s[i] >= '0' && s[i] <= '9') num += s[i++]
      tokens.push({ t: 'num', val: parseInt(num, 10) })
    } else if (ch === '(') {
      tokens.push({ t: 'lp' })
      i++
    } else if (ch === ')') {
      tokens.push({ t: 'rp' })
      i++
    } else {
      throw new Error(`Unsupported character "${ch}" in formula.`)
    }
  }
  return tokens
}

// ── Recursive descent parser ──────────────────────────────────────────────────

// Returns [atom-count map, new position]. Stops at ')' or end of tokens.
function parseGroup(tokens: Token[], pos: number): [Map<string, number>, number] {
  const counts = new Map<string, number>()

  while (pos < tokens.length) {
    const tok = tokens[pos]
    if (tok.t === 'rp') break

    if (tok.t === 'lp') {
      pos++ // consume '('
      const [inner, nextPos] = parseGroup(tokens, pos)
      pos = nextPos
      if (pos >= tokens.length || tokens[pos].t !== 'rp') {
        throw new Error('Unmatched opening parenthesis "(".')
      }
      pos++ // consume ')'
      let mult = 1
      if (pos < tokens.length && tokens[pos].t === 'num') {
        mult = (tokens[pos] as { t: 'num'; val: number }).val
        pos++
      }
      inner.forEach((n, sym) => counts.set(sym, (counts.get(sym) ?? 0) + n * mult))

    } else if (tok.t === 'el') {
      const sym = tok.sym
      pos++
      let count = 1
      if (pos < tokens.length && tokens[pos].t === 'num') {
        count = (tokens[pos] as { t: 'num'; val: number }).val
        pos++
        if (count === 0) throw new Error(`Zero atom count is not valid: "${sym}0".`)
      }
      counts.set(sym, (counts.get(sym) ?? 0) + count)

    } else if (tok.t === 'num') {
      // A bare number that isn't a count after an element or after ')' is invalid.
      throw new Error(
        `Unexpected number in formula. For hydrates use the middle dot separator, e.g. CuSO4·5H2O.`,
      )
    } else {
      // Unexpected rparen handled at loop top; should not reach here.
      throw new Error('Unexpected ")" — unmatched closing parenthesis.')
    }
  }

  return [counts, pos]
}

// ── Hydrate splitting ─────────────────────────────────────────────────────────

// Splits on · (U+00B7, middle dot) or on a literal '.' that is followed by
// a digit and then a capital letter (unambiguous hydrate separator).
// Returns the parts as-is; the caller strips leading coefficients from parts[1+].
function splitHydrate(formula: string): string[] {
  if (formula.includes('·')) {
    return formula.split('·')
  }
  const m = formula.match(/^(.*?)\.(\d+[A-Z].*)$/)
  if (m) return [m[1], m[2]]
  return [formula]
}

// Extracts an optional leading integer coefficient from a hydrate component.
// Only called for parts after the separator (parts[1+]).
function extractCoefficient(s: string): [number, string] {
  const m = s.match(/^(\d+)([A-Z(].*)$/)
  if (m) return [parseInt(m[1], 10), m[2]]
  return [1, s]
}

// ── Single-component parser ───────────────────────────────────────────────────

function parseComponent(formulaPart: string): Map<string, number> {
  if (formulaPart.length === 0) throw new Error('Empty formula part.')
  if (/^\d/.test(formulaPart)) {
    throw new Error(
      `Formula cannot start with a number. For hydrates use the middle dot separator, e.g. CuSO4·5H2O.`,
    )
  }
  const tokens = tokenise(formulaPart)
  const [counts, finalPos] = parseGroup(tokens, 0)
  if (finalPos < tokens.length && tokens[finalPos].t === 'rp') {
    throw new Error('Unmatched closing parenthesis ")".')
  }
  return counts
}

// ── Main public API ───────────────────────────────────────────────────────────

export function parseMolecularFormula(raw: string): ParseResult {
  const formula = raw.trim()

  if (formula.length === 0) {
    return { ok: false, error: 'Please enter a chemical formula.' }
  }

  // Reject immediately obvious unsupported syntax before tokenising.
  if (/[+\-²³⁺⁻]/.test(formula)) {
    return { ok: false, error: 'Ionic charge notation (e.g. Ca2+, SO4²⁻) is not supported.' }
  }
  if (/\[/.test(formula) || /\]/.test(formula)) {
    return { ok: false, error: 'Square bracket notation is not supported in V1.' }
  }

  try {
    const parts = splitHydrate(formula)

    // parts[0] must not have a leading coefficient
    if (/^\d/.test(parts[0].trim())) {
      return {
        ok:    false,
        error: `Formula cannot start with a number. For hydrates use the middle dot separator, e.g. CuSO4·5H2O.`,
      }
    }

    const totalCounts = new Map<string, number>()

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim()
      if (part.length === 0) throw new Error('Empty component in hydrate formula.')

      const [coeff, formulaPart] = i > 0 ? extractCoefficient(part) : [1, part]
      if (coeff === 0) throw new Error('Hydrate coefficient cannot be zero.')

      const counts = parseComponent(formulaPart)
      counts.forEach((n, sym) => totalCounts.set(sym, (totalCounts.get(sym) ?? 0) + n * coeff))
    }

    // Validate all element symbols
    const unknown: string[] = []
    totalCounts.forEach((_, sym) => {
      if (!ELEMENTS[sym]) unknown.push(sym)
    })
    if (unknown.length > 0) {
      return {
        ok:    false,
        error: `Unknown element${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}.`,
      }
    }

    // Calculate molar mass
    let molarMass = 0
    const entries: ElementEntry[] = []

    totalCounts.forEach((count, sym) => {
      const el: ElementData = ELEMENTS[sym]
      const contribution = round4(count * el.mass)
      molarMass += contribution
      entries.push({
        symbol:       sym,
        name:         el.name,
        count,
        atomicMass:   el.mass,
        contribution,
        massFraction: 0, // filled below
        radioactive:  el.radioactive === true,
      })
    })

    molarMass = round4(molarMass)

    // Compute mass fractions
    entries.forEach(e => {
      e.massFraction = round2((e.contribution / molarMass) * 100)
    })

    // Hill order: C first, then H, then remaining elements alphabetically
    entries.sort((a, b) => {
      const hillRank = (s: string) =>
        s === 'C' ? 0 : s === 'H' && totalCounts.has('C') ? 1 : 2
      const ra = hillRank(a.symbol)
      const rb = hillRank(b.symbol)
      if (ra !== rb) return ra - rb
      return a.symbol.localeCompare(b.symbol)
    })

    return { ok: true, molarMass, formula, elements: entries }

  } catch (err) {
    return {
      ok:    false,
      error: err instanceof Error ? err.message : 'Could not parse formula.',
    }
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function round4(x: number): number {
  return Math.round(x * 10000) / 10000
}
function round2(x: number): number {
  return Math.round(x * 100) / 100
}
