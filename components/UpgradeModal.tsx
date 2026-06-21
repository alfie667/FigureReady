'use client'
import { useState } from 'react'
import { FREE_LIMIT_VALUE } from '@/lib/usageLimit'

interface Props {
  onClose: () => void
}

const PRO_MONTHLY_ID = '9a45f131-ddbf-40b0-9a22-d80f7bfed5f0'
const PRO_YEARLY_ID = '40f45042-69b6-482b-abb1-5f57e327bfb4'

export default function UpgradeModal({ onClose }: Props) {
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)

  const checkout = async (productId: string, plan: 'monthly' | 'yearly') => {
    setLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const { url, error } = await res.json()
      if (url) window.location.href = url
      else console.error('Checkout error:', error)
    } catch (err) {
      console.error('Checkout failed:', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Free limit reached</h2>
          <p className="text-sm text-slate-500">
            You&apos;ve used your {FREE_LIMIT_VALUE} free figures this month. Upgrade to Pro for unlimited figures.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => checkout(PRO_MONTHLY_ID, 'monthly')}
            disabled={loading !== null}
            className="w-full flex items-center justify-between px-5 py-4 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-60"
          >
            <div className="text-left">
              <p className="font-semibold text-slate-900">Pro Monthly</p>
              <p className="text-xs text-slate-500">Unlimited figures · Cancel anytime</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-blue-600">12€</p>
              <p className="text-xs text-slate-400">/month</p>
            </div>
            {loading === 'monthly' && <span className="ml-3 text-xs text-blue-600">...</span>}
          </button>

          <button
            onClick={() => checkout(PRO_YEARLY_ID, 'yearly')}
            disabled={loading !== null}
            className="w-full flex items-center justify-between px-5 py-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60 relative"
          >
            <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
              Save 31%
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-900">Pro Yearly</p>
              <p className="text-xs text-slate-500">Unlimited figures · Best value</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">99€</p>
              <p className="text-xs text-slate-400">/year</p>
            </div>
            {loading === 'yearly' && <span className="ml-3 text-xs text-slate-600">...</span>}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          Continue with free plan
        </button>
      </div>
    </div>
  )
}
