import type { Metadata } from 'next'
import Link from 'next/link'
import GatedAppLink from '@/components/GatedAppLink'
import TestimonialsMarquee from '@/components/TestimonialsMarquee'
import { LogoFull, LogoSmall } from '@/components/Logo'
import { VideoPlayer } from '@/components/VideoPlayer'

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
  { src: '/avatars/f5.jpg', bg: '#93c5fd' },
]

function AvatarRow({ centered = false }: { centered?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-2 sm:gap-3 mb-3 ${centered ? 'justify-center' : 'justify-start'}`}>
      {AVATARS.map((av, i) => (
        <div
          key={i}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0"
          style={{ background: av.bg, boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={av.src}
            alt=""
            className="w-9 h-9 sm:w-12 sm:h-12 rounded-full object-cover object-top block"
          />
        </div>
      ))}
    </div>
  )
}

// ── Page data ────────────────────────────────────────────────────────────────

const steps = [
  { n: '1', title: 'Upload your Excel file',  desc: 'Drag and drop a .xlsx file. Columns detected automatically.', accent: '#2563eb' },
  { n: '2', title: 'Configure your figure',   desc: 'Select axes, chart type, error bars, log scale — all visual, all instant.', accent: '#ea580c' },
  { n: '3', title: 'Export and submit',        desc: 'PNG 300 DPI or SVG with editable layers. Ready for any journal.', accent: '#059669' },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <LogoFull size={30} textSize={16} />
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">How it works</a>
            <a href="#features" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <Link href="/pricing" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="/roadmap" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Roadmap</Link>
          </div>
          <GatedAppLink location="nav" href="/app?demo=1" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold rounded-full transition-colors">
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
                From <span style={{ color: '#2563eb' }}>Excel</span> to<br />
                publication-<span style={{ color: '#2563eb' }}>ready figures</span> in seconds.
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
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <GatedAppLink location="hero" href="/app?demo=1" className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-slate-700 text-white text-base font-bold rounded-full transition-colors shadow-md shrink-0">
                  Begin Using →
                </GatedAppLink>
                <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-16 h-11 shrink-0">
                    <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                      <rect width="120" height="80" fill="white"/>
                      <line x1="20" y1="8" x2="20" y2="62" stroke="#1a1a1a" strokeWidth="1.2"/>
                      <line x1="20" y1="62" x2="112" y2="62" stroke="#1a1a1a" strokeWidth="1.2"/>
                      <polyline points="20,58 38,46 56,32 74,20 92,14 110,10" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinejoin="round"/>
                      <circle cx="20" cy="58" r="2.5" fill="#2563eb"/>
                      <circle cx="38" cy="46" r="2.5" fill="#2563eb"/>
                      <circle cx="56" cy="32" r="2.5" fill="#2563eb"/>
                      <circle cx="74" cy="20" r="2.5" fill="#2563eb"/>
                      <circle cx="92" cy="14" r="2.5" fill="#2563eb"/>
                      <circle cx="110" cy="10" r="2.5" fill="#2563eb"/>
                      <polyline points="20,60 38,54 56,48 74,40 92,34 110,28" fill="none" stroke="#d01c8b" strokeWidth="1.8" strokeLinejoin="round"/>
                      <rect x="17.5" y="57.5" width="5" height="5" fill="#d01c8b"/>
                      <rect x="35.5" y="51.5" width="5" height="5" fill="#d01c8b"/>
                      <rect x="53.5" y="45.5" width="5" height="5" fill="#d01c8b"/>
                      <rect x="71.5" y="37.5" width="5" height="5" fill="#d01c8b"/>
                      <rect x="89.5" y="31.5" width="5" height="5" fill="#d01c8b"/>
                      <rect x="107.5" y="25.5" width="5" height="5" fill="#d01c8b"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-tight">Publication-ready</p>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">ACS · Nature · Cell</p>
                  </div>
                </div>
              </div>

              {/* Trust signal */}
              <p className="text-xs text-slate-400">
                Free to use · No account needed · 300 DPI export
              </p>
            </div>
          </div>
        </div>

        {/* Demo video */}
        <div className="border-t border-slate-100 py-16 sm:py-24" style={{ background: 'linear-gradient(160deg, #eef2ff 0%, #f5f8ff 40%, #f0f4ff 100%)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-center text-xs font-bold uppercase tracking-widest mb-10 text-blue-600">
              See it in action
            </p>
            {/* macOS-style browser window */}
            <div className="rounded-xl overflow-hidden ring-1 ring-slate-200 shadow-[0_24px_80px_rgba(99,102,241,0.18),0_8px_32px_rgba(0,0,0,0.10)]">
              {/* Window chrome — dark macOS style */}
              <div className="bg-[#2d2d2d] px-4 py-[10px] flex items-center gap-3 border-b border-white/[0.07]">
                <div className="flex items-center gap-[6px] shrink-0">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-[#3d3d3d] rounded-md px-3 py-[5px] text-[12px] text-slate-400 flex items-center gap-1.5 min-w-[220px] justify-center">
                    <svg className="w-[11px] h-[11px] shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    figureready.com/app
                  </div>
                </div>
                <div className="w-[52px] shrink-0" />
              </div>
              <VideoPlayer src="/demo.mp4" playbackRate={0.7} />
            </div>
            <p className="text-center text-xs text-slate-400 mt-6">
              From Excel file to publication-ready figure — no account, no setup
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid grid-cols-3 gap-2 sm:gap-8 text-center divide-x divide-slate-100">
            <div className="px-1 sm:px-4">
              <p className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">30s</p>
              <p className="text-[10px] sm:text-sm text-slate-500 mt-1.5">to your first figure</p>
            </div>
            <div className="px-1 sm:px-4">
              <p className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">300DPI</p>
              <p className="text-[10px] sm:text-sm text-slate-500 mt-1.5">publication export</p>
            </div>
            <div className="px-1 sm:px-4">
              <p className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">0</p>
              <p className="text-[10px] sm:text-sm text-slate-500 mt-1.5">lines of code</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials marquee ─────────────────────────────────────────── */}
      <TestimonialsMarquee />

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#2563eb' }}>How it works</p>
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


      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="py-28 bg-white" id="pricing">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#2563eb' }}>Pricing</p>
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
                    <svg className="w-4 h-4 shrink-0" style={{ color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <a href="https://buy.polar.sh/polar_cl_flJ14D6H057GZslZY6hQBdRbz7Mk6Kd4fnfaA2056F1"
                className="block text-center py-3 px-4 bg-white rounded-full text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors">
                Get started →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-32 bg-white border-t border-slate-100">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2
            className="font-black text-slate-900 leading-[1.1] tracking-[-0.04em] mb-6"
            style={{ fontSize: 'clamp(36px, 5vw, 62px)' }}
          >
            Create your first publication-ready figure today.
          </h2>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed">
            No account required. First export free.
          </p>
          <GatedAppLink location="final_cta" href="/app?demo=1" className="inline-flex items-center justify-center px-10 py-4 bg-slate-900 hover:bg-slate-700 text-white text-base font-bold rounded-full transition-colors shadow-md">
            Start Free →
          </GatedAppLink>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoSmall />
            <span className="text-slate-300 text-xs">© 2026</span>
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

