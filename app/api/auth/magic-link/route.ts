import { NextRequest, NextResponse } from 'next/server'
import { randomUUID, createHash, randomBytes } from 'crypto'
import { sql } from '@/lib/db'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const resend  = new Resend(process.env.RESEND_API_KEY)
const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://figureready.com'
const TTL_MINUTES = 15

// Production sender: set RESEND_FROM_EMAIL in Vercel after verifying figureready.com in Resend.
// Development fallback: Resend sandbox sender — can only deliver to emails verified
// in your Resend account. Set RESEND_DEV_RECIPIENT_OVERRIDE in .env.local to redirect
// all magic link emails to your own inbox during local testing.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'FigureReady <onboarding@resend.dev>'
const IS_PRODUCTION = !!process.env.RESEND_FROM_EMAIL

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email?: string }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const normalized = email.toLowerCase().trim()

    // Rate limit: max 3 requests per email per 15 min (DB-backed — works across serverless instances)
    const recent = await sql`
      SELECT COUNT(*)::int AS count FROM magic_links
      WHERE email = ${normalized}
        AND created_at > now() - interval '15 minutes'
    `
    if ((recent[0].count as number) >= 3) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait 15 minutes before trying again.' },
        { status: 429 },
      )
    }

    // Check that a Pro subscription exists for this email (active or awaiting activation)
    const subs = await sql`
      SELECT s.id FROM subscriptions s
      JOIN users u ON u.id = s.user_id
      WHERE u.email = ${normalized}
        AND s.status IN ('active', 'pending_confirmation')
        AND (s.current_period_end IS NULL OR s.current_period_end > now())
      LIMIT 1
    `

    // Always return { sent: true } — don't reveal whether the email has a subscription
    if (subs.length === 0) {
      return NextResponse.json({ sent: true })
    }

    const token     = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + TTL_MINUTES * 60 * 1000)

    await sql`
      INSERT INTO magic_links (id, email, token_hash, expires_at, created_at)
      VALUES (${randomUUID()}, ${normalized}, ${tokenHash}, ${expiresAt}, now())
    `

    const link = `${BASE_URL}/auth/verify?token=${token}`

    // In development without a verified domain, redirect emails to a local test inbox
    // to avoid Resend sandbox delivery restrictions.
    const recipient = IS_PRODUCTION
      ? normalized
      : (process.env.RESEND_DEV_RECIPIENT_OVERRIDE ?? normalized)

    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient,
      subject: 'Your FigureReady Pro access link',
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 16px;">
          <div style="margin-bottom:24px;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;background:#2563eb;border-radius:10px;">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3v18h18M7 16l4-5 3 3 5-7"/></svg>
            </span>
          </div>
          <h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px;">Access FigureReady Pro</h1>
          <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Click the button below to sign in to your Pro account.<br>
            This link expires in ${TTL_MINUTES}&nbsp;minutes and can only be used once.
          </p>
          <a href="${link}"
             style="display:inline-block;background:#2563eb;color:white;font-weight:600;font-size:14px;padding:12px 28px;border-radius:12px;text-decoration:none;">
            Sign in to FigureReady Pro →
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:28px;">
            If you did not request this link, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ sent: true })
  } catch (err) {
    console.error('[magic-link]', err)
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 })
  }
}
