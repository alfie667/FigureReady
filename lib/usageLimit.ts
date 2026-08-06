// ── Entitlement (server-verified) ─────────────────────────────────────────────

export interface EntitlementResult {
  authenticated: boolean
  isPro: boolean
  isPendingActivation: boolean  // payment confirmed, Polar webhook not yet received
  plan: 'monthly' | 'yearly' | null
  status: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  email: string | null
}

const EMPTY: EntitlementResult = {
  authenticated: false, isPro: false, isPendingActivation: false,
  plan: null, status: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, email: null,
}

// Module-level cache — populated once on app mount via refreshEntitlement()
let _cache: EntitlementResult | null = null

export function isProUser(): boolean {
  if (typeof window === 'undefined') return false
  return _cache?.isPro ?? false
}

export function getCachedEntitlement(): EntitlementResult {
  return _cache ?? EMPTY
}

export async function refreshEntitlement(): Promise<EntitlementResult> {
  if (typeof window === 'undefined') return EMPTY
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' })
    if (!res.ok) { _cache = EMPTY; return EMPTY }
    const data = await res.json() as EntitlementResult
    _cache = data
    return data
  } catch {
    _cache = EMPTY
    return EMPTY
  }
}

// ── Legacy migration helper ───────────────────────────────────────────────────
// Detects users who had Pro via the old localStorage flag and prompts them to sign in.

export function hasLegacyProFlag(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('figureready-pro') === '1'
}

// ── Free export tracking (unchanged — no auth required for this) ──────────────

const FREE_USED_KEY = 'figureready-free-used'

export function hasUsedFreeExport(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(FREE_USED_KEY) === '1'
}

export function recordFreeExport(): void {
  localStorage.setItem(FREE_USED_KEY, '1')
}
