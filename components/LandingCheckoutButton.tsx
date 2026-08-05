'use client'
import { useState } from 'react'
import { startCheckout } from '@/lib/checkout'
import type { PlanType } from '@/lib/analytics'

export default function LandingCheckoutButton({
  plan,
  className,
  children,
}: {
  plan: PlanType
  className: string
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(false)

  function handleClick() {
    if (loading) return
    setLoading(true)
    startCheckout(
      { plan, location: 'landing_pricing', trigger: 'pricing_card' },
      { newTab: false }
    )
  }

  return (
    <button
      disabled={loading}
      onClick={handleClick}
      className={className}
    >
      {loading ? 'Redirecting…' : children}
    </button>
  )
}
