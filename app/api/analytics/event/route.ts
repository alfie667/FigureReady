import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface EventPayload {
  event_name:  string
  plan?:        string | null
  source?:      string | null
  device_type?: string | null
  screen_width?: number | null
  duration_s?:  number | null
  abandon_type?: string | null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as EventPayload
    if (!body.event_name) return NextResponse.json({ ok: false }, { status: 400 })

    await sql`
      INSERT INTO funnel_events
        (id, event_name, plan, source, device_type, screen_width, duration_s, abandon_type)
      VALUES (
        ${randomUUID()},
        ${body.event_name},
        ${body.plan        ?? null},
        ${body.source      ?? null},
        ${body.device_type ?? null},
        ${typeof body.screen_width === 'number' ? body.screen_width : null},
        ${typeof body.duration_s   === 'number' ? body.duration_s   : null},
        ${body.abandon_type ?? null}
      )
    `
    return NextResponse.json({ ok: true })
  } catch {
    // Never let analytics errors surface to the client
    return NextResponse.json({ ok: true })
  }
}
