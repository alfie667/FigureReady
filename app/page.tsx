import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import BetaSignupForm from '@/components/BetaSignupForm'
import GatedAppLink from '@/components/GatedAppLink'
import SampleDataButton from '@/components/SampleDataButton'

export const metadata: Metadata = {
  title: 'FigureReady â€” Free Scientific Figure Maker from Excel',
  description: 'Upload your Excel file and get a publication-ready scientific figure in seconds. No code, no GraphPad, no Origin. Free for PhD students and researchers.',
  alternates: { canonical: 'https://figureready.com' },
  openGraph: {
    title: 'FigureReady â€” Free Scientific Figure Maker from Excel',
    description: 'Upload your Excel file and get a publication-ready scientific figure in seconds. Free for PhD students and researchers.',
    url: 'https://figureready.com',
    type: 'website',
    siteName: 'FigureReady',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FigureReady â€” Free Scientific Figure Maker from Excel',
    description: 'Upload your Excel file and get a publication-ready scientific figure in seconds. Free for researchers.',
    images: ['/opengraph-image'],
  },
}

const features = [
  { label: 'Excel upload (.xlsx)', desc: 'Drop your file, columns detected automatically.' },
  { label: 'Multiple curves', desc: 'Plot several Y series on the same figure.' },
  { label: 'Error bars', desc: 'Attach standard deviation or standard error columns.' },
  { label: 'Style customization', desc: 'Font, line width, markers, colors â€” visually.' },
  { label: 'PNG & SVG export', desc: 'High-resolution PNG (300 DPI) and scalable SVG with editable layers.' },
]

const steps = [
  { n: '1', title: 'Upload your Excel file', desc: 'Drag and drop a .xlsx file. Columns are detected automatically.' },
  { n: '2', title: 'Configure your figure', desc: 'Select X and Y axes, chart type, series names, and error bars.' },
  { n: '3', title: 'Export publication-ready graphics', desc: 'Download PNG at 300 DPI or SVG with separate editable layers.' },
]


