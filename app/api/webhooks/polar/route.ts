import { NextRequest, NextResponse } from 'next/server'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { randomUUID, createHash } from 'crypto'
import { sql } from '@/lib/db'
import type { PlanType } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

const FB_PIXEL_ID          = process.env.FB_PIXEL_ID ?? '206634508997459'
const FB_ACCESS_TOKEN      = process.env.FB_ACCESS_TOKEN!
const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET!

// ── Helpers ───────────────────────────────────────────────────────────────────

async function sendFbPurchaseEvent(value: number, currency: string, email?: string) {
  const userData: Record<string, string> = {}
  if (email) {
    userData.em = createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
  }
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          user_data: userData,
          custom_data: { value, currency },
        }],
      }),
    }
  )
  if (!res.ok) console.error('[webhook] FB Conversions API error:', await res.text())
}

function detectPlan(data: Record<string, unknown>): PlanType {
  // Prefer recurringInterval when available on the subscription object
  const interval =
    data.recurringInterval ??
    (data.price as Record<string, unknown> | undefined)?.recurringInterval
  if (interval === 'year')  return 'yearly'
  if (interval === 'month') return 'monthly'
  // Fallback: amount-based (amounts in cents, >= 5000 = yearly tier)
  const cents = typeof data.amount === 'number' ? data.amount : 0
  return cents >= 5000 ? 'yearly' : 'monthly'
}

// Maps Polar subscription status → our DB status.
// Only used when no statusOverride is provided (i.e., for created/updated events
// where we trust Polar's reported status directly).
function mapStatus(polarStatus: string): string {
  switch (polarStatus) {
    case 'active':    return 'active'
    case 'trialing':  return 'active'
    case 'canceled':  return 'canceled'
    case 'past_due':  return 'past_due'
    case 'unpaid':    return 'past_due'
    case 'paused':    return 'past_due'
    default:          return polarStatus
  }
}

// Core upsert — called for all subscription lifecycle events.
// statusOverride: use when the event type implies the status regardless of payload
//   (e.g., subscription.active always means 'active').
// Without override: uses Polar's reported data.status via mapStatus().
async function upsertSubscription(
  data: Record<string, unknown>,
  statusOverride?: string,
) {
  const customer   = data.customer as Record<string, unknown> | undefined
  const email      = typeof customer?.email     === 'string' ? customer.email     : null
  const customerId = typeof data.customerId     === 'string' ? data.customerId     : null
  const subId      = typeof data.id             === 'string' ? data.id             : null
  const checkoutId = typeof data.checkoutId     === 'string' ? data.checkoutId     : null
  const productId  = typeof data.productId      === 'string' ? data.productId      : null

  const polarStatus = typeof data.status === 'string' ? data.status : 'active'
  const status      = statusOverride ?? mapStatus(polarStatus)
  const plan        = detectPlan(data)

  const rawEnd = data.currentPeriodEnd
  const currentPeriodEnd =
    typeof rawEnd === 'string' ? new Date(rawEnd)
    : rawEnd instanceof Date   ? rawEnd
    : null

  const cancelAtPeriodEnd =
    typeof data.cancelAtPeriodEnd === 'boolean' ? data.cancelAtPeriodEnd : false

  if (!email || !subId) {
    console.warn('[webhook] Missing email or subscriptionId — skipping upsert', { email, subId })
    return
  }

  // Upsert user
  const users = await sql`
    INSERT INTO users (id, email, created_at, updated_at)
    VALUES (${randomUUID()}, ${email}, now(), now())
    ON CONFLICT (email) DO UPDATE SET updated_at = now()
    RETURNING id
  ` as Array<{ id: string }>
  const userId = users[0].id

  // Step 1 — reconcile via checkoutId: promotes the pending_confirmation row created by
  // /api/checkout/confirm to the real subscription (adds polar_subscription_id).
  if (checkoutId) {
    await sql`
      UPDATE subscriptions SET
        polar_subscription_id = ${subId},
        polar_customer_id     = ${customerId},
        polar_product_id      = ${productId},
        status                = ${status},
        current_period_end    = ${currentPeriodEnd},
        cancel_at_period_end  = ${cancelAtPeriodEnd},
        updated_at            = now()
      WHERE polar_checkout_id     = ${checkoutId}
        AND polar_subscription_id IS NULL
    `
  }

  // Step 2 — idempotent upsert by subscription ID: handles replays, events without
  // checkoutId, and cases where Step 1 already linked the row.
  await sql`
    INSERT INTO subscriptions (
      id, user_id, polar_customer_id, polar_subscription_id,
      polar_product_id, plan, status,
      current_period_end, cancel_at_period_end, created_at, updated_at
    ) VALUES (
      ${randomUUID()}, ${userId}, ${customerId}, ${subId},
      ${productId}, ${plan}, ${status},
      ${currentPeriodEnd}, ${cancelAtPeriodEnd}, now(), now()
    )
    ON CONFLICT (polar_subscription_id) DO UPDATE SET
      polar_customer_id    = EXCLUDED.polar_customer_id,
      status               = EXCLUDED.status,
      current_period_end   = EXCLUDED.current_period_end,
      cancel_at_period_end = EXCLUDED.cancel_at_period_end,
      updated_at           = now()
  `
}

