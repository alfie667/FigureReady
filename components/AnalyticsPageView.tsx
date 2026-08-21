'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent, trackCheckoutAbandoned } from '@/lib/analytics'
import { getPendingCheckout, clearPendingCheckout } from '@/lib/checkout'

/**
 * Placed once in the root layout.
 * – Captures UTM params + GCLID in sessionStorage on first load so they survive
 *   the redirect to Polar and are available on /success.
 * – Fires page_view on every SPA route change (skips the first render because
 *   GA4's gtag('config', ...) already fires page_view on initial load).
 * – Single authoritative detection point for checkout_abandoned events, covering:
 *     (a) same-tab browser-back from Polar      → pageshow (bfcache restore)
 *     (b) new-tab Polar closed, user refocuses  → window focus event
 *     (c) user navigates elsewhere in the SPA   → pathname change check
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

  // Detect abandoned checkout — single source of truth for checkout_abandoned.
  // Runs on mount, on bfcache restore (pageshow), and on new-tab focus return.
  useEffect(() => {
    function checkAbandoned() {
      const pending = getPendingCheckout()
      if (!pending || window.location.pathname.startsWith('/success')) return
      trackCheckoutAbandoned(pending)
      clearPendingCheckout()
    }

    checkAbandoned()

    // (a) Same-tab: browser back from Polar restores the page from bfcache
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) checkAbandoned() }
    window.addEventListener('pageshow', onPageShow)

    // (b) New-tab: user closes the Polar tab and refocuses this window
    const onFocus = () => {
      const pending = getPendingCheckout()
      if (!pending || window.location.pathname.startsWith('/success')) return
      // Guard: ignore focus events that fire immediately (< 5 s after checkout started)
      // so we don't misfire when the Polar tab opens and steals then returns focus briefly.
      const secondsAway = (Date.now() - new Date(pending.started_at).getTime()) / 1000
      if (secondsAway < 5) return
      trackCheckoutAbandoned(pending)
      clearPendingCheckout()
    }
    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('pageshow', onPageShow)
      window.removeEventListener('focus', onFocus)
    }
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
