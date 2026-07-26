import type { Metadata } from 'next'
import Link from 'next/link'
import GatedAppLink from '@/components/GatedAppLink'
import SampleDataButton from '@/components/SampleDataButton'
import InteractiveDemo from '@/components/InteractiveDemo'
import TestimonialsMarquee from '@/components/TestimonialsMarquee'
import { LogoFull, LogoSmall } from '@/components/Logo'

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

const features = [
  {
    accent: '#2563eb',
    label: 'Your .xlsx as-is',
    desc: 'No conversion, no export. Drop your file exactly as it is — columns detected in seconds.',
    visual: (
      <svg viewBox="0 0 200 80" width="100%" height="80">
        <rect x="8" y="6" width="78" height="68" fill="#f0fdf4" rx="4" stroke="#bbf7d0" strokeWidth="1"/>
        <rect x="8" y="6" width="78" height="16" fill="#dcfce7" rx="4"/>
        <text x="22" y="18" fontSize="7" fill="#166534" fontWeight="700">Time</text>
        <text x="62" y="18" fontSize="7" fill="#166534" fontWeight="700">OD</text>
        <text x="22" y="31" fontSize="6" fill="#374151">0</text><text x="62" y="31" fontSize="6" fill="#374151">0.10</text>
        <text x="22" y="42" fontSize="6" fill="#374151">1</text><text x="62" y="42" fontSize="6" fill="#374151">0.32</text>
        <text x="22" y="53" fontSize="6" fill="#374151">2</text><text x="62" y="53" fontSize="6" fill="#374151">0.81</text>
        <text x="22" y="64" fontSize="6" fill="#374151">4</text><text x="62" y="64" fontSize="6" fill="#374151">2.10</text>
        <text x="91" y="44" fontSize="16" fill="#2563eb" fontWeight="bold">→</text>
        <rect x="110" y="6" width="82" height="68" fill="#eff6ff" rx="4" stroke="#bfdbfe" strokeWidth="1"/>
        <line x1="118" y1="66" x2="186" y2="66" stroke="#94a3b8" strokeWidth="0.8"/>
        <line x1="118" y1="10" x2="118" y2="66" stroke="#94a3b8" strokeWidth="0.8"/>
        <polyline points="122,62 138,50 155,34 172,20 182,14" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    accent: '#ea580c',
    label: 'Compare samples on one chart',
    desc: 'Multiple series, dual Y axes, one figure. No copy-pasting between worksheets.',
    visual: (
      <svg viewBox="0 0 200 80" width="100%" height="80">
        <rect x="8" y="6" width="184" height="68" fill="#fff7ed" rx="4" stroke="#fed7aa" strokeWidth="1"/>
        <line x1="20" y1="66" x2="185" y2="66" stroke="#94a3b8" strokeWidth="0.8"/>
        <line x1="20" y1="10" x2="20" y2="66" stroke="#94a3b8" strokeWidth="0.8"/>
        <polyline points="24,58 55,42 88,30 120,20 152,14 180,10" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="24,62 55,55 88,48 120,40 152,35 180,28" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="162" cy="22" r="4" fill="#2563eb"/>
        <text x="168" y="25" fontSize="6" fill="#2563eb" fontWeight="600">Control</text>
        <circle cx="162" cy="34" r="4" fill="#ea580c"/>
        <text x="168" y="37" fontSize="6" fill="#ea580c" fontWeight="600">Treated</text>
      </svg>
    ),
  },
  {
    accent: '#059669',
    label: '±SD and ±SEM in one click',
    desc: 'Select your error column — bars appear instantly, formatted to journal standards.',
    visual: (
      <svg viewBox="0 0 200 80" width="100%" height="80">
        <rect x="8" y="6" width="184" height="68" fill="#f0fdf4" rx="4" stroke="#bbf7d0" strokeWidth="1"/>
        <line x1="20" y1="66" x2="185" y2="66" stroke="#94a3b8" strokeWidth="0.8"/>
        <line x1="20" y1="10" x2="20" y2="66" stroke="#94a3b8" strokeWidth="0.8"/>
        {[{x:55,h:35,e:9},{x:100,h:50,e:6},{x:145,h:28,e:11}].map(({x,h,e},i)=>(
          <g key={i}>
            <rect x={x-18} y={66-h} width="36" height={h} fill="#059669" opacity="0.75" rx="2"/>
            <line x1={x} y1={66-h-e} x2={x} y2={66-h+e} stroke="#064e3b" strokeWidth="1.5"/>
            <line x1={x-6} y1={66-h-e} x2={x+6} y2={66-h-e} stroke="#064e3b" strokeWidth="1.5"/>
            <line x1={x-6} y1={66-h+e} x2={x+6} y2={66-h+e} stroke="#064e3b" strokeWidth="1.5"/>
          </g>
        ))}
      </svg>
    ),
  },
  {
    accent: '#7c3aed',
    label: 'Dose-response curves done right',
    desc: 'One click to log scale. Your sigmoid looks exactly like it should in a Nature paper.',
    visual: (
      <svg viewBox="0 0 200 80" width="100%" height="80">
        <rect x="8" y="6" width="184" height="68" fill="#faf5ff" rx="4" stroke="#e9d5ff" strokeWidth="1"/>
        <line x1="20" y1="65" x2="185" y2="65" stroke="#94a3b8" strokeWidth="0.8"/>
        <line x1="20" y1="10" x2="20" y2="65" stroke="#94a3b8" strokeWidth="0.8"/>
        <path d="M24,63 C40,62 58,59 78,50 C98,40 108,24 128,15 C148,7 162,8 182,8" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"/>
        <text x="32" y="73" fontSize="5.5" fill="#6b7280" textAnchor="middle">0.01</text>
        <text x="78" y="73" fontSize="5.5" fill="#6b7280" textAnchor="middle">0.1</text>
        <text x="128" y="73" fontSize="5.5" fill="#6b7280" textAnchor="middle">1</text>
        <text x="178" y="73" fontSize="5.5" fill="#6b7280" textAnchor="middle">10</text>
        <line x1="103" y1="35" x2="103" y2="65" stroke="#7c3aed" strokeWidth="1" strokeDasharray="3,2" opacity="0.6"/>
        <text x="106" y="48" fontSize="6" fill="#7c3aed" fontWeight="600">EC₅₀</text>
      </svg>
    ),
  },
  {
    accent: '#db2777',
    label: 'Nature, ACS, Cell presets',
    desc: 'Pick a journal style or tweak font, line weight and colors — all visual, zero Illustrator.',
    visual: (
      <svg viewBox="0 0 200 80" width="100%" height="80">
        <rect x="8" y="6" width="184" height="68" fill="#fdf2f8" rx="4" stroke="#fbcfe8" strokeWidth="1"/>
        {[{x:18,label:'Nature',color:'#db2777',active:true},{x:80,label:'ACS',color:'#7c3aed',active:false},{x:138,label:'Cell',color:'#059669',active:false}].map(({x,label,color,active})=>(
          <g key={label}>
            <rect x={x} y="22" width="54" height="36" rx="8" fill={active?color:'white'} stroke={active?color:'#e2e8f0'} strokeWidth={active?0:1}/>
            <text x={x+27} y="44" fontSize="9.5" fill={active?'white':'#64748b'} fontWeight={active?'700':'500'} textAnchor="middle">{label}</text>
          </g>
        ))}
      </svg>
    ),
  },
  {
    accent: '#0891b2',
    label: 'Ready for submission',
    desc: '300 DPI PNG for upload portals. Editable SVG when reviewers ask for changes.',
    visual: (
      <svg viewBox="0 0 200 80" width="100%" height="80">
        <rect x="8" y="6" width="184" height="68" fill="#ecfeff" rx="4" stroke="#a5f3fc" strokeWidth="1"/>
        <rect x="18" y="14" width="70" height="52" rx="3" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
        <polyline points="24,58 36,48 50,37 62,29 74,22 82,17" fill="none" stroke="#0891b2" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="22" y1="60" x2="86" y2="60" stroke="#94a3b8" strokeWidth="0.6"/>
        <line x1="22" y1="14" x2="22" y2="60" stroke="#94a3b8" strokeWidth="0.6"/>
        <text x="97" y="44" fontSize="16" fill="#0891b2" fontWeight="bold">→</text>
        <rect x="112" y="22" width="72" height="36" rx="8" fill="#0891b2"/>
        <text x="148" y="36" fontSize="7.5" fill="white" fontWeight="700" textAnchor="middle">↓ Download</text>
        <text x="148" y="49" fontSize="6.5" fill="#cffafe" textAnchor="middle">300 DPI · SVG</text>
      </svg>
    ),
  },
]

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
          <GatedAppLink location="nav" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold rounded-full transition-colors">
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
              <div className="flex flex-col sm:flex-row gap-3">
                <GatedAppLink location="hero" className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-slate-700 text-white text-base font-bold rounded-full transition-colors shadow-md">
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
            <p className="text-center text-xs font-bold uppercase tracking-widest mb-8" style={{ color: '#2563eb' }}>
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

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 bg-slate-50/70">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#2563eb' }}>Features</p>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Stop losing hours on figure formatting.<br className="hidden sm:block" /> Start publishing faster.
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Spend your time on science, not on making charts look acceptable.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div
                key={f.label}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                style={{ borderTop: `4px solid ${f.accent}` }}
              >
                {/* Illustration */}
                <div className="px-4 pt-5 pb-2 bg-slate-50/60">
                  {f.visual}
                </div>
                {/* Text */}
                <div className="px-8 py-6">
                  <p className="font-bold text-slate-900 mb-2" style={{ fontSize: 20 }}>{f.label}</p>
                  <p className="text-slate-500 leading-relaxed" style={{ fontSize: 15 }}>{f.desc}</p>
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
      <section className="bg-slate-50 border-t border-slate-100 py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <h2
              className="font-black text-slate-900 leading-[1.1] tracking-[-0.04em] mb-8"
              style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}
            >
              Your next figure<br />is
              {' '}<span style={{ color: '#2563eb' }}>30 seconds</span><br />
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
              <GatedAppLink location="final_cta" className="w-full sm:w-auto px-10 py-4 bg-slate-900 hover:bg-slate-700 text-white text-base font-bold rounded-full transition-colors shadow-md">
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
