import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckoutButton, PricingViewTracker } from './CheckoutButton'
import { LogoFull } from '@/components/Logo'
import RestoreAccessForm from '@/components/RestoreAccessForm'

export const metadata: Metadata = {
  title: 'Pricing — FigureReady',
  description: 'Start free. Upgrade to Pro for unlimited figures, PNG + SVG + TIFF 300 dpi export, and no watermark.',
}


const proFeatures = [
  'Unlimited exports',
  'PNG · SVG · PDF · TIFF · EPS',
  '300 / 600 / 1200 DPI — your choice',
  'Custom figure size in mm/cm (Nature, Science, Cell dimensions built-in)',
  'No watermark',
  'Error bars & log scale',
  'Statistical significance annotations (★ p<0.05, ★★ p<0.01, ★★★ p<0.001)',
  'Panel figures — combine multiple plots (Fig. 1A, 1B, 1C)',
  'Journal-specific templates — Nature, Science, Cell, ACS, IEEE, Elsevier',
  'Author instructions built-in — correct specs for each journal',
  'Colorblind-friendly palettes (required by Nature & Cell)',
  'Scientific fonts — Arial, Helvetica, Times New Roman',
  'Customizable line width, marker size, axis ticks',
  '7-day money-back guarantee',
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
      <PricingViewTracker />

      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <LogoFull size={28} textSize={15} />
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
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Stop wasting time on formatting.</h1>
        <p className="text-slate-500 text-lg">FigureReady is free to use. Upgrade to export publication-ready figures at 300 DPI.</p>
      </section>

      {/* Plans */}
      <section className="max-w-3xl mx-auto px-6 pb-20">

        {/* Social proof */}
        <div className="text-center mb-8">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Styles built for</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Nature', 'ACS', 'Cell', 'Science', 'IEEE', 'PLOS ONE'].map(j => (
              <span key={j} className="px-3 py-1 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-500">{j}</span>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Monthly */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Monthly</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold text-slate-900">12€</span>
                <span className="text-slate-400 text-sm mb-1.5">/month</span>
              </div>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {proFeatures.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <CheckoutButton
              plan="monthly"
              className="block w-full text-center py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Get started →
            </CheckoutButton>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-400">
              <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              7-day money-back guarantee · cancel anytime from your Polar portal
            </div>
          </div>

          {/* Yearly */}
          <div className="bg-blue-600 border border-blue-600 rounded-2xl p-7 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wide whitespace-nowrap">
              Most popular
            </div>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">Yearly</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold text-white">99€</span>
                <span className="text-blue-200 text-sm mb-1.5">/year</span>
              </div>
              <p className="text-xs text-blue-200">~8.25€/month · Save 31% · Cancel anytime</p>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {proFeatures.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-white">
                  <CheckIcon muted />
                  {f}
                </li>
              ))}
            </ul>
            <CheckoutButton
              plan="yearly"
              className="block w-full text-center py-2.5 px-4 bg-white rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Get Pro →
            </CheckoutButton>
            <div className="mt-4 pt-4 border-t border-blue-500 flex items-start gap-2 text-xs text-blue-200">
              <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              7-day money-back guarantee · cancel anytime from your Polar portal
            </div>
          </div>

        </div>

        {/* Renewal transparency */}
        <p className="mt-5 text-xs text-slate-400 text-center leading-relaxed">
          Monthly plan renews on the same date each month. Yearly plan billed once per year, renews annually.{' '}
          Manage or cancel from the Polar customer portal — the link is sent to your email after purchase.
        </p>

        {/* Restore access */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-800 mb-1">Already a subscriber?</p>
          <p className="text-xs text-slate-500 mb-4">
            Enter your subscription email and we will send you a sign-in link to restore your Pro access.
          </p>
          <RestoreAccessForm />
        </div>

        {/* Trust bar */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Secure payment via Polar
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Cancel anytime, no commitment
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Your data never leaves your browser
          </span>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <h2 className="text-lg font-bold text-slate-900 mb-6 text-center">Frequently asked questions</h2>
        <div className="space-y-2">
          {[
            {
              defaultOpen: true,
              q: 'Can I cancel anytime?',
              a: 'Yes. Cancel in one click from your Polar customer portal — the link is in your purchase confirmation email. Your Pro access continues until the end of the paid period. No data is deleted when you cancel.',
            },
            {
              q: 'How do I cancel?',
              a: 'Open the Polar customer portal link from your purchase confirmation email and click "Cancel subscription". No form, no phone call.',
            },
            {
              q: 'Do you offer refunds?',
              a: '7-day money-back guarantee, no questions asked. Email contact@figure-ready.com within 7 days of purchase and we will refund you in full.',
            },
            {
              q: 'Will I be charged automatically?',
              a: 'Yes. Monthly plans renew each month on the same date; yearly plans renew once per year. You will receive a reminder email before each renewal and can cancel before it fires.',
            },
            {
              q: 'Is my data private?',
              a: 'Yes. Your Excel files are processed entirely in your browser and never sent to any server. FigureReady has no access to your data.',
            },
          ].map(({ q, a, defaultOpen }) => (
            <details key={q} open={defaultOpen} className="group rounded-xl border border-slate-200 bg-white overflow-hidden">
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
                <span className="text-sm font-semibold text-slate-900">{q}</span>
                <svg className="w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Still have questions?{' '}
          <a href="mailto:contact@figure-ready.com" className="text-blue-600 hover:underline">
            Contact us
          </a>
          {' '}— we reply within 24 hours.
        </p>
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
