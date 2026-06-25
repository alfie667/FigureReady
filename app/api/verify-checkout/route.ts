import { Polar } from '@polar-sh/sdk'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const polar = new Polar({ accessToken: process.env.POLAR_API_KEY! })

export async function GET(req: NextRequest) {
  try {
    const checkoutId = req.nextUrl.searchParams.get('id')
    if (!checkoutId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const checkout = await polar.checkouts.get({ id: checkoutId })
    const confirmed = checkout.status === 'confirmed' || checkout.status === 'succeeded'

    return NextResponse.json({ confirmed })
  } catch (err) {
    console.error('Polar verify error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
