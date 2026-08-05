'use client'
import { useEffect, useState } from 'react'
import { trackPricingView, type PlanType } from '@/lib/analytics'
import { startCheckout } from '@/lib/checkout'

export function CheckoutButton({
  plan,
  className,
  children,
}: {
  plan: PlanType
  className: string
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(false)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    startCheckout(
      { plan, location: 'pricing_page', trigger: 'pricing_card' },
      { newTab: false }
      // setLoading(false) intentionally omitted: same-tab redirect navigates away
    )
  }

  return (
    <button disabled={loading} className={className} onClick={handleClick}>
      {loading ? 'Redirecting…' : children}
    </button>
  )
}

// Fires pricing_viewed once when the pricing page mounts.
export function PricingViewTracker() {
  useEffect(() => { trackPricingView() }, [])
  return null
}
