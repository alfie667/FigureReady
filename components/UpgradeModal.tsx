'use client'
import { useState } from 'react'
import { startCheckout } from '@/lib/checkout'

interface Props {
  onClose: () => void
  figureCreated?: boolean | null
  fileUploaded?: boolean | null
  sampleOnly?: boolean | null
}

export default function UpgradeModal({ onClose, figureCreated = null, fileUploaded = null, sampleOnly = null }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)

  function handleCheckout() {
    if (loading) return
    setLoading(true)
    startCheckout(
      { plan, location: 'upgrade_modal', trigger: 'upgrade_button', figureCreated, fileUploaded, sampleOnly },
      { newTab: false }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#bfdbfe] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Free export used</h2>
          <p className="text-sm text-slate-500">
            You&apos;ve used your 1 free export. Upgrade to Pro for unlimited exports, PNG 300 DPI, SVG, PDF, and no watermark.
          </p>
        </div>

        <div className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 mb-5 text-sm text-slate-600 space-y-1.5">
          {['Unlimited exports', 'PNG 300 DPI · SVG · PDF', 'No watermark', 'Priority support'].map(f => (
            <div key={f} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#2563eb] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </div>
          ))}
        </div>

        {/* Plan toggle */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setPlan('monthly')}
            className={`rounded-xl border-2 p-3 text-left transition-all ${
              plan === 'monthly' ? 'border-[#2563eb] bg-[#dbeafe]' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Monthly</p>
            <p className="text-xl font-extrabold text-slate-900">12€</p>
            <p className="text-xs text-slate-400">/month</p>
          </button>
          <button
            onClick={() => setPlan('yearly')}
            className={`rounded-xl border-2 p-3 text-left relative transition-all ${
              plan === 'yearly' ? 'border-[#2563eb] bg-[#dbeafe]' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="absolute -top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full">
              Save 31%
            </span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Yearly</p>
            <p className="text-xl font-extrabold text-slate-900">99€</p>
            <p className="text-xs text-slate-400">/year · ~8€/mo</p>
          </button>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="flex items-center justify-between w-full px-5 py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl transition-colors mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="font-semibold">{loading ? 'Redirecting…' : 'Upgrade to Pro'}</span>
          <div className="text-right">
            <p className="font-bold text-sm">{plan === 'monthly' ? '12€/month' : '99€/year'}</p>
            <p className="text-xs text-[#93c5fd]">{plan === 'monthly' ? 'or 99€/year' : '~8€/month'}</p>
          </div>
        </button>

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
