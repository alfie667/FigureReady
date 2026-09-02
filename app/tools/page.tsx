import type { Metadata } from 'next'
import type React from 'react'
import Link from 'next/link'
import { Microscope, BookOpen, Zap, Gift } from 'lucide-react'
import { LogoFull } from '@/components/Logo'

export const metadata: Metadata = {
  title: 'Free Research Tools for Scientists | FigureReady',
  description:
    'Free online calculators for scientists: molecular weight, molarity, and dilution. No signup required.',
  alternates: { canonical: 'https://figureready.com/tools' },
  openGraph: {
    title: 'Free Research Tools for Scientists | FigureReady',
    description: 'Free online calculators for scientists: molecular weight, molarity, and dilution. No signup required.',
    url: 'https://figureready.com/tools',
    type: 'website',
    siteName: 'FigureReady',
  },
  twitter: {
    card: 'summary',
    title: 'Free Research Tools for Scientists | FigureReady',
    description: 'Free online calculators for scientists: molecular weight, molarity, and dilution. No signup required.',
  },
}


// ── Mini example previews (non-interactive) ───────────────────────────────────

function MWExample() {
  return (
    <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
      <span className="text-slate-600">H₂O</span>
      <span className="text-slate-400">→</span>
      <span className="font-bold text-blue-700">18.015</span>
      <span className="text-slate-500">g/mol</span>
    </div>
  )
}

function MolarityExample() {
  return (
    <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
      <span className="text-slate-600">100 mmol / 500 mL</span>
      <span className="text-slate-400">→</span>
      <span className="font-bold text-violet-700">0.200 M</span>
    </div>
  )
}

function DilutionExample() {
  return (
    <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
      <span className="text-slate-600">1 M</span>
      <span className="text-slate-400">→</span>
      <span className="font-bold text-emerald-700">100 mM</span>
    </div>
  )
}

// ── Tool cards data ───────────────────────────────────────────────────────────

interface ToolCard {
  href:        string
  iconSrc:     string
  iconSize:    string   // Tailwind w-* h-* class
  zoneBg:      string
  borderHover: string
  title:       string
  description: string
  Example:     () => React.JSX.Element
}

const TOOLS: ToolCard[] = [
  {
    href:        '/tools/molecular-weight-calculator',
    iconSrc:     '/icons/icon-molecular.png',
    iconSize:    'w-16 h-16',      // source 96 px → 64 px display
    zoneBg:      'bg-blue-50',
    borderHover: 'hover:border-blue-300',
    title:       'Molecular Weight Calculator',
    description: 'Calculate molar mass from a chemical formula.',
    Example:     MWExample,
  },
  {
    href:        '/tools/molarity-calculator',
    iconSrc:     '/icons/icon-flask.png',
    iconSize:    'w-14 h-14',      // source 28 px → 56 px display
    zoneBg:      'bg-amber-50',
    borderHover: 'hover:border-amber-300',
    title:       'Molarity Calculator',
    description: 'Calculate solution concentration from amount and volume.',
    Example:     MolarityExample,
  },
  {
    href:        '/tools/dilution-calculator',
    iconSrc:     '/icons/icon-funnel.png',
    iconSize:    'w-14 h-14',      // source 28 px → 56 px display
    zoneBg:      'bg-teal-50',
    borderHover: 'hover:border-teal-300',
    title:       'Dilution Calculator',
    description: 'Calculate stock or final concentration and volume.',
    Example:     DilutionExample,
  },
]

// ── Value strip data ──────────────────────────────────────────────────────────

