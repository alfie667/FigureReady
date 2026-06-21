import { Polar } from '@polar-sh/sdk'
import { NextRequest, NextResponse } from 'next/server'

const polar = new Polar({ accessToken: process.env.POLAR_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json()
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${baseUrl}/success?checkout_id={CHECKOUT_ID}`,
    })

    return NextResponse.json({ url: checkout.url })
  } catch (err) {
    console.error('Polar checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
