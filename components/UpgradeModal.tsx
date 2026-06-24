'use client'
import { FREE_LIMIT_VALUE } from '@/lib/usageLimit'

const CHECKOUT_URL = 'https://buy.polar.sh/polar_cl_aOYqFlFlGipbAJHydBzpgcO8IiLs5AZPajBEF2f2UOD'

interface Props {
  onClose: () => void
}

export default function UpgradeModal({ onClose }: Props) {
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
            You&apos;ve used your {FREE_LIMIT_VALUE} free figures this month. Upgrade to Pro for unlimited figures, PNG + SVG + TIFF export, and no watermark.
          </p>
        </div>

        <div className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 mb-4 text-sm text-slate-600 space-y-1.5">
          {['Unlimited figures', 'PNG + SVG + TIFF 300 dpi', 'No watermark', 'Priority support'].map(f => (
            <div key={f} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </div>
          ))}
        </div>

        <a
          href={CHECKOUT_URL}
          className="flex items-center justify-between w-full px-5 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors mb-3"
        >
          <span className="font-semibold">Upgrade to Pro</span>
          <div className="text-right">
            <p className="font-bold text-sm">12€/month</p>
            <p className="text-xs text-blue-200">or 99€/year</p>
          </div>
        </a>

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
