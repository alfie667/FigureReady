import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, source } = await req.json() as { email: string; source?: string }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: 'FigureReady <onboarding@resend.dev>',
    to: 'zeggai_nouh@hotmail.fr',
    subject: `New signup: ${email}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#1e40af;">New FigureReady signup</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Source:</strong> ${source ?? 'unknown'}</p>
        <p style="color:#64748b;font-size:13px;">Received at ${new Date().toISOString()}</p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
