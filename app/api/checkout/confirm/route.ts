import { NextRequest, NextResponse } from 'next/server'
import { Polar } from '@polar-sh/sdk'
import { randomUUID } from 'crypto'
import { sql } from '@/lib/db'
import { signSession, setSessionCookie } from '@/lib/auth'
import type { PlanType } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

const polar = new Polar({ accessToken: process.env.POLAR_API_KEY! })

function detectPlan(amountCents: number): PlanType {
  return amountCents >= 5000 ? 'yearly' : 'monthly'
}

function estimatePeriodEnd(plan: PlanType): Date {
  const d = new Date()
  plan === 'yearly' ? d.setDate(d.getDate() + 366) : d.setDate(d.getDate() + 31)
  return d
}

export async function POST(req: NextRequest) {
  try {
    const { checkoutId } = await req.json() as { checkoutId?: string }
    if (!checkoutId) return NextResponse.json({ error: 'Missing checkoutId' }, { status: 400 })

    const checkout = await polar.checkouts.get({ id: checkoutId })
    const confirmed = checkout.status === 'confirmed' || checkout.status === 'succeeded'

    if (!confirmed) {
      return NextResponse.json({ confirmed: false })
    }

    const totalCents = typeof checkout.totalAmount === 'number' ? checkout.totalAmount : checkout.amount
    const value    = Math.round(totalCents) / 100
    const currency = checkout.currency?.toUpperCase() ?? 'EUR'
    const plan     = detectPlan(checkout.amount)

    // customerEmail and customerId come from Polar's server — never from client
    const raw = checkout as unknown as Record<string, unknown>
    const customerEmail = typeof raw.customerEmail === 'string' ? raw.customerEmail : null
    const customerId    = typeof raw.customerId    === 'string' ? raw.customerId    : null

    const response = NextResponse.json({
      confirmed: true,
      transactionId: checkoutId,
      value,
      currency,
      plan,
      authenticated: !!customerEmail,
    })

    if (customerEmail) {
      // Upsert user by email
      const users = await sql`
        INSERT INTO users (id, email, created_at, updated_at)
        VALUES (${randomUUID()}, ${customerEmail}, now(), now())
        ON CONFLICT (email) DO UPDATE SET updated_at = now()
        RETURNING id
      `
      const userId = users[0].id as string

      // Optimistic subscription — status='pending_confirmation' until webhook confirms
      await sql`
        INSERT INTO subscriptions (
          id, user_id, polar_customer_id, polar_checkout_id,
          plan, status, current_period_end, created_at, updated_at
        ) VALUES (
          ${randomUUID()}, ${userId}, ${customerId}, ${checkoutId},
          ${plan}, 'pending_confirmation', ${estimatePeriodEnd(plan)}, now(), now()
        )
        ON CONFLICT (polar_checkout_id) DO UPDATE SET
          status     = 'pending_confirmation',
          updated_at = now()
      `

      const jwt = await signSession(userId, customerEmail)
      setSessionCookie(response, jwt)
    }

    return response
  } catch (err) {
    console.error('[checkout/confirm]', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
