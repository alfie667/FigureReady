'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { activatePro } from '@/lib/usageLimit'
import { trackPurchase, type PlanType } from '@/lib/analytics'

declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}

type VerifyResult = {
  confirmed: boolean
  transactionId: string
  value: number
  currency: string
  plan: PlanType
}

type Status = 'loading' | 'confirmed' | 'unconfirmed' | 'error' | 'no-id'

export default function SuccessPage() {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    const checkoutId = new URLSearchParams(window.location.search).get('checkout_id')

    if (!checkoutId) {
      // No checkout_id in URL — Polar dashboard may not be configured with {CHECKOUT_ID}.
      // Do NOT activate Pro here; user should contact support.
      setStatus('no-id')
      return
    }

    fetch(`/api/verify-checkout?id=${encodeURIComponent(checkoutId)}`)
      .then(r => r.json())
      .then((data: VerifyResult & { error?: string }) => {
        if (data.error || !data.confirmed) { setStatus('unconfirmed'); return }

        activatePro()

        trackPurchase({
          transactionId: data.transactionId,
          value:         data.value,
          currency:      data.currency,
          plan:          data.plan,
        })

        // Client-side FB pixel (server-side event already fired via webhook)
        window.fbq?.('track', 'Purchase', { value: data.value, currency: data.currency })

        setStatus('confirmed')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-900 font-sans antialiased flex flex-col">

      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 16l4-5 3 3 5-7" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">FigureReady</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">

          {status === 'loading' && (
            <p className="text-slate-400 text-sm animate-pulse">Verifying your payment…</p>
          )}

          {(status === 'confirmed' || status === 'no-id') && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-3">
                Welcome to FigureReady Pro!
              </h1>
              <p className="text-slate-500 text-sm mb-2">Your payment was successful.</p>
              <p className="text-slate-500 text-sm mb-8">You now have unlimited access to all features.</p>
              <a
                href="https://figureready.com/app"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md text-sm"
              >
                Go back to the app →
              </a>
            </>
          )}

          {status === 'unconfirmed' && (
            <>
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-3">Payment pending</h1>
              <p className="text-slate-500 text-sm mb-6">
                Your payment has not been confirmed yet. Please check your email or try again in a few minutes.
              </p>
              <Link href="/pricing" className="text-blue-600 hover:underline text-sm">Back to pricing</Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-3">Verification failed</h1>
              <p className="text-slate-500 text-sm mb-6">
                We could not verify your payment. Please contact us at{' '}
                <a href="mailto:contact@figure-ready.com" className="text-blue-600 hover:underline">
                  contact@figure-ready.com
                </a>{' '}
                and we will sort it out immediately.
              </p>
              <Link href="/pricing" className="text-blue-600 hover:underline text-sm">Back to pricing</Link>
            </>
          )}

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-slate-400">
          FigureReady — 2026
        </div>
      </footer>

    </div>
  )
}