const tableRows = [
  ['0', '0.12', '0.06'],
  ['1', '0.31', '0.14'],
  ['2', '0.48', '0.25'],
  ['3', '0.69', '0.38'],
  ['4', '0.86', '0.47'],
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-900 font-sans antialiased">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 16l4-5 3 3 5-7" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">FigureReady</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">Pricing</Link>
            <Link href="/roadmap" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">Roadmap</Link>
            <GatedAppLink className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              Try it free
            </GatedAppLink>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-medium text-blue-700">Free to use · No account needed</span>
        </div>

        <h1
          className="font-extrabold text-slate-900 leading-tight mb-4"
          style={{ fontSize: '56px', letterSpacing: '-0.03em' }}
        >
          From Excel to publication-ready<br className="hidden sm:block" /> figure in seconds
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          No Origin. No Prism. Upload your data and get a clean, journal-quality graphic ready to export.
        </p>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex -space-x-2">
            {['bg-blue-500','bg-violet-500','bg-emerald-500','bg-orange-500','bg-pink-500'].map((c,i) => (
              <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-[10px] font-bold`}>
                {['P','R','A','S','M'][i]}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600 font-medium">
            <span className="font-bold text-slate-900">500+</span> researchers already use FigureReady
          </p>
        </div>

        {/* Email capture */}
        <div className="mb-10">
          <BetaSignupForm />
        </div>

        {/* Excel â†’ Figure transformation */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-5 mb-10">

          {/* Excel mock */}
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-lg w-full max-w-[268px] text-left shrink-0">
            <div className="bg-[#1D6F42] px-3 py-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 1.5L18.5 9H13zM8.5 17l2-3-2-3h1.6l1.2 2 1.2-2H14l-2 3 2 3h-1.6l-1.2-2-1.2 2z"/>
              </svg>
              <span className="text-white text-xs font-semibold">data.xlsx</span>
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-3 py-2 text-left font-semibold text-slate-500 border-r border-slate-200">Conc. (mM)</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500 border-r border-slate-200">Sample A</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">Sample B</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(([c, a, b], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="px-3 py-1.5 border-r border-slate-100 text-slate-600">{c}</td>
                    <td className="px-3 py-1.5 border-r border-slate-100 text-right font-mono text-slate-700">{a}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-slate-700">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-md rotate-90 lg:rotate-0 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">FigureReady</span>
          </div>

          {/* Publication-ready figure â€” real screenshot */}
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-lg bg-white w-full max-w-sm shrink-0">
            <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Publication-ready figure</span>
            </div>
            <Image
              src="/demo-figure.png"
              alt="Publication-ready figure: Absorbance vs Concentration (mM) â€” Sample A and Sample B, exported from FigureReady"
              width={700}
              height={527}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <GatedAppLink className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-colors shadow-md">
            Upload your Excel. Download your figure â†’
          </GatedAppLink>
          <SampleDataButton className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700 text-base font-semibold rounded-xl transition-colors cursor-pointer" />
        </div>
        <p className="text-xs text-slate-400 mt-3">â†‘ Downloads a ready-to-use .xlsx file â€” open it in the app to see it become a figure</p>

      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <p className="text-center mb-3" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2563eb' }}>Features</p>
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">Everything you need, nothing you don&apos;t</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <div key={f.label} className="flex items-start gap-3 bg-white" style={{ border: '1px solid #e4e7ec', borderRadius: '12px', padding: '24px' }}>
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{f.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-t border-[#e4e7ec] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center mb-3" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2563eb' }}>How it works</p>
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">Three steps to a publication-ready figure</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map(s => (
              <div key={s.n} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white text-base font-bold flex items-center justify-center mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white border-t border-[#e4e7ec] py-20" id="pricing">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center mb-3" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2563eb' }}>Pricing</p>
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-3">Simple, transparent pricing</h2>
          <p className="text-center text-slate-500 text-sm mb-12">Build and preview for free. Pay only when you download.</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Monthly */}
            <div className="border border-slate-200 rounded-2xl p-7 flex flex-col">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Monthly</p>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-extrabold text-slate-900">12â‚¬</span>
                <span className="text-slate-400 text-sm mb-1.5">/month</span>
              </div>
              <ul className="space-y-2 flex-1 mb-6 text-sm text-slate-600">
                {['Unlimited figures', 'Excel upload (.xlsx)', 'PNG & SVG export (300 DPI)', 'Error bars', 'Style customization', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="https://buy.polar.sh/polar_cl_VGeVJ2XK6HM9vWagdGyajurF8CZKTptFpUqSX4Ljhc8" className="block text-center py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                Get started â†’
              </a>
            </div>

            {/* Yearly */}
            <div className="bg-blue-600 rounded-2xl p-7 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wide whitespace-nowrap">
                Save 31%
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">Yearly</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold text-white">99â‚¬</span>
                <span className="text-blue-200 text-sm mb-1.5">/year</span>
              </div>
              <p className="text-xs text-blue-300 mb-4">~8.25â‚¬/month</p>
              <ul className="space-y-2 flex-1 mb-6 text-sm text-white">
                {['Unlimited figures', 'Excel upload (.xlsx)', 'PNG & SVG export (300 DPI)', 'Error bars', 'Style customization', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="https://buy.polar.sh/polar_cl_VGeVJ2XK6HM9vWagdGyajurF8CZKTptFpUqSX4Ljhc8" className="block text-center py-2.5 px-4 bg-white rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                Get started â†’
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Try FigureReady now</h2>
        <p className="text-slate-500 text-sm mb-8">No account needed. Works in your browser.</p>
        <GatedAppLink className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md">
          Upload your first figure â†’
        </GatedAppLink>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>FigureReady â€” 2026</span>
          <div className="flex items-center gap-5">
            <Link href="/pricing" className="hover:text-slate-600 transition-colors">Pricing</Link>
            <Link href="/roadmap" className="hover:text-slate-600 transition-colors">Roadmap</Link>
            <Link href="/graphpad-alternative" className="hover:text-slate-600 transition-colors">Free GraphPad Prism Alternative</Link>
            <a href="mailto:contact@figure-ready.com" className="hover:text-slate-600 transition-colors">Contact</a>
            <Link href="/admin" className="hover:text-slate-600 transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}


