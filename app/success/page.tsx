'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { trackPurchase, trackPurchaseSuccess, type PlanType } from '@/lib/analytics'
import { getPendingCheckout } from '@/lib/checkout'

declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}

type ConfirmResult = {
  confirmed: boolean
  transactionId: string
  value: number
  currency: string
  plan: PlanType
  authenticated: boolean
}

type MeResult = {
  isPro: boolean
  isPendingActivation: boolean
}

// 'loading'            — calling /api/checkout/confirm
// 'activating'         — checkout confirmed, polling /api/auth/me for webhook activation
// 'confirmed'          — isPro = true (webhook received, subscription active)
// 'activation_pending' — polling timed out without activation; user can retry
// 'unconfirmed'        — Polar did not confirm the payment
// 'error'              — network / API error
// 'no-id'              — no checkout_id in URL
type Status = 'loading' | 'activating' | 'confirmed' | 'activation_pending' | 'unconfirmed' | 'error' | 'no-id'

const POLL_INTERVAL_MS = 2000
const POLL_MAX_ATTEMPTS = 20  // 40 seconds total before showing timeout UI

export default function SuccessPage() {
  const [status, setStatus] = useState<Status>('loading')
  const cancelledRef = useRef(false)

  function startPolling() {
    let attempts = 0
    cancelledRef.current = false

    function poll() {
      if (cancelledRef.current) return
      attempts++

      fetch('/api/auth/me', { cache: 'no-store' })
        .then(r => r.json() as Promise<MeResult>)
        .then(data => {
          if (cancelledRef.current) return
          if (data.isPro) {
            setStatus('confirmed')
          } else if (attempts >= POLL_MAX_ATTEMPTS) {
            setStatus('activation_pending')
          } else {
            setTimeout(poll, POLL_INTERVAL_MS)
          }
        })
        .catch(() => {
          if (cancelledRef.current) return
          if (attempts >= POLL_MAX_ATTEMPTS) {
            setStatus('activation_pending')
          } else {
            setTimeout(poll, POLL_INTERVAL_MS)
          }
        })
    }

    // First poll after a short delay to give the webhook a head start
    setTimeout(poll, 1000)
  }

  useEffect(() => {
    const checkoutId = new URLSearchParams(window.location.search).get('checkout_id')

    if (!checkoutId) {
      setStatus('no-id')
      return
    }

    fetch('/api/checkout/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutId }),
    })
      .then(r => r.json())
      .then((data: ConfirmResult & { error?: string }) => {
        if (data.error || !data.confirmed) {
          setStatus('unconfirmed')
          return
        }

        // Fire GA4 + FB analytics
        const pending = getPendingCheckout()
        trackPurchase({ transactionId: data.transactionId, value: data.value, currency: data.currency, plan: data.plan })
        trackPurchaseSuccess({
          transactionId:  data.transactionId,
          plan:           data.plan,
          value:          data.value,
          currency:       data.currency,
          location:       pending?.location       ?? null,
          trigger:        pending?.trigger        ?? null,
          figure_created: pending?.figure_created ?? null,
          file_uploaded:  pending?.file_uploaded  ?? null,
          sample_only:    pending?.sample_only    ?? null,
        })
        window.fbq?.('track', 'Purchase', { value: data.value, currency: data.currency })

        // Session cookie is now set — begin polling for webhook activation
        setStatus('activating')
        startPolling()
      })
      .catch(() => setStatus('error'))

    return () => { cancelledRef.current = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

          {/* Loading — verifying checkout */}
          {status === 'loading' && (
            <p className="text-slate-400 text-sm animate-pulse">Verifying your payment…</p>
          )}

          {/* Activating — payment confirmed, waiting for Polar webhook */}
          {status === 'activating' && (
            <>
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Activating your Pro account…</h1>
              <p className="text-slate-500 text-sm">
                Payment confirmed. Waiting for subscription activation — this usually takes a few seconds.
              </p>
            </>
          )}

          {/* Confirmed — subscription is active */}
          {status === 'confirmed' && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Welcome to FigureReady Pro!</h1>
              <p className="text-slate-500 text-sm mb-2">Your subscription is active.</p>
              <p className="text-slate-500 text-sm mb-8">
                You are signed in on this browser. If you open FigureReady on another device, use{' '}
                <Link href="/pricing" className="text-blue-600 hover:underline">Restore Pro access</Link>{' '}
                with your subscription email.
              </p>
              <a
                href="https://figureready.com/app"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md text-sm"
              >
                Go to the app →
              </a>
            </>
          )}

          {/* No checkout_id — Polar success URL may be misconfigured */}
          {status === 'no-id' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-3">Missing payment reference</h1>
              <p className="text-slate-500 text-sm mb-6">
                We received your visit but could not find a payment reference in the URL.
                If you completed a payment, please contact us with your order confirmation email.
              </p>
              <a
                href="mailto:contact@figure-ready.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md text-sm"
              >
                Contact support →
              </a>
            </>
          )}

          {/* Activation pending — webhook took too long */}
          {status === 'activation_pending' && (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-3">Activation in progress</h1>
              <p className="text-slate-500 text-sm mb-6">
                Your payment was confirmed and your account is being activated. This can take up to a minute.
                Click Retry to check again, or come back in a moment.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setStatus('activating'); startPolling() }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md text-sm"
                >
                  Retry →
                </button>
                <p className="text-xs text-slate-400">
                  Still not working?{' '}
                  <a href="mailto:contact@figure-ready.com" className="text-blue-600 hover:underline">
                    Contact us
                  </a>
                </p>
              </div>
            </>
          )}

          {/* Unconfirmed — Polar did not confirm */}
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

          {/* Error */}
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
