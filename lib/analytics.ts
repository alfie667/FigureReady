// ── Types ─────────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  uploads: number
  chartsCreated: number
  exports: number
  feedbackSubmissions: number
  lastUpdated: string
}

export type PlanType = 'monthly' | 'yearly'

export type CheckoutLocation =
  | 'pricing_page'
  | 'landing_pricing'
  | 'paywall_modal'
  | 'upgrade_modal'

export type CheckoutTrigger =
  | 'pricing_card'
  | 'export_limit'
  | 'upgrade_button'
  | 'unknown'

export interface PendingCheckout {
  plan: PlanType
  value: number
  currency: 'EUR'
  location: CheckoutLocation
  trigger: CheckoutTrigger
  started_at: string
  figure_created: boolean | null
  file_uploaded: boolean | null
  sample_only: boolean | null
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
    fbq?: (...args: unknown[]) => void
  }
}

// ── Config ────────────────────────────────────────────────────────────────────

// Checked at call time so ?debug_ga4=1 works in production.
export function isDebugMode(): boolean {
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

// ── Consent Mode v2 ───────────────────────────────────────────────────────────

export function updateConsent(granted: boolean) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
  })
}

// ── Device context ────────────────────────────────────────────────────────────

export function deviceParams(): Record<string, unknown> {
  if (typeof window === 'undefined') return {}
  return {
    device_type:  window.innerWidth < 768 ? 'mobile' : 'desktop',
    screen_width: window.innerWidth,
    page_path:    window.location.pathname,
  }
}

// ── Free / paywall events ─────────────────────────────────────────────────────

export function trackFirstFreeExport() {
  trackEvent('first_free_export', deviceParams())
}

export function trackFreeExportUsed() {
  trackEvent('free_export_used', deviceParams())
}

export function trackPaywallShown(params: {
  mode: 'after_free' | 'blocked'
  file_type?: string
  figure_created?: boolean | null
  file_uploaded?: boolean | null
  sample_only?: boolean | null
}) {
  trackEvent('paywall_shown', { ...deviceParams(), ...params })
}

// ── CTA / funnel events ───────────────────────────────────────────────────────

export function trackUploadCtaClick(location = 'unknown') {
  trackEvent('upload_cta_click', { location })
}

export function trackAppOpen() {
  trackEvent('app_open')
}

export function trackSampleCtaClick() {
  trackEvent('sample_cta_click')
}

export function trackSampleDataLoaded() {
  trackEvent('sample_data_loaded')
}

export function trackDemoFigureCreated() {
  trackEvent('demo_figure_created')
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

export function trackExport(format?: 'png' | 'svg' | 'pdf') {
  trackEvent('export_clicked', format ? { format } : undefined)
  incLocal('exports')
}

export function trackFeedback() {
  incLocal('feedbackSubmissions')
}

export function trackPricingView() {
  trackEvent('pricing_viewed')
}

// ── Checkout plan metadata ────────────────────────────────────────────────────

export const PLAN_META: Record<PlanType, { item_id: string; item_name: string; price: number }> = {
  monthly: { item_id: 'figureready_pro_monthly', item_name: 'FigureReady Pro Monthly', price: 12 },
  yearly:  { item_id: 'figureready_pro_yearly',  item_name: 'FigureReady Pro Yearly',  price: 99 },
}

// ── Pending checkout (sessionStorage) ────────────────────────────────────────

export const CHECKOUT_PENDING_KEY = 'fr_checkout_pending'

export function clearPendingCheckout(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(CHECKOUT_PENDING_KEY)
}

// ── Checkout funnel events ────────────────────────────────────────────────────

export function trackPlanSelected(params: {
  plan: PlanType
  value: number
  currency: string
  location: CheckoutLocation
  trigger: CheckoutTrigger
  figure_created?: boolean | null
  file_uploaded?: boolean | null
  sample_only?: boolean | null
}) {
  trackEvent('plan_selected', { ...deviceParams(), ...params })
}

export function trackCheckoutOpened(params: {
  plan: PlanType
  location: CheckoutLocation
  trigger: CheckoutTrigger
  figure_created?: boolean | null
  file_uploaded?: boolean | null
  sample_only?: boolean | null
}) {
  trackEvent('checkout_opened', { ...deviceParams(), ...params })
}

export function trackCheckoutReturnedWithoutPurchase(pending: PendingCheckout) {
  trackEvent('checkout_returned_without_purchase', {
    ...deviceParams(),
    plan:           pending.plan,
    location:       pending.location,
    trigger:        pending.trigger,
    figure_created: pending.figure_created,
    file_uploaded:  pending.file_uploaded,
    sample_only:    pending.sample_only,
    time_away_s:    Math.round((Date.now() - new Date(pending.started_at).getTime()) / 1000),
  })
}

export function trackPurchaseSuccess(params: {
  transactionId: string
  plan: PlanType
  value: number
  currency: string
  location?: string | null
  trigger?: string | null
  figure_created?: boolean | null
  file_uploaded?: boolean | null
  sample_only?: boolean | null
}) {
  trackEvent('purchase_success', {
    ...deviceParams(),
    transaction_id: params.transactionId,
    plan:           params.plan,
    value:          params.value,
    currency:       params.currency,
    location:       params.location ?? null,
    trigger:        params.trigger  ?? null,
    figure_created: params.figure_created ?? null,
    file_uploaded:  params.file_uploaded  ?? null,
    sample_only:    params.sample_only    ?? null,
  })
}

export function trackCheckoutCancelled(pending: PendingCheckout) {
  trackEvent('checkout_cancelled', {
    plan:           pending.plan,
    value:          pending.value,
    currency:       pending.currency,
    location:       pending.location,
    trigger:        pending.trigger,
    figure_created: pending.figure_created,
    file_uploaded:  pending.file_uploaded,
    sample_only:    pending.sample_only,
  })
}

// ── purchase (server-verified, deduped) ──────────────────────────────────────

const PURCHASE_DEDUP_PREFIX = 'ga4_purchase_fired_'

export function trackPurchase(params: {
  transactionId: string
  value: number
  currency: string
  plan: PlanType
}) {
  if (typeof window === 'undefined') return
  const key = PURCHASE_DEDUP_PREFIX + params.transactionId
  if (localStorage.getItem(key)) return
  localStorage.setItem(key, '1')

  clearPendingCheckout()

  const { item_id, item_name } = PLAN_META[params.plan] ?? PLAN_META.monthly
  trackEvent('purchase', {
    transaction_id: params.transactionId,
    value:          params.value,
    currency:       params.currency,
    items: [{ item_id, item_name, item_category: 'subscription', price: params.value, quantity: 1 }],
  })
}

// ── Local counters ────────────────────────────────────────────────────────────

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
