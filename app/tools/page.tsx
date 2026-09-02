import type { Metadata } from 'next'
import Link from 'next/link'
import { LogoFull } from '@/components/Logo'

export const metadata: Metadata = {
  title: 'Free Research Tools for Scientists | FigureReady',
  description:
    'Free, no-signup tools built for researchers. Molecular weight calculator and more.',
  alternates: { canonical: 'https://figureready.com/tools' },
  openGraph: {
    title: 'Free Research Tools for Scientists | FigureReady',
    description: 'Free, no-signup tools built for researchers.',
    url: 'https://figureready.com/tools',
    type: 'website',
    siteName: 'FigureReady',
  },
}

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <LogoFull size={26} textSize={14} />
          </Link>
          <Link
            href="/app"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            Create a figure
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 md:py-14">

        <div className="mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-blue-700">Free · No signup</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Free Research Tools
          </h1>
          <p className="text-lg text-slate-700 max-w-2xl leading-relaxed">
            Useful calculators and reference tools for scientists.
            Free, no account required.
          </p>
        </div>

        {/* Tool grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Link
            href="/tools/molecular-weight-calculator"
            className="group rounded-2xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/40
                       p-6 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                {/* Atom / molecule icon */}
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z" strokeDasharray="4 3" />
                  <path strokeLinecap="round" d="M2 12h20M12 2v20" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1">
                  Molecular Weight Calculator
                </h2>
                <p className="text-sm text-slate-600 leading-snug">
                  Calculate the molar mass of any chemical formula. Supports
                  parentheses and hydrates (e.g. CuSO₄·5H₂O).
                </p>
                <p className="mt-3 text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                  Use tool
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/tools/molarity-calculator"
            className="group rounded-2xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/40
                       p-6 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                {/* Beaker icon */}
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6M9 3v7.5L4.5 18A2 2 0 006.4 21h11.2a2 2 0 001.9-3L15 10.5V3" />
                  <path strokeLinecap="round" d="M6.5 16h11" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1">
                  Molarity Calculator
                </h2>
                <p className="text-sm text-slate-600 leading-snug">
                  Calculate solution concentration from moles or mass, molar mass, and volume. Supports mol, mmol, g, mg, L, mL.
                </p>
                <p className="mt-3 text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                  Use tool
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </p>
              </div>
            </div>
          </Link>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-20 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <LogoFull size={20} textSize={12} />
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/tools" className="hover:text-slate-700 transition-colors text-slate-600 font-medium">Free Tools</Link>
            <Link href="/pricing" className="hover:text-slate-700 transition-colors">Pricing</Link>
            <Link href="/app" className="hover:text-slate-700 transition-colors">Create a figure</Link>
          </div>
          <p className="text-xs text-slate-300">© 2025 FigureReady</p>
        </div>
      </footer>

    </div>
  )
}
