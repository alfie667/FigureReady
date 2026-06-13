function niceNum(range: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(range))
  const fraction = range / Math.pow(10, exponent)
  let niceFraction: number
  if (round) {
    if (fraction < 1.5) niceFraction = 1
    else if (fraction < 3) niceFraction = 2
    else if (fraction < 7) niceFraction = 5
    else niceFraction = 10
  } else {
    if (fraction <= 1) niceFraction = 1
    else if (fraction <= 2) niceFraction = 2
    else if (fraction <= 5) niceFraction = 5
    else niceFraction = 10
  }
  return niceFraction * Math.pow(10, exponent)
}

/**
 * Returns evenly-spaced "round" tick values covering [min, max],
 * using the classic Heckbert nice-numbers algorithm. Used to override
 * Recharts' default tick generation, which can produce uneven steps
 * (e.g. 1,2,3...10,12,14) on category axes with numeric labels.
 */
export function getNiceTicks(min: number, max: number, tickCount = 6): number[] {
  if (min === max) return [min]
  if (min > max) [min, max] = [max, min]

  const range = niceNum(max - min, false)
  const step = niceNum(range / (tickCount - 1), true)
  const niceMin = Math.floor(min / step) * step
  const niceMax = Math.ceil(max / step) * step
  const decimals = Math.max(0, -Math.floor(Math.log10(step)))

  const ticks: number[] = []
  for (let v = niceMin; v <= niceMax + step / 2; v += step) {
    ticks.push(Number(v.toFixed(decimals)))
  }
  return ticks
}

/**
 * Returns tick values spaced by a fixed user-defined step, covering
 * [min, max]. Used so the tick interval stays constant across different
 * axis ranges, instead of being recomputed by getNiceTicks each time.
 */
export function buildStepTicks(min: number, max: number, step: number): number[] {
  if (!(step > 0)) return getNiceTicks(min, max)
  if (min > max) [min, max] = [max, min]

  const decimals = Math.max(0, -Math.floor(Math.log10(step)))
  const ticks: number[] = []
  for (let v = min; v <= max + step / 2; v += step) {
    ticks.push(Number(v.toFixed(decimals)))
  }
  return ticks
}
