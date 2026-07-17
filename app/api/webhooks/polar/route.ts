import { NextRequest, NextResponse } from 'next/server'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const FB_PIXEL_ID = process.env.FB_PIXEL_ID ?? '206634508997459'
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN!
const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET!

async function sendFbPurchaseEvent(value: number, currency: string, email?: string) {
  const userData: Record<string, string> = {}
  if (email) {
    userData.em = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
  }

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: userData,
        custom_data: { value, currency },
      },
    ],
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  )

  if (!res.ok) {
    console.error('FB Conversions API error:', await res.text())
  }
}

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

  if (event.type === 'subscription.created' || event.type === 'order.created') {
    const data = event.data as Record<string, unknown>
    const amount = typeof data.amount === 'number' ? data.amount / 100 : 12
    const currency = (typeof data.currency === 'string' ? data.currency : 'EUR').toUpperCase()
    const customer = data.customer as Record<string, unknown> | undefined
    const email = typeof customer?.email === 'string' ? customer.email : undefined

    await sendFbPurchaseEvent(amount, currency, email)
  }

  return NextResponse.json({ received: true })
}
