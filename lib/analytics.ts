// ── Types ─────────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  uploads: number
  chartsCreated: number
  exports: number
  feedbackSubmissions: number
  lastUpdated: string
}

export type PlanType = 'monthly' | 'yearly'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
    fbq?: (...args: unknown[]) => void
  }
}

// ── Config ────────────────────────────────────────────────────────────────────

// Checked at call time (not compile time) so ?debug_ga4=1 works in production.
function isDebugMode(): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  if (process.env.NEXT_PUBLIC_GA_DEBUG === 'true') return true
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem('ga4_debug') === '1'
}

// ── Central dispatcher ────────────────────────────────────────────────────────

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', name, {
    ...(isDebugMode() && { debug_mode: true }),
    ...params,
  })
}

// ── Consent Mode v2 — call this from a future consent banner ─────────────────

export function updateConsent(granted: boolean) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
  })
}

// ── App events ────────────────────────────────────────────────────────────────

export function trackUpload() {
  trackEvent('file_upload')
  incLocal('uploads')
}

export function trackChartCreated() {
  trackEvent('figure_created')
  incLocal('chartsCreated')
}

export function trackExport() {
  trackEvent('export')
  incLocal('exports')
}

export function trackFeedback() {
  incLocal('feedbackSubmissions')
}

export function trackPricingView() {
  trackEvent('pricing_view')
}

// ── Checkout events ───────────────────────────────────────────────────────────

const PLAN_META: Record<PlanType, { item_id: string; item_name: string; price: number }> = {
  monthly: { item_id: 'figureready_pro_monthly', item_name: 'FigureReady Pro Monthly', price: 12 },
  yearly:  { item_id: 'figureready_pro_yearly',  item_name: 'FigureReady Pro Yearly',  price: 99 },
}

// onDone is called once GA4 confirms the hit was sent (or after 1.5 s fallback).
// Pass the navigation callback here so the redirect never races the event.
export function trackBeginCheckout(plan: PlanType, onDone?: () => void) {
  const { item_id, item_name, price } = PLAN_META[plan]

  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    onDone?.(); return
  }

  let fired = false
  const finish = () => { if (!fired) { fired = true; onDone?.() } }

  window.gtag('event', 'begin_checkout', {
    ...(isDebugMode() && { debug_mode: true }),
    currency:       'EUR',
    value:          price,
    event_callback: finish,   // called when GA4 confirms the hit
    items: [{ item_id, item_name, price, quantity: 1 }],
  })

  // Safety net: redirect even if GA4 never calls back (adblocker, timeout…)
  setTimeout(finish, 1500)
}

const PURCHASE_DEDUP_PREFIX = 'ga4_purchase_fired_'

export function trackPurchase(params: {
  transactionId: string
  value: number
  currency: string
  plan: PlanType
}) {
  if (typeof window === 'undefined') return
  const key = PURCHASE_DEDUP_PREFIX + params.transactionId
  if (localStorage.getItem(key)) return        // already fired for this checkout
  localStorage.setItem(key, '1')

  const { item_id, item_name } = PLAN_META[params.plan] ?? PLAN_META.monthly
  trackEvent('purchase', {
    transaction_id: params.transactionId,
    value: params.value,
    currency: params.currency,
    items: [{
      item_id,
      item_name,
      price: params.value,
      quantity: 1,
    }],
  })
}

// ── Local counters (admin panel) ──────────────────────────────────────────────

const STORAGE_KEY = 'figureready-analytics'

function empty(): AnalyticsData {
  return { uploads: 0, chartsCreated: 0, exports: 0, feedbackSubmissions: 0, lastUpdated: new Date().toISOString() }
}

function loadLocal(): AnalyticsData {
  if (typeof window === 'undefined') return empty()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AnalyticsData) : empty()
  } catch {
    return empty()
  }
}

function saveLocal(data: AnalyticsData) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, lastUpdated: new Date().toISOString() }))
}

function incLocal(key: keyof Omit<AnalyticsData, 'lastUpdated'>) {
  const d = loadLocal();
  (d[key] as number)++
  saveLocal(d)
}

export const getAnalytics = (): AnalyticsData => loadLocal()
