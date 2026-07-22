'use client'
import { useState } from 'react'

const CHECKOUT_MONTHLY = 'https://buy.polar.sh/polar_cl_VGeVJ2XK6HM9vWagdGyajurF8CZKTptFpUqSX4Ljhc8'
const CHECKOUT_YEARLY  = 'https://buy.polar.sh/polar_cl_flJ14D6H057GZslZY6hQBdRbz7Mk6Kd4fnfaA2056F1'

interface Props {
  previewDataUrl: string | null
  onClose: () => void
}

export default function PaywallModal({ previewDataUrl, onClose }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly')
  const checkoutUrl = plan === 'monthly' ? CHECKOUT_MONTHLY : CHECKOUT_YEARLY

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>

        {/* Blurred figure preview */}
        <div className="relative h-44 overflow-hidden bg-slate-100 select-none">
          {previewDataUrl ? (
            <img
              src={previewDataUrl}
              alt=""
              aria-hidden
              draggable={false}
              className="w-full h-full object-cover pointer-events-none"
              style={{ filter: 'blur(7px)', transform: 'scale(1.08)' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#e8f5ee] to-slate-100" />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/25">
            <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center mb-2 shadow-lg">
              <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-white text-sm font-semibold drop-shadow-md">Your figure is ready to download</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-1">Unlock & Download</h2>
          <p className="text-sm text-slate-500 mb-5">
            Get your PNG (300 DPI) and SVG with editable layers — publication-ready for Nature, ACS, Cell, and more.
          </p>

          {/* Plan toggle */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => setPlan('monthly')}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                plan === 'monthly' ? 'border-[#1D6F42] bg-[#e8f5ee]' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Monthly</p>
              <p className="text-2xl font-extrabold text-slate-900">12€</p>
              <p className="text-xs text-slate-400">/month</p>
            </button>
            <button
              onClick={() => setPlan('yearly')}
              className={`rounded-xl border-2 p-4 text-left relative transition-all ${
                plan === 'yearly' ? 'border-[#1D6F42] bg-[#e8f5ee]' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                Save 31%
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Yearly</p>
              <p className="text-2xl font-extrabold text-slate-900">99€</p>
              <p className="text-xs text-slate-400">/year · ~8€/mo</p>
            </button>
          </div>

          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3.5 bg-[#1D6F42] hover:bg-[#155d35] text-white font-bold rounded-xl transition-colors shadow-md text-sm"
          >
            Unlock & Download →
          </a>
          <p className="text-center text-xs text-slate-400 mt-3">
            Secure payment · Cancel anytime · Return here after payment to download
          </p>
        </div>
      </div>
    </div>
  )
}
