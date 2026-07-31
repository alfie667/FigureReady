'use client'
import { useEffect } from 'react'
import { trackBeginCheckout, trackPricingView, type PlanType } from '@/lib/analytics'

declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}

// Appends UTM params + GCLID (stored by AnalyticsPageView) to the Polar URL
// so they survive the external redirect and can be read back on /success.
function buildPolarUrl(base: string): string {
  const url = new URL(base)
  ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(k => {
    const v = sessionStorage.getItem(`fr_${k}`)
    if (v) url.searchParams.set(k, v)
  })
  return url.toString()
}

export function CheckoutButton({
  href,
  plan,
  className,
  children,
}: {
  href: string
  plan: PlanType
  className: string
  children: React.ReactNode
}) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    window.fbq?.('track', 'InitiateCheckout')
    const destination = buildPolarUrl(href)
    // Navigate only after GA4 confirms begin_checkout was sent (max 1.5 s wait)
    trackBeginCheckout(plan, () => { window.location.href = destination })
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}

// Fires pricing_view once when the pricing page mounts.
// Exported here to avoid creating an extra file (lives in the same client boundary).
export function PricingViewTracker() {
  useEffect(() => { trackPricingView() }, [])
  return null
}