// Revoke access on refund — finds subscription by ID or customer email.
async function revokeOnRefund(data: Record<string, unknown>) {
  // Try direct subscriptionId first (most reliable)
  const subId =
    typeof data.subscriptionId === 'string' ? data.subscriptionId
    : typeof (data.subscription as Record<string, unknown> | undefined)?.id === 'string'
      ? (data.subscription as Record<string, unknown>).id as string
      : typeof (data.order as Record<string, unknown> | undefined)?.subscriptionId === 'string'
        ? (data.order as Record<string, unknown>).subscriptionId as string
        : null

  if (subId) {
    await sql`
      UPDATE subscriptions SET status = 'revoked', updated_at = now()
      WHERE polar_subscription_id = ${subId}
    `
    return
  }

  // Fallback: revoke via customer email
  const customer = data.customer as Record<string, unknown> | undefined
  const email    = typeof customer?.email === 'string' ? customer.email : null
  if (!email) {
    console.warn('[webhook] revokeOnRefund: cannot identify subscription', data)
    return
  }

  await sql`
    UPDATE subscriptions s SET status = 'revoked', updated_at = now()
    FROM users u
    WHERE s.user_id = u.id
      AND u.email = ${email}
      AND s.status IN ('active', 'pending_confirmation')
  `
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.text()

  let event: ReturnType<typeof validateEvent>
  try {
    event = validateEvent(body, Object.fromEntries(req.headers), POLAR_WEBHOOK_SECRET)
  } catch (e) {
    if (e instanceof WebhookVerificationError) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const data = event.data as Record<string, unknown>

  try {
    switch (event.type) {

      // subscription.created: use Polar's reported status (may already be 'active'
      // for immediate card payments, or 'incomplete' for other flows).
      case 'subscription.created':
        await upsertSubscription(data)
        break

      // subscription.updated: trust Polar's reported status.
      case 'subscription.updated':
        await upsertSubscription(data)
        break

      // subscription.active: explicit event meaning the subscription is now active —
      // override regardless of what data.status contains.
      case 'subscription.active':
        await upsertSubscription(data, 'active')
        break

      case 'subscription.canceled':
        await upsertSubscription(data, 'canceled')
        break

      case 'subscription.uncanceled':
        await upsertSubscription(data, 'active')
        break

      case 'subscription.revoked':
        await upsertSubscription(data, 'revoked')
        break

      case 'subscription.past_due':
        await upsertSubscription(data, 'past_due')
        break

      // order.paid / order.created: fire FB Conversions API for purchase tracking.
      // Polar may use either event name depending on SDK version.
      case 'order.paid':
      case 'order.created': {
        const amount   = typeof data.amount === 'number' ? data.amount / 100 : 12
        const currency = (typeof data.currency === 'string' ? data.currency : 'EUR').toUpperCase()
        const customer = data.customer as Record<string, unknown> | undefined
        const email    = typeof customer?.email === 'string' ? customer.email : undefined
        await sendFbPurchaseEvent(amount, currency, email)
        break
      }

      // order.refunded / refund.created: revoke Pro access.
      case 'order.refunded':
      case 'refund.created':
        await revokeOnRefund(data)
        break

      default:
        break
    }
  } catch (err) {
    console.error(`[webhook] Error processing ${event.type}:`, err)
    // Return 200 anyway so Polar does not retry indefinitely for transient DB errors.
    // The event will be logged for manual reconciliation if needed.
  }

  return NextResponse.json({ received: true })
}
