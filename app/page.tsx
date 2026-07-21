import type { Metadata } from 'next'
import Link from 'next/link'
import GatedAppLink from '@/components/GatedAppLink'
import SampleDataButton from '@/components/SampleDataButton'
import InteractiveDemo from '@/components/InteractiveDemo'

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

// ── Photo avatars ────────────────────────────────────────────────────────────

const AVATARS = [
  { src: '/avatars/f1.jpg', bg: '#6ee7b7' },
  { src: '/avatars/f2.jpg', bg: '#fde68a' },
  { src: '/avatars/f3.jpg', bg: '#7dd3fc' },
  { src: '/avatars/f4.jpg', bg: '#f9a8d4' },
  { src: '/avatars/f5.jpg', bg: '#c4b5fd' },
]

function AvatarRow({ centered = false }: { centered?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 12, justifyContent: centered ? 'center' : 'flex-start' }}>
      {AVATARS.map((av, i) => (
        <div
          key={i}
          style={{
            width: 72, height: 72,
            borderRadius: '50%',
            background: av.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={av.src}
            alt=""
            style={{
              width: 56, height: 56,
              borderRadius: '50%',
              objectFit: 'cover',
              objectPosition: 'center top',
              display: 'block',
            }}
          />
        </div>
      ))}
    </div>
  )
}

// ── Page data ────────────────────────────────────────────────────────────────

const features = [
  { icon: '📊', label: 'Excel upload',               desc: 'Drop your .xlsx file — columns detected automatically, zero configuration.' },
  { icon: '📈', label: 'Multiple curves & dual Y axis', desc: 'Plot several series on the same chart. Assign each to Y1 or Y2 independently.' },
  { icon: '±',  label: 'Error bars',                 desc: 'Attach standard deviation or standard error columns in one click.' },
  { icon: '🔢', label: 'Logarithmic scale',           desc: 'Switch X or Y axis to log scale instantly — handles any range of data.' },
  { icon: '🎨', label: 'Full style control',          desc: 'Font, line weight, marker shape, colors, grid — all visual, no code.' },
  { icon: '⬇️', label: 'PNG 300 DPI & SVG',          desc: 'High-resolution PNG ready for submission and editable SVG with separate layers.' },
]

