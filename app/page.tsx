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
      <svg viewBox="0 0 240 88" width="100%" height="88" style={{display:'block'}}>
        {/* Table */}
        <rect x="5" y="5" width="87" height="75" fill="white" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="5" y1="19" x2="92" y2="19" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="48" y1="5" x2="48" y2="80" stroke="#1a1a1a" strokeWidth="0.5"/>
        <line x1="5" y1="33" x2="92" y2="33" stroke="#1a1a1a" strokeWidth="0.3"/>
        <line x1="5" y1="47" x2="92" y2="47" stroke="#1a1a1a" strokeWidth="0.3"/>
        <line x1="5" y1="61" x2="92" y2="61" stroke="#1a1a1a" strokeWidth="0.3"/>
        <text x="26" y="15" fontSize="7" fontWeight="700" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">Time</text>
        <text x="70" y="15" fontSize="7" fontWeight="700" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">OD</text>
        <text x="26" y="29" fontSize="6.5" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">0</text>
        <text x="70" y="29" fontSize="6.5" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">0.10</text>
        <text x="26" y="43" fontSize="6.5" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">1</text>
        <text x="70" y="43" fontSize="6.5" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">0.32</text>
        <text x="26" y="57" fontSize="6.5" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">2</text>
        <text x="70" y="57" fontSize="6.5" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">0.81</text>
        <text x="26" y="71" fontSize="6.5" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">4</text>
        <text x="70" y="71" fontSize="6.5" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">2.10</text>
        {/* Arrow */}
        <text x="101" y="47" fontSize="15" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">→</text>
        {/* Y axis */}
        <line x1="115" y1="8" x2="115" y2="78" stroke="#1a1a1a" strokeWidth="0.8"/>
        {/* X axis */}
        <line x1="115" y1="78" x2="233" y2="78" stroke="#1a1a1a" strokeWidth="0.8"/>
        {/* X ticks */}
        <line x1="115" y1="78" x2="115" y2="81" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="174" y1="78" x2="174" y2="81" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="233" y1="78" x2="233" y2="81" stroke="#1a1a1a" strokeWidth="0.8"/>
        <text x="115" y="87" fontSize="6" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">0</text>
        <text x="174" y="87" fontSize="6" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">2</text>
        <text x="233" y="87" fontSize="6" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">4</text>
        {/* Y ticks — scale: (78-8)/2.2 = 31.8/unit */}
        <line x1="112" y1="78" x2="115" y2="78" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="112" y1="46" x2="115" y2="46" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="112" y1="14" x2="115" y2="14" stroke="#1a1a1a" strokeWidth="0.8"/>
        <text x="110" y="80" fontSize="6" fill="#1a1a1a" textAnchor="end" fontFamily="Arial">0</text>
        <text x="110" y="48" fontSize="6" fill="#1a1a1a" textAnchor="end" fontFamily="Arial">1</text>
        <text x="110" y="16" fontSize="6" fill="#1a1a1a" textAnchor="end" fontFamily="Arial">2</text>
        {/* Data: (0,0.10)→(1,0.32)→(2,0.81)→(4,2.10) — X scale 29.5/unit */}
        <polyline points="115,75 145,68 174,52 233,11" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="115" cy="75" r="2" fill="#1a1a1a"/>
        <circle cx="145" cy="68" r="2" fill="#1a1a1a"/>
        <circle cx="174" cy="52" r="2" fill="#1a1a1a"/>
        <circle cx="233" cy="11" r="2" fill="#1a1a1a"/>
      </svg>
    ),
  },
  {
    accent: '#ea580c',
    label: 'Compare samples on one chart',
    desc: 'Multiple series, dual Y axes, one figure. No copy-pasting between worksheets.',
    visual: (
      <svg viewBox="0 0 200 88" width="100%" height="88" style={{display:'block'}}>
        {/* Axes */}
        <line x1="28" y1="8" x2="28" y2="78" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="28" y1="78" x2="185" y2="78" stroke="#1a1a1a" strokeWidth="0.8"/>
        {/* X ticks */}
        {[28,73,118,163].map((x,i)=>(
          <g key={i}>
            <line x1={x} y1="78" x2={x} y2="81" stroke="#1a1a1a" strokeWidth="0.8"/>
            <text x={x} y="87" fontSize="6" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">{i*2}</text>
          </g>
        ))}
        {/* Y ticks */}
        {[{y:78,v:'0'},{y:53,v:'0.5'},{y:28,v:'1.0'}].map(({y,v})=>(
          <g key={v}>
            <line x1="25" y1={y} x2="28" y2={y} stroke="#1a1a1a" strokeWidth="0.8"/>
            <text x="23" y={y+2} fontSize="6" fill="#1a1a1a" textAnchor="end" fontFamily="Arial">{v}</text>
          </g>
        ))}
        {/* Curve 1 — black, open circles */}
        <polyline points="28,72 73,55 118,36 163,22" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        {[{x:28,y:72},{x:73,y:55},{x:118,y:36},{x:163,y:22}].map((p,i)=>(
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="white" stroke="#1a1a1a" strokeWidth="1.2"/>
        ))}
        {/* Curve 2 — red, open squares */}
        <polyline points="28,76 73,66 118,56 163,46" fill="none" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        {[{x:28,y:76},{x:73,y:66},{x:118,y:56},{x:163,y:46}].map((p,i)=>(
          <rect key={i} x={p.x-2.5} y={p.y-2.5} width="5" height="5" fill="white" stroke="#c0392b" strokeWidth="1.2"/>
        ))}
        {/* Legend */}
        <line x1="100" y1="16" x2="116" y2="16" stroke="#1a1a1a" strokeWidth="1.5"/>
        <circle cx="108" cy="16" r="2.5" fill="white" stroke="#1a1a1a" strokeWidth="1.2"/>
        <text x="119" y="19" fontSize="6.5" fill="#1a1a1a" fontFamily="Arial">Control</text>
        <line x1="100" y1="28" x2="116" y2="28" stroke="#c0392b" strokeWidth="1.5"/>
        <rect x="105.5" y="25.5" width="5" height="5" fill="white" stroke="#c0392b" strokeWidth="1.2"/>
        <text x="119" y="31" fontSize="6.5" fill="#1a1a1a" fontFamily="Arial">Treated</text>
      </svg>
    ),
  },
  {
    accent: '#059669',
    label: '±SD and ±SEM in one click',
    desc: 'Select your error column — bars appear instantly, formatted to journal standards.',
    visual: (
      <svg viewBox="0 0 200 88" width="100%" height="88" style={{display:'block'}}>
        {/* Axes */}
        <line x1="30" y1="8" x2="30" y2="78" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="30" y1="78" x2="178" y2="78" stroke="#1a1a1a" strokeWidth="0.8"/>
        {/* Y ticks — scale: 70/65 ≈ 1.077 per data unit */}
        {[{y:78,v:'0'},{y:51,v:'25'},{y:24,v:'50'}].map(({y,v})=>(
          <g key={v}>
            <line x1="27" y1={y} x2="30" y2={y} stroke="#1a1a1a" strokeWidth="0.8"/>
            <text x="25" y={y+2} fontSize="6" fill="#1a1a1a" textAnchor="end" fontFamily="Arial">{v}</text>
          </g>
        ))}
        {/* Bars + error bars */}
        {[{x:62,h:37,e:9,lbl:'A'},{x:104,h:52,e:7,lbl:'B'},{x:146,h:27,e:11,lbl:'C'}].map(({x,h,e,lbl})=>(
          <g key={lbl}>
            <rect x={x-14} y={78-h} width="28" height={h} fill="#d1d5db" stroke="#1a1a1a" strokeWidth="0.8"/>
            <line x1={x} y1={78-h-e} x2={x} y2={78-h+e} stroke="#1a1a1a" strokeWidth="1.2"/>
            <line x1={x-5} y1={78-h-e} x2={x+5} y2={78-h-e} stroke="#1a1a1a" strokeWidth="1.2"/>
            <line x1={x-5} y1={78-h+e} x2={x+5} y2={78-h+e} stroke="#1a1a1a" strokeWidth="1.2"/>
            <text x={x} y="87" fontSize="7" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">{lbl}</text>
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
      <svg viewBox="0 0 200 88" width="100%" height="88" style={{display:'block'}}>
        {/* Axes */}
        <line x1="28" y1="8" x2="28" y2="78" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="28" y1="78" x2="188" y2="78" stroke="#1a1a1a" strokeWidth="0.8"/>
        {/* X ticks (log scale: 0.01, 0.1, 1, 10, 100 → x=28,68,108,148,188) */}
        {[{x:28,lbl:'0.01'},{x:68,lbl:'0.1'},{x:108,lbl:'1'},{x:148,lbl:'10'},{x:188,lbl:'100'}].map(({x,lbl})=>(
          <g key={lbl}>
            <line x1={x} y1="78" x2={x} y2="81" stroke="#1a1a1a" strokeWidth="0.8"/>
            <text x={x} y="87" fontSize="5.5" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">{lbl}</text>
          </g>
        ))}
        {/* Y ticks */}
        {[{y:78,v:'0%'},{y:43,v:'50%'},{y:8,v:'100%'}].map(({y,v})=>(
          <g key={v}>
            <line x1="25" y1={y} x2="28" y2={y} stroke="#1a1a1a" strokeWidth="0.8"/>
            <text x="23" y={y+2} fontSize="5.5" fill="#1a1a1a" textAnchor="end" fontFamily="Arial">{v}</text>
          </g>
        ))}
        {/* Sigmoid — Hill=1.5, EC50=1 (x=108) */}
        <path d="M28,78 C42,78 55,77 68,76 C82,75 88,68 98,60 C106,52 108,43 116,32 C124,21 130,15 148,10 C162,8 175,8 188,8" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
        {/* EC50 dashed lines */}
        <line x1="108" y1="43" x2="108" y2="78" stroke="#1a1a1a" strokeWidth="0.8" strokeDasharray="3,2"/>
        <line x1="28" y1="43" x2="108" y2="43" stroke="#1a1a1a" strokeWidth="0.8" strokeDasharray="3,2"/>
        <text x="111" y="58" fontSize="6" fill="#1a1a1a" fontFamily="Arial">EC₅₀</text>
      </svg>
    ),
  },
  {
    accent: '#db2777',
    label: 'Nature, ACS, Cell presets',
    desc: 'Pick a journal style or tweak font, line weight and colors — all visual, zero Illustrator.',
    visual: (
      <svg viewBox="0 0 200 88" width="100%" height="88" style={{display:'block'}}>
        {/* Style selector tabs */}
        <rect x="10" y="5" width="48" height="17" rx="2" fill="white" stroke="#1a1a1a" strokeWidth="1"/>
        <text x="34" y="17" fontSize="7.5" fontWeight="700" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">Nature</text>
        <rect x="64" y="5" width="36" height="17" rx="2" fill="white" stroke="#94a3b8" strokeWidth="0.6"/>
        <text x="82" y="17" fontSize="7.5" fill="#94a3b8" textAnchor="middle" fontFamily="Arial">ACS</text>
        <rect x="106" y="5" width="32" height="17" rx="2" fill="white" stroke="#94a3b8" strokeWidth="0.6"/>
        <text x="122" y="17" fontSize="7.5" fill="#94a3b8" textAnchor="middle" fontFamily="Arial">Cell</text>
        {/* Divider */}
        <line x1="10" y1="27" x2="190" y2="27" stroke="#e2e8f0" strokeWidth="0.8"/>
        {/* Nature-style chart: thin axes, open circle markers */}
        <line x1="22" y1="34" x2="22" y2="80" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="22" y1="80" x2="185" y2="80" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="22" y1="80" x2="22" y2="83" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="76" y1="80" x2="76" y2="83" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="130" y1="80" x2="130" y2="83" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="185" y1="80" x2="185" y2="83" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="19" y1="80" x2="22" y2="80" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="19" y1="57" x2="22" y2="57" stroke="#1a1a1a" strokeWidth="0.8"/>
        <line x1="19" y1="34" x2="22" y2="34" stroke="#1a1a1a" strokeWidth="0.8"/>
        <polyline points="22,76 76,62 130,46 185,34" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        {[{x:22,y:76},{x:76,y:62},{x:130,y:46},{x:185,y:34}].map((p,i)=>(
          <circle key={i} cx={p.x} cy={p.y} r="2" fill="white" stroke="#1a1a1a" strokeWidth="1"/>
        ))}
      </svg>
    ),
  },
  {
    accent: '#0891b2',
    label: 'Ready for submission',
    desc: '300 DPI PNG for upload portals. Editable SVG when reviewers ask for changes.',
    visual: (
      <svg viewBox="0 0 200 88" width="100%" height="88" style={{display:'block'}}>
        {/* Mini figure frame */}
        <rect x="8" y="8" width="106" height="68" rx="2" fill="white" stroke="#1a1a1a" strokeWidth="0.8"/>
        {/* Chart inside */}
        <line x1="18" y1="16" x2="18" y2="68" stroke="#1a1a1a" strokeWidth="0.6"/>
        <line x1="18" y1="68" x2="106" y2="68" stroke="#1a1a1a" strokeWidth="0.6"/>
        <polyline points="18,64 34,54 52,42 70,32 88,22 106,16" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round"/>
        {[{x:18,y:64},{x:34,y:54},{x:52,y:42},{x:70,y:32},{x:88,y:22}].map((p,i)=>(
          <circle key={i} cx={p.x} cy={p.y} r="1.8" fill="#1a1a1a"/>
        ))}
        {/* Arrow */}
        <text x="121" y="46" fontSize="15" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">→</text>
        {/* Export info box */}
        <rect x="134" y="22" width="58" height="40" rx="2" fill="white" stroke="#1a1a1a" strokeWidth="0.8"/>
        <text x="163" y="38" fontSize="8.5" fontWeight="700" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">300 DPI</text>
        <text x="163" y="52" fontSize="7" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">PNG · SVG</text>
        {/* Download label */}
        <text x="163" y="74" fontSize="7.5" fill="#1a1a1a" textAnchor="middle" fontFamily="Arial">↓ Download</text>
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
