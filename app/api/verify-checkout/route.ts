import { Polar } from '@polar-sh/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { PlanType } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

const polar = new Polar({ accessToken: process.env.POLAR_API_KEY! })

// Monthly ≈ 1200 cents (12 €), Yearly ≈ 9900 cents (99 €)
function detectPlan(amountCents: number): PlanType {
  return amountCents >= 5000 ? 'yearly' : 'monthly'
}

export async function GET(req: NextRequest) {
  try {
    const checkoutId = req.nextUrl.searchParams.get('id')
    if (!checkoutId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const checkout = await polar.checkouts.get({ id: checkoutId })
    const confirmed = checkout.status === 'confirmed' || checkout.status === 'succeeded'

    // totalAmount = after discounts + taxes (actual charge); amount = pre-discount/tax
    const totalCents = typeof checkout.totalAmount === 'number' ? checkout.totalAmount : checkout.amount
    const value    = Math.round(totalCents) / 100
    const currency = checkout.currency?.toUpperCase() ?? 'EUR'
    const plan     = detectPlan(checkout.amount)   // use pre-tax amount to detect plan tier

    return NextResponse.json({ confirmed, transactionId: checkoutId, value, currency, plan })
  } catch (err) {
    console.error('Polar verify error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
