'use client'
import { useEffect, useState } from 'react'
import { trackPricingView } from '@/lib/analytics'
import { startCheckout } from '@/lib/checkout'

interface Props {
  /** after_free: user just received their free export and is prompted to upgrade.
   *  blocked:    user has exhausted their free quota and must upgrade to export. */
  mode: 'after_free' | 'blocked'
  previewDataUrl: string | null
  onClose: () => void
  figureCreated?: boolean | null
  fileUploaded?: boolean | null
  sampleOnly?: boolean | null
}

export default function PaywallModal({ mode, previewDataUrl, onClose, figureCreated = null, fileUploaded = null, sampleOnly = null }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)

  const isAfterFree = mode === 'after_free'

  useEffect(() => { trackPricingView() }, [])

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

        {/* Preview banner */}
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
            <div className="w-full h-full bg-gradient-to-br from-[#dbeafe] to-slate-100" />
          )}

          {isAfterFree ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/20">
              <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center mb-2 shadow-lg">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white text-sm font-semibold drop-shadow-md">Downloaded · 150 DPI · watermark</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/25">
              <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center mb-2 shadow-lg">
                <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-white text-sm font-semibold drop-shadow-md">Your figure is ready to download</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {isAfterFree ? (
            <>
              <h2 className="text-xl font-extrabold text-slate-900 mb-1">Upgrade for the full version</h2>
              <p className="text-sm text-slate-500 mb-5">
                You&apos;ve used your 1 free export. Go Pro for unlimited exports, 300 DPI, SVG, PDF, and no watermark.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-extrabold text-slate-900 mb-1">Unlock &amp; Download</h2>
              <p className="text-sm text-slate-500 mb-5">
                Get PNG (300 DPI), SVG with editable layers, and PDF — publication-ready for Nature, ACS, Cell, and more.
              </p>
            </>
          )}

          {/* Pro features */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 mb-5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
            {['Unlimited exports', 'No watermark', 'PNG · 300 DPI', 'SVG + PDF'].map(f => (
              <div key={f} className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#2563eb] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </div>
            ))}
          </div>

          {/* Plan toggle */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => setPlan('monthly')}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                plan === 'monthly' ? 'border-[#2563eb] bg-[#dbeafe]' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Monthly</p>
              <p className="text-2xl font-extrabold text-slate-900">12€</p>
              <p className="text-xs text-slate-400">/month</p>
            </button>
            <button
              onClick={() => setPlan('yearly')}
              className={`rounded-xl border-2 p-4 text-left relative transition-all ${
                plan === 'yearly' ? 'border-[#2563eb] bg-[#dbeafe]' : 'border-slate-200 hover:border-slate-300'
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

          <button
            disabled={loading}
            onClick={() => {
              if (loading) return
              setLoading(true)
              startCheckout(
                { plan, location: 'paywall_modal', trigger: 'export_limit', figureCreated, fileUploaded, sampleOnly },
                { newTab: true, onComplete: () => setLoading(false) }
              )
            }}
            className="block w-full text-center py-3.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl transition-colors shadow-md text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Opening…' : isAfterFree ? 'Upgrade to Pro →' : 'Unlock & Download →'}
          </button>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              {['VISA', 'MC', 'AMEX'].map(b => (
                <span key={b} className="px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-bold text-slate-400 tracking-wide">{b}</span>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400">
              Secure checkout via Polar · Cancel anytime · 7-day refund
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
