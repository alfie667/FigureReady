import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import GatedAppLink from '@/components/GatedAppLink'
import SampleDataButton from '@/components/SampleDataButton'

export const metadata: Metadata = {
  title: 'FigureReady — Free Scientific Figure Maker from Excel',
  description: 'Upload your Excel file and get a publication-ready scientific figure in seconds. No code, no GraphPad, no Origin. Free for PhD students and researchers.',
  alternates: { canonical: 'https://figureready.com' },
  openGraph: {
    title: 'FigureReady — Free Scientific Figure Maker from Excel',
    description: 'Upload your Excel file and get a publication-ready scientific figure in seconds. Free for PhD students and researchers.',
    url: 'https://figureready.com',
    type: 'website',
    siteName: 'FigureReady',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FigureReady — Free Scientific Figure Maker from Excel',
    description: 'Upload your Excel file and get a publication-ready scientific figure in seconds. Free for researchers.',
    images: ['/opengraph-image'],
  },
}

const features = [
  { icon: '📊', label: 'Excel upload', desc: 'Drop your .xlsx file — columns detected automatically, zero configuration.' },
  { icon: '📈', label: 'Multiple curves & dual Y axis', desc: 'Plot several series on the same chart. Assign each to Y1 or Y2 independently.' },
  { icon: '±',  label: 'Error bars', desc: 'Attach standard deviation or standard error columns in one click.' },
  { icon: '🔢', label: 'Logarithmic scale', desc: 'Switch X or Y axis to log scale instantly — handles any range of data.' },
  { icon: '🎨', label: 'Full style control', desc: 'Font, line weight, marker shape, colors, grid — all visual, no code.' },
  { icon: '⬇️', label: 'PNG 300 DPI & SVG', desc: 'High-resolution PNG ready for submission and editable SVG with separate layers.' },
]

