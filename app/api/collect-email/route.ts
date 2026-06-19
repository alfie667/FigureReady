import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, source } = await req.json() as { email: string; source?: string }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set')
    return NextResponse.json({ error: 'Server config error' }, { status: 500 })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: 'zeggai_nouh@hotmail.fr',
      subject: `New FigureReady signup: ${email}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#1e40af;">New FigureReady signup</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Source:</strong> ${source ?? 'unknown'}</p>
          <p style="color:#64748b;font-size:13px;">${new Date().toISOString()}</p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: 'Email failed', detail: err }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