const steps = [
  { n: '1', title: 'Upload your Excel file',  desc: 'Drag and drop a .xlsx file. Columns detected automatically.', accent: '#2563eb' },
  { n: '2', title: 'Configure your figure',   desc: 'Select axes, chart type, error bars, log scale — all visual, all instant.', accent: '#7c3aed' },
  { n: '3', title: 'Export and submit',        desc: 'PNG 300 DPI or SVG with editable layers. Ready for any journal.', accent: '#059669' },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#1D6F42' }}>
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
          <GatedAppLink className="px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold rounded-full transition-colors">
            Try it free →
          </GatedAppLink>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — giant title */}
            <div>
              <h1
                className="font-black text-slate-900 leading-[1.1] tracking-[-0.03em]"
                style={{ fontSize: 'clamp(44px, 6.5vw, 82px)' }}
              >
                From <span style={{ color: '#1D6F42' }}>Excel</span> to<br />
                publication-<span style={{ position: 'relative', display: 'inline-block', paddingBottom: '8px' }}>
                  ready figures
                  <svg aria-hidden viewBox="0 0 300 10" preserveAspectRatio="none"
                    style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '10px' }}>
                    <path d="M2,7 C25,3 55,9 85,5 C115,2 145,8 175,5 C205,3 235,8 260,5 C278,3 292,7 298,6"
                      stroke="#1D6F42" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span> in seconds.
              </h1>
            </div>

            {/* Right — description + avatars + CTA */}
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4">Scientific Figure Maker</p>
                <p className="text-xl text-slate-900 leading-relaxed mb-6">
                  No Origin. No Prism. Upload your .xlsx and download a journal-quality PNG or SVG in seconds.
                </p>
                {/* Avatars + social proof */}
                <AvatarRow />
                <p className="text-lg font-medium text-slate-900">
                  Trusted by PhD students, postdocs, and researchers worldwide.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <GatedAppLink className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-slate-700 text-white text-base font-bold rounded-full transition-colors shadow-md">
                  Upload your Excel →
                </GatedAppLink>
                <SampleDataButton className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-base font-semibold rounded-full transition-colors cursor-pointer" />
              </div>

              {/* Trust signal */}
              <p className="text-xs text-slate-400">
                Free to use · No account needed · 300 DPI export
              </p>
            </div>
          </div>
        </div>

        {/* Interactive demo */}
        <div className="border-t border-slate-100 bg-slate-50">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <p className="text-center text-xs font-bold uppercase tracking-widest mb-8" style={{ color: '#1D6F42' }}>
              Try it now — no account needed
            </p>
            <InteractiveDemo />
            <p className="text-center text-xs text-slate-400 mt-6">
              Click &ldquo;Try a sample file&rdquo; above to load your own dataset
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center divide-x divide-slate-100">
            <div className="px-4">
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">30s</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">to your first figure</p>
            </div>
            <div className="px-4">
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">300 DPI</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">publication-quality export</p>
            </div>
            <div className="px-4">
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">0</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">lines of code required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#1D6F42' }}>How it works</p>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Three steps. That&apos;s it.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map(s => (
              <div key={s.n} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-white text-sm font-black mb-6"
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

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 bg-slate-50/70">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#1D6F42' }}>Features</p>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
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
                className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-xl border border-slate-100">
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

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="py-28 bg-white" id="pricing">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#1D6F42' }}>Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-500 text-lg">Build and preview for free. Pay only when you download.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Monthly</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-black text-slate-900 tracking-tight">12€</span>
                <span className="text-slate-400 text-sm mb-2">/month</span>
              </div>
              <p className="text-xs text-slate-400 mb-7">Billed monthly, cancel anytime</p>
              <ul className="space-y-3 flex-1 mb-8">
                {['Unlimited figures', 'Excel upload (.xlsx)', 'PNG & SVG export (300 DPI)', 'Error bars', 'Log scale & dual Y axis', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <svg className="w-4 h-4 shrink-0" style={{ color: '#1D6F42' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="https://buy.polar.sh/polar_cl_VGeVJ2XK6HM9vWagdGyajurF8CZKTptFpUqSX4Ljhc8"
                className="block text-center py-3 px-4 border-2 border-slate-200 hover:border-slate-900 hover:text-slate-900 rounded-full text-sm font-bold text-slate-600 transition-colors">
                Get started →
              </a>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 flex flex-col relative shadow-xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap">
                Save 31%
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Yearly</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-black text-white tracking-tight">99€</span>
                <span className="text-slate-400 text-sm mb-2">/year</span>
              </div>
              <p className="text-xs text-slate-500 mb-7">~8.25€/month — best value</p>
              <ul className="space-y-3 flex-1 mb-8">
                {['Unlimited figures', 'Excel upload (.xlsx)', 'PNG & SVG export (300 DPI)', 'Error bars', 'Log scale & dual Y axis', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="https://buy.polar.sh/polar_cl_VGeVJ2XK6HM9vWagdGyajurF8CZKTptFpUqSX4Ljhc8"
                className="block text-center py-3 px-4 bg-white rounded-full text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors">
                Get started →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-100 py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <h2
              className="font-black text-slate-900 leading-[0.95] tracking-[-0.04em] mb-8"
              style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}
            >
              Your next figure<br />is
              {' '}<span style={{ color: '#1D6F42' }}>30 seconds</span><br />
              away.
            </h2>
            <div className="mb-4">
              <AvatarRow centered />
              <p className="text-xl text-slate-500 leading-relaxed">
                Trusted by PhD students, postdocs, and researchers worldwide.
              </p>
            </div>
            <p className="text-sm text-slate-400 mb-10">No setup. No account. Works in your browser.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GatedAppLink className="w-full sm:w-auto px-10 py-4 bg-slate-900 hover:bg-slate-700 text-white text-base font-bold rounded-full transition-colors shadow-md">
                Upload your Excel →
              </GatedAppLink>
              <Link href="/pricing"
                className="w-full sm:w-auto px-10 py-4 border-2 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-base font-semibold rounded-full transition-colors text-center">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#1D6F42' }}>
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
