const USAGE_KEY = 'figureready-usage-v1'
const PRO_KEY = 'figureready-pro'
const FREE_LIMIT = 3

interface UsageData {
  count: number
  month: string // YYYY-MM
}

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function getUsage(): UsageData {
  if (typeof window === 'undefined') return { count: 0, month: currentMonth() }
  try {
    const raw = localStorage.getItem(USAGE_KEY)
    if (!raw) return { count: 0, month: currentMonth() }
    const data = JSON.parse(raw) as UsageData
    if (data.month !== currentMonth()) return { count: 0, month: currentMonth() }
    return data
  } catch {
    return { count: 0, month: currentMonth() }
  }
}

export function incrementUsage(): void {
  const data = getUsage()
  localStorage.setItem(USAGE_KEY, JSON.stringify({
    count: data.count + 1,
    month: currentMonth(),
  }))
}

export function isProUser(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(PRO_KEY) === '1'
}

export function activatePro(): void {
  localStorage.setItem(PRO_KEY, '1')
}

export function canCreateFigure(): boolean {
  if (isProUser()) return true
  return getUsage().count < FREE_LIMIT
}

export const FREE_LIMIT_VALUE = FREE_LIMIT
