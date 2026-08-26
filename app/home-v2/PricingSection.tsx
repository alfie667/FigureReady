'use client'
import { useState } from 'react'
import LandingCheckoutButton from '@/components/LandingCheckoutButton'
import Link from 'next/link'

function Check() {
  return (
    <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function Cross() {
  return (
    <svg className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

const FREE_FEATURES = [
  '1 free export',
  'PNG at 150 DPI',
  'Line, bar & scatter charts',
  'Excel upload (.xlsx)',
  'Watermark included',
]

const FREE_LOCKED = [
  'TIFF / EPS export',
  'Custom figure size (mm/cm)',
  'Statistical significance annotations',
  'Panel figures (Fig. 1A, 1B, 1C)',
  'Journal-specific templates',
  'Priority support',
]

const COMPARISON = [
  { feature: 'Price',                fr: '€99/year',   prism: '$840/year',   origin: '$1,500/year', excel: 'Included'  },
  { feature: 'Browser-based',        fr: '✅',          prism: '❌',           origin: '❌',           excel: '❌'         },
  { feature: 'No installation',      fr: '✅',          prism: '❌',           origin: '❌',           excel: '✅'         },
  { feature: 'Excel upload',         fr: '✅',          prism: '⚠️ Limited',   origin: '✅',           excel: '✅'         },
  { feature: 'TIFF 300 dpi export',  fr: '✅',          prism: '✅',           origin: '✅',           excel: '❌'         },
  { feature: 'Journal templates',    fr: '✅',          prism: '❌',           origin: '❌',           excel: '❌'         },
  { feature: 'Colorblind palettes',  fr: '✅',          prism: '❌',           origin: '❌',           excel: '❌'         },
  { feature: 'Statistical annotations', fr: '✅',       prism: '✅',           origin: '✅',           excel: '❌'         },
  { feature: 'Panel figures',        fr: '✅',          prism: '✅',           origin: '✅',           excel: '❌'         },
  { feature: 'Time to first figure', fr: '30 seconds', prism: '30 minutes',  origin: '45 minutes',  excel: '2 hours'   },
  { feature: 'Learning curve',       fr: 'None',       prism: 'Steep',       origin: 'Very steep',  excel: 'Medium'    },
]

const PRO_FEATURES = [
  'Unlimited exports',
  'PNG · SVG · PDF · TIFF · EPS',
  '300 / 600 / 1200 DPI — your choice',
  'Custom figure size in mm/cm (Nature, Science, Cell dimensions built-in)',
  'No watermark',
  'Error bars & log scale',
  'Panel figures — combine multiple plots (Fig. 1A, 1B, 1C)',
  'Colorblind-friendly palettes (required by Nature & Cell)',
  'Scientific fonts — Arial, Helvetica, Times New Roman',
  'Customizable line width, marker size, axis ticks',
  '7-day money-back guarantee',
  'Priority support',
]

export default function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')

  return (
    <section id="pricing" className="border-t border-slate-100 py-24 md:py-36">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-10">
          <h2
            className="font-bold text-[2rem] md:text-[2.75rem] leading-tight tracking-[-0.02em] text-[#0f172a] mb-4"
            style={{ fontFamily: 'var(--font-plus-jakarta), Inter, sans-serif' }}
          >
            Choose the plan that fits your research
          </h2>
          <p className="text-lg text-slate-500 max-w-[460px] mx-auto leading-relaxed">
            Start creating scientific figures for free, then upgrade when you need more.
          </p>
        </div>

        {/* ── COMPARISON TABLE ─────────────────────────────────────────── */}
        <div className="mb-20">
          <h2
            className="font-bold text-[1.75rem] md:text-[2.25rem] leading-tight tracking-[-0.02em] text-[#0f172a] mb-10 text-center"
            style={{ fontFamily: 'var(--font-plus-jakarta), Inter, sans-serif' }}
          >
            Why researchers choose FigureReady
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full min-w-[640px] text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-5 py-4 bg-slate-50 text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 w-48">Feature</th>
                  <th className="px-5 py-4 bg-blue-600 text-white font-bold text-center border-b border-blue-500 text-sm">FigureReady Pro</th>
                  <th className="px-5 py-4 bg-slate-50 text-slate-500 font-semibold text-center border-b border-slate-200 text-sm">GraphPad Prism</th>
                  <th className="px-5 py-4 bg-slate-50 text-slate-500 font-semibold text-center border-b border-slate-200 text-sm">OriginPro</th>
                  <th className="px-5 py-4 bg-slate-50 text-slate-500 font-semibold text-center border-b border-slate-200 text-sm">Excel</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? '' : 'bg-slate-50/60'}>
                    <td className="px-5 py-3 text-slate-700 font-medium border-b border-slate-100">{row.feature}</td>
                    <td className="px-5 py-3 text-center bg-blue-50 font-semibold text-slate-900 border-b border-blue-100">{row.fr}</td>
                    <td className="px-5 py-3 text-center text-slate-500 border-b border-slate-100">{row.prism}</td>
                    <td className="px-5 py-3 text-center text-slate-500 border-b border-slate-100">{row.origin}</td>
                    <td className="px-5 py-3 text-center text-slate-500 border-b border-slate-100">{row.excel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-400 text-center">
            Prices as of 2026. GraphPad and OriginPro require institutional license or personal purchase.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex items-center bg-slate-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                billing === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                billing === 'yearly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Yearly
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Save 31%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[760px] mx-auto">

          {/* Free */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col">
            <div className="mb-7">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Free</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[2.6rem] font-bold text-slate-900 leading-none">€0</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">No account required</p>
            </div>
            <Link
              href="/app"
              className="block w-full text-center border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl text-sm mb-7 transition-colors"
            >
              Start for free
            </Link>
            <ul className="space-y-3.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check />
                  <span className="text-[13px] text-slate-600 leading-snug">{f}</span>
                </li>
              ))}
              {FREE_LOCKED.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Cross />
                  <span className="text-[13px] text-slate-400 leading-snug line-through">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="bg-white border-2 border-blue-600 rounded-2xl p-8 flex flex-col relative">
            {billing === 'yearly' && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="bg-blue-600 text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                  Most popular
                </span>
              </div>
            )}

            <div className="mb-7">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Pro</p>

              {billing === 'yearly' ? (
                <>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-[2.6rem] font-bold text-slate-900 leading-none">€99</span>
                    <span className="text-slate-400 text-sm">/year</span>
                  </div>
                  <p className="text-sm text-blue-500 font-medium">≈ €8.25/month · Save 31%</p>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-[2.6rem] font-bold text-slate-900 leading-none">€12</span>
                    <span className="text-slate-400 text-sm">/month</span>
                  </div>
                  <p className="text-sm text-slate-400">Cancel anytime</p>
                </>
              )}
            </div>

            <LandingCheckoutButton
              plan={billing}
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm mb-7 transition-colors shadow-sm"
            >
              Get Pro
            </LandingCheckoutButton>

            <ul className="space-y-3.5 mt-auto">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check />
                  <span className="text-[13px] text-slate-600 leading-snug">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          7-day money-back guarantee · Secure payment via Polar
        </p>
      </div>
    </section>
  )
}
