import {
  trackEvent,
  trackPlanSelected,
  trackCheckoutOpened,
  deviceParams,
  clearPendingCheckout,
  isDebugMode,
  PLAN_META,
  CHECKOUT_PENDING_KEY,
  type PlanType,
  type CheckoutLocation,
  type CheckoutTrigger,
  type PendingCheckout,
} from '@/lib/analytics'

// ── Types ─────────────────────────────────────────────────────────────────────

export type { CheckoutLocation, CheckoutTrigger, PendingCheckout }

export interface CheckoutContext {
  plan: PlanType
  location: CheckoutLocation
  trigger: CheckoutTrigger
  figureCreated?: boolean | null
  fileUploaded?: boolean | null
  sampleOnly?: boolean | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const POLAR_URLS: Record<PlanType, string> = {
  monthly: 'https://buy.polar.sh/polar_cl_VGeVJ2XK6HM9vWagdGyajurF8CZKTptFpUqSX4Ljhc8',
  yearly:  'https://buy.polar.sh/polar_cl_flJ14D6H057GZslZY6hQBdRbz7Mk6Kd4fnfaA2056F1',
}

// ── Pending checkout helpers ───────────────────────────────────────────────────

export function getPendingCheckout(): PendingCheckout | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CHECKOUT_PENDING_KEY)
    return raw ? (JSON.parse(raw) as PendingCheckout) : null
  } catch {
    return null
  }
}

export { clearPendingCheckout }

// ── UTM forwarding ────────────────────────────────────────────────────────────

function buildPolarUrl(plan: PlanType): string {
  const url = new URL(POLAR_URLS[plan])
  ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(k => {
    const v = sessionStorage.getItem(`fr_${k}`)
    if (v) url.searchParams.set(k, v)
  })
  return url.toString()
}

// ── In-flight guard ───────────────────────────────────────────────────────────
// Module-level flag prevents double-fire from double-clicks or React Strict Mode.

let checkoutInFlight = false

// ── startCheckout — unified entry point for every checkout button ─────────────
//
// opts.newTab  = true  → open Polar in a new tab (PaywallModal)
// opts.newTab  = false → same-tab redirect; waits for GA4 callback (max 1.5 s)
// opts.onComplete      → called after tab opens (new-tab path only; same-tab navigates away)

export function startCheckout(
  ctx: CheckoutContext,
  opts: { newTab?: boolean; onComplete?: () => void } = {}
): void {
  if (typeof window === 'undefined') return
  if (checkoutInFlight) return
  checkoutInFlight = true

  const { plan, location, trigger } = ctx
  const figureCreated = ctx.figureCreated ?? null
  const fileUploaded  = ctx.fileUploaded  ?? null
  const sampleOnly    = ctx.sampleOnly    ?? null

  const { item_id, item_name, price: value } = PLAN_META[plan]

  // ── 1. upgrade_clicked ─────────────────────────────────────────────────────
  trackEvent('upgrade_clicked', {
    ...deviceParams(),
    location,
    trigger,
    plan,
    figure_created: figureCreated,
    file_uploaded:  fileUploaded,
    sample_only:    sampleOnly,
  })

  // ── 2. plan_selected ───────────────────────────────────────────────────────
  trackPlanSelected({
    plan, value, currency: 'EUR', location, trigger,
    figure_created: figureCreated,
    file_uploaded:  fileUploaded,
    sample_only:    sampleOnly,
  })

  // ── 3. Store pending checkout (structured JSON) ────────────────────────────
  const pending: PendingCheckout = {
    plan, value, currency: 'EUR',
    location, trigger,
    started_at:     new Date().toISOString(),
    figure_created: figureCreated,
    file_uploaded:  fileUploaded,
    sample_only:    sampleOnly,
  }
  // localStorage (not sessionStorage) so the pending record is visible across
  // tabs — the success page can clear it even when Polar opens in a new tab.
  localStorage.setItem(CHECKOUT_PENDING_KEY, JSON.stringify(pending))

  // ── 4. FB pixel ────────────────────────────────────────────────────────────
  window.fbq?.('track', 'InitiateCheckout')

  const destination = buildPolarUrl(plan)
  const debug = isDebugMode()

  const checkoutContext = {
    plan,
    location,
    trigger,
    figure_created: figureCreated,
    file_uploaded:  fileUploaded,
    sample_only:    sampleOnly,
  }

  const beginCheckoutPayload = {
    ...(debug && { debug_mode: true }),
    ...deviceParams(),
    currency: 'EUR',
    value,
    ...checkoutContext,
    items: [{
      item_id,
      item_name,
      item_category: 'subscription',
      price:         value,
      quantity:      1,
    }],
  }

  // ── 5. Dev guard: never hit production Polar URLs from localhost ─────────────
  // Prevents polluting the Polar dashboard with test sessions during development.
  // All analytics events still fire normally (visible in GA4 debug view).
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.warn('[FigureReady] DEV: Polar redirect suppressed — would have gone to:', destination)
    trackCheckoutOpened(checkoutContext)
    checkoutInFlight = false
    opts.onComplete?.()
    return
  }

  if (opts.newTab) {
    // ── 6a. New tab: stamp timestamp, open Polar, fire GA4 events ─────────────
    // Tab stays alive so there is no navigation race — order is semantic only.
    localStorage.setItem(CHECKOUT_PENDING_KEY, JSON.stringify({ ...pending, checkout_opened_at: new Date().toISOString() }))
    window.open(destination, '_blank', 'noopener,noreferrer')
    window.gtag?.('event', 'begin_checkout', beginCheckoutPayload)
    trackCheckoutOpened(checkoutContext)
    checkoutInFlight = false
    opts.onComplete?.()
  } else {
    // ── 6b. Same tab: queue checkout_opened BEFORE begin_checkout ─────────────
    // GA4 processes dataLayer events in FIFO order. Queuing checkout_opened first
    // guarantees it is transmitted before begin_checkout's event_callback fires
    // and the browser navigates away — no sendBeacon race.
    localStorage.setItem(CHECKOUT_PENDING_KEY, JSON.stringify({ ...pending, checkout_opened_at: new Date().toISOString() }))
    trackCheckoutOpened(checkoutContext)

    let redirected = false
    const doRedirect = () => {
      if (redirected) return
      redirected = true
      checkoutInFlight = false
      window.location.href = destination
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'begin_checkout', {
        ...beginCheckoutPayload,
        event_callback: doRedirect,
      })
      setTimeout(doRedirect, 1500)
    } else {
      doRedirect()
    }
  }
}
