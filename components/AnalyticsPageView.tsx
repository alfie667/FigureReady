'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent, trackCheckoutCancelled } from '@/lib/analytics'
import { getPendingCheckout, clearPendingCheckout } from '@/lib/checkout'
import { isProUser } from '@/lib/usageLimit'

/**
 * Placed once in the root layout.
 * – Captures UTM params + GCLID in sessionStorage on first load so they survive
 *   the redirect to Polar and are available on /success.
 * – Fires page_view on every SPA route change (skips the first render because
 *   GA4's gtag('config', ...) already fires page_view on initial load).
 * – Detects abandoned checkout (checkout_cancelled) via fr_checkout_pending.
 */
export function AnalyticsPageView() {
  const pathname = usePathname()
  const isFirst  = useRef(true)

  // Capture UTMs and GCLID once on landing
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(k => {
      const v = p.get(k)
      if (v) sessionStorage.setItem(`fr_${k}`, v)
    })
  }, [])

  // Detect abandoned checkout — fires checkout_cancelled when user returns without purchasing.
  // Covers: (a) same-tab browser-back from Polar, (b) new-tab Polar closed and user resumes.
  useEffect(() => {
    function checkAbandoned() {
      const pending = getPendingCheckout()
      if (pending && !isProUser() && !window.location.pathname.startsWith('/success')) {
        trackCheckoutCancelled(pending)
        clearPendingCheckout()
      }
    }
    checkAbandoned()
    // pageshow fires on bfcache restore (browser back button after hard redirect to Polar)
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) checkAbandoned() }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  // SPA page_view — skip initial render (GA4 config already fires it).
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    trackEvent('page_view', {
      page_path:     pathname,
      page_location: window.location.href,
      page_title:    document.title,
    })
  }, [pathname])

  return null
}
