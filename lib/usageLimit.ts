const PRO_KEY       = 'figureready-pro'
const FREE_USED_KEY = 'figureready-free-used'

export function isProUser(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(PRO_KEY) === '1'
}

export function activatePro(): void {
  localStorage.setItem(PRO_KEY, '1')
}

export function hasUsedFreeExport(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(FREE_USED_KEY) === '1'
}

export function recordFreeExport(): void {
  localStorage.setItem(FREE_USED_KEY, '1')
}
