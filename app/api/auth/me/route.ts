import { NextRequest, NextResponse } from 'next/server'
import { getSessionToken, verifySession } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export interface EntitlementResult {
  authenticated: boolean
  isPro: boolean
  isPendingActivation: boolean  // session exists, payment confirmed, webhook not yet received
  plan: 'monthly' | 'yearly' | null
  status: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  email: string | null
}

const ANON: EntitlementResult = {
  authenticated: false, isPro: false, isPendingActivation: false,
  plan: null, status: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, email: null,
}

export async function GET(req: NextRequest): Promise<NextResponse<EntitlementResult>> {
  const token = getSessionToken(req)
  if (!token) return NextResponse.json(ANON)

  const session = await verifySession(token)
  if (!session) return NextResponse.json(ANON)

  // Prefer 'active' rows; also surface 'pending_confirmation' so the client can show
  // a "waiting for activation" state without treating it as a Pro grant.
  const subs = await sql`
    SELECT plan, status, current_period_end, cancel_at_period_end
    FROM subscriptions
    WHERE user_id = ${session.userId}
      AND status IN ('active', 'pending_confirmation')
      AND (current_period_end IS NULL OR current_period_end > now())
    ORDER BY
      CASE status WHEN 'active' THEN 0 ELSE 1 END,
      created_at DESC
    LIMIT 1
  `

  const sub = subs[0] as Record<string, unknown> | undefined

  // isPro only when the Polar webhook has confirmed the subscription is active.
  // pending_confirmation = payment verified by checkout API, webhook not yet received.
  const isPro               = sub?.status === 'active'
  const isPendingActivation = sub?.status === 'pending_confirmation'

  return NextResponse.json({
    authenticated: true,
    isPro,
    isPendingActivation,
    plan: (sub?.plan as 'monthly' | 'yearly' | null) ?? null,
    status: (sub?.status as string | null) ?? null,
    currentPeriodEnd: sub?.current_period_end
      ? new Date(sub.current_period_end as string).toISOString()
      : null,
    cancelAtPeriodEnd: (sub?.cancel_at_period_end as boolean) ?? false,
    email: session.email,
  })
}
