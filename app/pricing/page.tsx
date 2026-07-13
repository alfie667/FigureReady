import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing — FigureReady',
  description: 'Start free. Upgrade to Pro for unlimited figures, PNG + SVG + TIFF 300 dpi export, and no watermark.',
}

const CHECKOUT_URL = 'https://buy.polar.sh/polar_cl_VGeVJ2XK6HM9vWagdGyajurF8CZKTptFpUqSX4Ljhc8'

const freeFeatures = [
  '3 figures per month',
  'Excel upload (.xlsx)',
  'Line, scatter, bar charts',
  'PNG & SVG export (300 DPI)',
  'Error bars',
  'Basic style options',
]

const proFeatures = [
  'Unlimited figures',
  'Excel upload (.xlsx)',
  'Line, scatter, bar charts',
  'PNG & SVG export (300 DPI)',
  'No watermark',
  'ACS / Nature / IEEE styles',
  'Error bars',
  'Style customization',
  'Priority support',
]

function CheckIcon({ muted }: { muted?: boolean }) {
  return (
    <svg className={`w-4 h-4 shrink-0 mt-0.5 ${muted ? 'text-blue-200' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function PricingPage() {
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
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6">

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
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-blue-600 border border-blue-600 rounded-2xl p-7 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wide whitespace-nowrap">
              Most popular
            </div>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">Pro</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold text-white">12€</span>
                <span className="text-blue-200 text-sm mb-1.5">/month</span>
              </div>
              <p className="text-xs text-blue-200">or 99€/year (save 31%) · Cancel anytime</p>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {proFeatures.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-white">
                  <CheckIcon muted />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={CHECKOUT_URL}
              className="block text-center py-2.5 px-4 bg-white rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Get Pro →
            </a>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <h2 className="text-lg font-bold text-slate-900 mb-6 text-center">Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your Polar dashboard at any time. No questions asked.' },
            { q: 'What counts as a figure?', a: 'Each exported PNG, SVG or TIFF counts as one figure. Previewing inside the app is unlimited and free.' },
            { q: 'Is my data private?', a: 'Yes. Your Excel files never leave your browser. Nothing is uploaded to a server.' },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900 mb-1">{q}</p>
              <p className="text-sm text-slate-500">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>FigureReady — 2026</span>
          <div className="flex items-center gap-5">
            <Link href="/roadmap" className="hover:text-slate-600 transition-colors">Roadmap</Link>
            <a href="mailto:contact@figure-ready.com" className="hover:text-slate-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