const VALUES = [
  {
    Icon:  Microscope,
    title: 'Built for scientists',
    desc:  'Designed for real laboratory calculations, not general-purpose arithmetic.',
  },
  {
    Icon:  BookOpen,
    title: 'Accurate & transparent',
    desc:  'Based on standard scientific formulas and published reference data (IUPAC 2021).',
  },
  {
    Icon:  Zap,
    title: 'Instant',
    desc:  'Calculations run entirely in your browser — no server round-trip, no delay.',
  },
  {
    Icon:  Gift,
    title: 'Always free',
    desc:  'No signup, no paywall, no usage limits on these research tools.',
  },
] as const

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* Nav — same structure as home page */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" aria-label="FigureReady home">
            <LogoFull size={28} textSize={15} />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/templates" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Templates
            </Link>
            <Link href="/tools" className="text-sm font-semibold text-slate-900 transition-colors">
              Free Tools
            </Link>
            <Link href="/pricing" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            <Link href="/roadmap" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Roadmap
            </Link>
          </div>
          <Link
            href="/app"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Create a figure
          </Link>
        </div>
      </nav>

      <main>

        {/* ── Hero ── */}
        <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-16 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-blue-700 tracking-wide">
              100% Free · No account required
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-plus-jakarta), Inter, sans-serif' }}
          >
            Free Research Tools
          </h1>
          <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
            Useful calculators and reference tools for scientists.
          </p>
        </section>

        {/* ── Tool cards — Smallpdf-inspired ── */}
        <section className="max-w-5xl mx-auto px-6 lg:px-10 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOOLS.map(({ href, iconSrc, iconSize, zoneBg, borderHover, title, description, Example }) => (
              <Link
                key={href}
                href={href}
                className={`group flex flex-col rounded-2xl overflow-hidden bg-white
                           border border-slate-100 ${borderHover}
                           shadow-sm hover:shadow-2xl hover:-translate-y-1
                           transition-all duration-200
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
              >
                {/* ── Zone A: Colored icon area ── */}
                <div className={`${zoneBg} h-44 flex items-center justify-center flex-shrink-0`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={iconSrc}
                    alt=""
                    aria-hidden
                    draggable={false}
                    className={`${iconSize} object-contain select-none`}
                    style={{ imageRendering: 'auto' }}
                  />
                </div>

                {/* ── Zone B: White content area ── */}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-[15px] font-bold text-slate-900 mb-1.5 leading-snug">
                    {title}
                  </h2>
                  <p className="text-[13px] text-slate-700 leading-relaxed mb-4">
                    {description}
                  </p>
                  {/* Mini example — pushed to bottom */}
                  <div className="mt-auto bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 text-xs">
                    <Example />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Value strip ── */}
        <section className="border-t border-slate-100 bg-slate-50/70">
          <div className="max-w-5xl mx-auto px-6 lg:px-10 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {VALUES.map(({ Icon, title, desc }) => (
                <div key={title} className="flex flex-col">
                  <Icon className="w-5 h-5 text-slate-400 mb-3" strokeWidth={1.75} />
                  <p className="text-sm font-semibold text-slate-800 mb-1">{title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FigureReady CTA ── */}
        <section className="max-w-5xl mx-auto px-6 lg:px-10 py-16">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Working with experimental data?
              </p>
              <p className="text-lg font-bold text-slate-900 mb-1">
                Create publication-ready scientific figures.
              </p>
              <p className="text-sm text-slate-600">
                From Excel or CSV to Nature-quality figures in seconds — no coding required.
              </p>
            </div>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700
                         text-white text-sm font-semibold rounded-xl transition-colors shadow-sm whitespace-nowrap flex-shrink-0"
            >
              Create a scientific figure
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

      </main>

      {/* Footer — matches home page */}
      <footer className="border-t border-slate-100 py-10">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <LogoFull size={22} textSize={13} />
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <Link href="/templates" className="hover:text-slate-700 transition-colors">Templates</Link>
            <Link href="/tools"     className="hover:text-slate-700 transition-colors text-slate-600 font-medium">Free Tools</Link>
            <Link href="/pricing"   className="hover:text-slate-700 transition-colors">Pricing</Link>
            <Link href="/roadmap"   className="hover:text-slate-700 transition-colors">Roadmap</Link>
            <a href="mailto:hello@figureready.com" className="hover:text-slate-700 transition-colors">Contact</a>
          </div>
          <p className="text-xs text-slate-300">© 2025 FigureReady</p>
        </div>
      </footer>

    </div>
  )
}
