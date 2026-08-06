import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { sql } from '@/lib/db'
import { signSession, setSessionCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${origin}/pricing?auth_error=invalid_link`)
  }

  const tokenHash = createHash('sha256').update(token).digest('hex')

  const links = await sql`
    SELECT id, email, expires_at, used_at
    FROM magic_links
    WHERE token_hash = ${tokenHash}
    LIMIT 1
  ` as Array<{ id: string; email: string; expires_at: string; used_at: string | null }>

  const link = links[0]

  if (!link || link.used_at || new Date(link.expires_at) < new Date()) {
    return NextResponse.redirect(`${origin}/pricing?auth_error=expired_link`)
  }

  // Mark token as used (one-time use)
  await sql`UPDATE magic_links SET used_at = now() WHERE id = ${link.id}`

  const users = await sql`
    SELECT id FROM users WHERE email = ${link.email} LIMIT 1
  ` as Array<{ id: string }>

  if (!users[0]) {
    return NextResponse.redirect(`${origin}/pricing?auth_error=no_account`)
  }

  const jwt = await signSession(users[0].id, link.email)
  const response = NextResponse.redirect(`${origin}/app`)
  setSessionCookie(response, jwt)
  return response
}
