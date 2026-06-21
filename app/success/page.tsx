'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { activatePro } from '@/lib/usageLimit'
import { Suspense } from 'react'

function SuccessContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const checkoutId = params.get('checkout_id')
    if (!checkoutId) {
      setStatus('error')
      return
    }

    fetch(`/api/verify-checkout?id=${checkoutId}`)
      .then(r => r.json())
      .then(({ confirmed }) => {
        if (confirmed) {
          activatePro()
          setStatus('success')
          setTimeout(() => router.push('/app'), 2500)
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [params, router])

  if (status === 'loading') {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Verifying your payment…</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Pro!</h1>
        <p className="text-slate-500 text-sm">Redirecting you to FigureReady…</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Verification failed</h1>
      <p className="text-slate-500 text-sm mb-6">We couldn&apos;t verify your payment. Please contact support.</p>
      <a href="mailto:zeggai_nouh@hotmail.fr" className="text-blue-600 text-sm underline">Contact support</a>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full">
        <Suspense fallback={<div className="text-center text-slate-400 text-sm">Loading…</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  )
}
