const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '-': '⁻', '+': '⁺',
}

/**
 * Converts caret-style exponents typed in spreadsheet headers (e.g. "cm^-2",
 * "m^3") into proper Unicode superscripts ("cm⁻²", "m³") for clean axis units,
 * and capitalizes the first letter of the label (axis titles start with a
 * capital letter, e.g. "time (s)" -> "Time (s)").
 */
export function formatAxisLabel(label: string): string {
  const withSuperscripts = label.replace(/\^(-?\d+)/g, (_, exponent: string) =>
    [...exponent].map(ch => SUPERSCRIPTS[ch] ?? ch).join('')
  )
  return withSuperscripts.charAt(0).toUpperCase() + withSuperscripts.slice(1)
}
