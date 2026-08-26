'use client'
import { useState } from 'react'
import LandingCheckoutButton from '@/components/LandingCheckoutButton'
import Link from 'next/link'

/* ── Table icons ──────────────────────────────────────────────────────────── */

function TCheck({ blue }: { blue?: boolean }) {
  return (
    <svg
      className={`w-[18px] h-[18px] mx-auto ${blue ? 'text-blue-600' : 'text-emerald-500'}`}
      viewBox="0 0 20 20" fill="currentColor" aria-hidden
    >
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

function TDash() {
  return <span className="block w-5 h-px bg-slate-250 mx-auto" style={{ background: '#cbd5e1' }} />
}

function Cell({ val, isBlue }: { val: string; isBlue?: boolean }) {
  if (val === '✅') return <TCheck blue={isBlue} />
  if (val === '❌') return <TDash />
  if (val === '⚠️ Limited') return (
    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      Limited
    </span>
  )
  return (
    <span className={`text-[13px] font-${isBlue ? 'semibold' : 'normal'} ${isBlue ? 'text-blue-700' : 'text-slate-400'}`}>
      {val}
    </span>
  )
}

/* ── Feature list icons ────────────────────────────────────────────────────── */

function FeatureCheck() {
  return (
    <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function FeatureCross() {
  return (
    <svg className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

/* ── Data ──────────────────────────────────────────────────────────────────── */

const COMPARISON: { feature: string; fr: string; prism: string; origin: string; excel: string }[] = [
  { feature: 'Price',                   fr: '€99 / year',  prism: '$840 / year',  origin: '$1,500 / year', excel: 'Included'  },
  { feature: 'Browser-based',           fr: '✅',           prism: '❌',            origin: '❌',             excel: '❌'         },
  { feature: 'No installation',         fr: '✅',           prism: '❌',            origin: '❌',             excel: '✅'         },
  { feature: 'Excel upload',            fr: '✅',           prism: '⚠️ Limited',   origin: '✅',             excel: '✅'         },
  { feature: 'TIFF 300 dpi export',     fr: '✅',           prism: '✅',            origin: '✅',             excel: '❌'         },
  { feature: 'Journal templates',       fr: '✅',           prism: '❌',            origin: '❌',             excel: '❌'         },
  { feature: 'Colorblind palettes',     fr: '✅',           prism: '❌',            origin: '❌',             excel: '❌'         },
  { feature: 'Statistical annotations', fr: '✅',           prism: '✅',            origin: '✅',             excel: '❌'         },
  { feature: 'Panel figures',           fr: '✅',           prism: '✅',            origin: '✅',             excel: '❌'         },
  { feature: 'Time to first figure',    fr: '30 seconds',  prism: '30 minutes',   origin: '45 minutes',    excel: '2 hours'   },
  { feature: 'Learning curve',          fr: 'None',        prism: 'Steep',        origin: 'Very steep',    excel: 'Medium'    },
]

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

const COLS = [
  { key: 'prism',  label: 'GraphPad Prism' },
  { key: 'origin', label: 'OriginPro'      },
  { key: 'excel',  label: 'Excel'          },
] as const

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')

  return (
    <section id="pricing" className="border-t border-slate-100 py-24 md:py-36">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">

        {/* ── Comparison table ──────────────────────────────────────── */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2
              className="font-bold text-[2rem] md:text-[2.75rem] leading-tight tracking-[-0.02em] text-[#0f172a] mb-3"
              style={{ fontFamily: 'var(--font-plus-jakarta), Inter, sans-serif' }}
            >
              Why researchers choose FigureReady
            </h2>
            <p className="text-[17px] text-slate-500 max-w-[460px] mx-auto leading-relaxed">
              See how we compare to the tools you already know.
            </p>
          </div>

          {/* Scrollable wrapper */}
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="min-w-[700px]">
              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                <table className="w-full text-sm border-collapse">

                  {/* ── Header ──────────────────────────── */}
                  <thead>
                    <tr>
                      {/* Feature label */}
                      <th className="text-left px-7 py-5 bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-widest text-slate-400 w-[230px]">
                        Feature
                      </th>

                      {/* FigureReady Pro — blue accent top */}
                      <th className="px-5 py-0 bg-white border-b border-slate-200 relative w-[175px]">
                        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 to-blue-600" />
                        <div className="pt-5 pb-4 text-center">
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide mb-2">
                            <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            Recommended
                          </span>
                          <span className="block text-slate-900 font-bold text-[14px] leading-snug">FigureReady Pro</span>
                        </div>
                      </th>

                      {/* Competitors */}
                      {COLS.map(c => (
                        <th key={c.key} className="px-5 py-5 bg-slate-50 border-b border-slate-200 text-center text-[13px] font-semibold text-slate-400 w-[130px]">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* ── Body ────────────────────────────── */}
                  <tbody>
                    {COMPARISON.map((row, i) => {
                      const isLast = i === COMPARISON.length - 1
                      const rowClass = i % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                      const divider = !isLast ? 'border-b border-slate-100' : ''
                      return (
                        <tr key={row.feature} className={rowClass}>
                          <td className={`px-7 py-4 text-[13px] text-slate-700 font-medium ${divider}`}>
                            {row.feature}
                          </td>
                          <td className={`px-5 py-4 text-center bg-[#f0f7ff] ${!isLast ? 'border-b border-blue-100' : ''}`}>
                            <Cell val={row.fr} isBlue />
                          </td>
                          <td className={`px-5 py-4 text-center ${divider}`}><Cell val={row.prism} /></td>
                          <td className={`px-5 py-4 text-center ${divider}`}><Cell val={row.origin} /></td>
                          <td className={`px-5 py-4 text-center ${divider}`}><Cell val={row.excel} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400 text-center">
            Prices as of 2026. GraphPad and OriginPro require an institutional or personal license.
          </p>
        </div>

        {/* ── Pricing plans ─────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Pricing</p>
          <h2
            className="font-bold text-[1.75rem] md:text-[2.25rem] leading-tight tracking-[-0.02em] text-[#0f172a] mb-4"
            style={{ fontFamily: 'var(--font-plus-jakarta), Inter, sans-serif' }}
          >
            Choose the plan that fits your research
          </h2>
          <p className="text-slate-500 max-w-[420px] mx-auto">
            Start for free, upgrade when you need more.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex items-center bg-slate-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                billing === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                billing === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Yearly
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Save 31%</span>
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
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5">
                  <FeatureCheck />
                  <span className="text-[13px] text-slate-600 leading-snug">{f}</span>
                </li>
              ))}
              {FREE_LOCKED.map(f => (
                <li key={f} className="flex items-start gap-2.5">
                  <FeatureCross />
                  <span className="text-[13px] text-slate-400 leading-snug line-through">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="bg-white border-2 border-blue-600 rounded-2xl p-8 flex flex-col relative">
            {billing === 'yearly' && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="bg-blue-600 text-white text-[11px] font-semibold px-3 py-1 rounded-full">Most popular</span>
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
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5">
                  <FeatureCheck />
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
