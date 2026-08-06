import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import type { NextResponse } from 'next/server'

export const SESSION_COOKIE = 'fr_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

interface SessionPayload extends JWTPayload {
  email: string
}

function getSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET
  if (!s) throw new Error('AUTH_SECRET environment variable is required')
  return new TextEncoder().encode(s)
}

export async function signSession(userId: string, email: string): Promise<string> {
  return new SignJWT({ email } as SessionPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret())
}

export async function verifySession(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSecret())
    if (!payload.sub || !payload.email) return null
    return { userId: payload.sub, email: payload.email }
  } catch {
    return null
  }
}

export function setSessionCookie(response: NextResponse, jwt: string): void {
  response.cookies.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export function getSessionToken(req: { cookies: { get: (name: string) => { value: string } | undefined } }): string | null {
  return req.cookies.get(SESSION_COOKIE)?.value ?? null
}
