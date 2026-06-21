'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PRO_MONTHLY_ID = '9a45f131-ddbf-40b0-9a22-d80f7bfed5f0'
const PRO_YEARLY_ID = '40f45042-69b6-482b-abb1-5f57e327bfb4'

const freeFeatures = [
  '3 figures per month',
  'Excel upload (.xlsx)',
  'Line, scatter, bar charts',
  'PNG & SVG export',
  'ACS / Nature styles',
]

const proFeatures = [
  'Unlimited figures',
  'Excel upload (.xlsx)',
  'Line, scatter, bar charts',
  'PNG & SVG export (3×)',
  'ACS / Nature styles',
  'Error bars',
  'Style customization',
  'Priority support',
]

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function PricingPage() {
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)
  const router = useRouter()

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
    <div className="min-h-screen bg-[#f9fafb] text-slate-900 font-sans antialiased">
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
          <div className="flex items-center gap-6">
            <Link href="/roadmap" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">Roadmap</Link>
            <Link href="/app" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              Try it free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Simple, transparent pricing</h1>
        <p className="text-slate-500 text-lg">Start free. Upgrade when you need more.</p>
      </section>

      {/* Plans */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">

          {/* Free */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Free</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold text-slate-900">0€</span>
                <span className="text-slate-400 text-sm mb-1.5">/month</span>
              </div>
              <p className="text-xs text-slate-400">No credit card needed</p>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {freeFeatures.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/app"
              className="block text-center py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Get started
            </Link>
          </div>

          {/* Pro Monthly */}
          <div className="bg-blue-600 border border-blue-600 rounded-2xl p-7 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wide">
              Most popular
            </div>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">Pro Monthly</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold text-white">12€</span>
                <span className="text-blue-200 text-sm mb-1.5">/month</span>
              </div>
              <p className="text-xs text-blue-200">Cancel anytime</p>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {proFeatures.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-white">
                  <svg className="w-4 h-4 text-blue-200 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => checkout(PRO_MONTHLY_ID, 'monthly')}
              disabled={loading !== null}
              className="block w-full text-center py-2.5 px-4 bg-white rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-60"
            >
              {loading === 'monthly' ? 'Redirecting…' : 'Subscribe monthly'}
            </button>
          </div>

          {/* Pro Yearly */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wide">
              Save 31%
            </div>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Pro Yearly</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold text-slate-900">99€</span>
                <span className="text-slate-400 text-sm mb-1.5">/year</span>
              </div>
              <p className="text-xs text-slate-400">~8.25€/month · Best value</p>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {proFeatures.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => checkout(PRO_YEARLY_ID, 'yearly')}
              disabled={loading !== null}
              className="block w-full text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {loading === 'yearly' ? 'Redirecting…' : 'Subscribe yearly'}
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>FigureReady — free beta, 2026</span>
          <div className="flex items-center gap-5">
            <Link href="/roadmap" className="hover:text-slate-600 transition-colors">Roadmap</Link>
            <a href="mailto:zeggai_nouh@hotmail.fr" className="hover:text-slate-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