const steps = [
  { n: '1', title: 'Upload your Excel file',       desc: 'Drag and drop a .xlsx file. Columns detected automatically.', accent: '#2563eb' },
  { n: '2', title: 'Configure your figure',         desc: 'Select axes, chart type, error bars, log scale — all visual, all instant.', accent: '#7c3aed' },
  { n: '3', title: 'Export and submit',             desc: 'PNG 300 DPI or SVG with editable layers. Ready for any journal.', accent: '#059669' },
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
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 16l4-5 3 3 5-7" />
              </svg>
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">FigureReady</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">How it works</a>
            <a href="#features" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <Link href="/pricing" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="/roadmap" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Roadmap</Link>
          </div>
          <GatedAppLink className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
            Try it free →
          </GatedAppLink>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        {/* Subtle gradient blob in background */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-60 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold text-blue-600 tracking-wide">Free to use · No account needed</span>
          </div>

          <h1
            className="font-extrabold text-slate-900 leading-[1.05] tracking-[-0.03em] mb-6 mx-auto"
            style={{ fontSize: 'clamp(40px, 6.5vw, 72px)', maxWidth: '860px' }}
          >
            From Excel to{' '}
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              publication-ready
            </span>{' '}
            figure in seconds
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            No Origin. No Prism. Upload your .xlsx file and download a
            journal-quality PNG or SVG — ready for Nature, ACS, or Elsevier.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <GatedAppLink className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-2xl transition-colors shadow-lg shadow-blue-200">
              Upload your Excel →
            </GatedAppLink>
            <SampleDataButton className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-base font-semibold rounded-2xl transition-colors cursor-pointer" />
          </div>

          {/* Excel → Figure visual */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 max-w-4xl mx-auto">

            {/* Excel mock */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xl w-full max-w-[280px] text-left shrink-0">
              <div className="bg-[#1D6F42] px-4 py-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 1.5L18.5 9H13zM8.5 17l2-3-2-3h1.6l1.2 2 1.2-2H14l-2 3 2 3h-1.6l-1.2-2-1.2 2z"/>
                </svg>
                <span className="text-white text-xs font-semibold">data.xlsx</span>
              </div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2 text-left font-semibold text-slate-500 border-r border-slate-200">Conc. (mM)</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500 border-r border-slate-200">Sample A</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">Sample B</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map(([c, a, b], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="px-3 py-1.5 border-r border-slate-100 text-slate-500">{c}</td>
                      <td className="px-3 py-1.5 border-r border-slate-100 text-right font-mono text-slate-700">{a}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-slate-700">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200 rotate-90 lg:rotate-0 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">FigureReady</span>
            </div>

            {/* Figure output */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xl bg-white w-full max-w-sm shrink-0">
              <div className="px-4 py-3 flex items-center gap-2 bg-slate-50 border-b border-slate-200">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Publication-ready figure</span>
              </div>
              <Image
                src="/demo-figure.png"
                alt="Publication-ready scientific figure exported from FigureReady"
                width={700}
                height={527}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-5">
            Click &ldquo;Try a sample file&rdquo; to load this exact dataset in the app
          </p>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center divide-x divide-slate-200">
            <div className="px-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">30s</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">average time to first figure</p>
            </div>
            <div className="px-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">300 DPI</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">publication-quality export</p>
            </div>
            <div className="px-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">0</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">lines of code required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">How it works</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Three steps. That&apos;s it.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map(s => (
              <div key={s.n} className="relative bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-white text-base font-black mb-6 shadow-sm"
                  style={{ background: s.accent }}
                >
                  {s.n}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 bg-slate-50/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Features</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Everything you need,<br className="hidden sm:block" /> nothing you don&apos;t
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Built specifically for researchers. No bloat, no learning curve.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div
                key={f.label}
                className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md hover:border-blue-100 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-xl">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 mb-1">{f.label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-white" id="pricing">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Pricing</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-500 text-lg">Build and preview for free. Pay only when you download.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Monthly */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Monthly</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">12€</span>
                <span className="text-slate-400 text-sm mb-2">/month</span>
              </div>
              <p className="text-xs text-slate-400 mb-7">Billed monthly, cancel anytime</p>
              <ul className="space-y-3 flex-1 mb-8">
                {['Unlimited figures', 'Excel upload (.xlsx)', 'PNG & SVG export (300 DPI)', 'Error bars', 'Log scale & dual Y axis', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="https://buy.polar.sh/polar_cl_VGeVJ2XK6HM9vWagdGyajurF8CZKTptFpUqSX4Ljhc8"
                className="block text-center py-3 px-4 border-2 border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-xl text-sm font-bold text-slate-700 transition-colors"
              >
                Get started →
              </a>
            </div>

            {/* Yearly */}
            <div
              className="rounded-2xl p-8 flex flex-col relative shadow-xl"
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)' }}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap shadow-sm">
                Save 31%
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-3">Yearly</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-extrabold text-white tracking-tight">99€</span>
                <span className="text-blue-200 text-sm mb-2">/year</span>
              </div>
              <p className="text-xs text-blue-300 mb-7">~8.25€/month — best value</p>
              <ul className="space-y-3 flex-1 mb-8">
                {['Unlimited figures', 'Excel upload (.xlsx)', 'PNG & SVG export (300 DPI)', 'Error bars', 'Log scale & dual Y axis', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white">
                    <svg className="w-4 h-4 text-blue-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="https://buy.polar.sh/polar_cl_VGeVJ2XK6HM9vWagdGyajurF8CZKTptFpUqSX4Ljhc8"
                className="block text-center py-3 px-4 bg-white rounded-xl text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors"
              >
                Get started →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)' }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 60% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2
            className="font-extrabold text-slate-900 leading-tight tracking-[-0.02em] mb-6"
            style={{ fontSize: 'clamp(32px, 5vw, 52px)' }}
          >
            Your next figure is{' '}
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              30 seconds away.
            </span>
          </h2>
          <p className="text-xl text-slate-500 mb-10 leading-relaxed">
            No setup. No account. Just your data and a publication-ready figure.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <GatedAppLink className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-2xl transition-colors shadow-lg shadow-blue-200">
              Upload your Excel →
            </GatedAppLink>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-10 py-4 border-2 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-600 hover:text-slate-900 text-base font-semibold rounded-2xl transition-colors text-center"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 16l4-5 3 3 5-7" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-700">FigureReady</span>
            <span className="text-slate-300 text-xs ml-2">© 2026</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
            <Link href="/pricing" className="hover:text-slate-700 transition-colors">Pricing</Link>
            <Link href="/roadmap" className="hover:text-slate-700 transition-colors">Roadmap</Link>
            <Link href="/graphpad-alternative" className="hover:text-slate-700 transition-colors">GraphPad alternative</Link>
            <a href="mailto:contact@figureready.com" className="hover:text-slate-700 transition-colors">contact@figureready.com</a>
            <Link href="/admin" className="hover:text-slate-700 transition-colors">Admin</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
