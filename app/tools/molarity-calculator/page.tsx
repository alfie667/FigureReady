import type { Metadata } from 'next'
import Link from 'next/link'
import { LogoFull } from '@/components/Logo'
import MolarityCalculator from './MolarityCalculator'

export const metadata: Metadata = {
  title: 'Molarity Calculator — Free Online Tool | FigureReady',
  description:
    'Calculate molarity from moles, mass, molar mass and solution volume. Free molarity calculator for laboratory and research use.',
  alternates: { canonical: 'https://figureready.com/tools/molarity-calculator' },
  openGraph: {
    title: 'Molarity Calculator — Free Online Tool | FigureReady',
    description: 'Calculate molarity from moles, mass, molar mass and solution volume. Free tool for laboratory use.',
    url: 'https://figureready.com/tools/molarity-calculator',
    type: 'website',
    siteName: 'FigureReady',
  },
  twitter: {
    card: 'summary',
    title: 'Molarity Calculator — Free Online Tool | FigureReady',
    description: 'Calculate molarity from moles, mass, molar mass and solution volume.',
  },
}

export default function MolarityCalculatorPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <LogoFull size={26} textSize={14} />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/tools" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">
              ← All tools
            </Link>
            <Link
              href="/app"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Create a figure
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 md:py-14">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-slate-400">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/tools" className="hover:text-slate-600 transition-colors">Tools</Link></li>
            <li aria-hidden>/</li>
            <li className="text-slate-600">Molarity Calculator</li>
          </ol>
        </nav>

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-blue-700">Free · No signup</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Molarity Calculator
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed max-w-2xl">
            Calculate solution molarity from moles or mass, molar mass, and volume.
          </p>
        </div>

        {/* Calculator */}
        <section
          aria-label="Calculator"
          className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8 mb-12"
        >
          <MolarityCalculator />
        </section>

        {/* Concise educational content */}
        <dl className="space-y-4 text-sm mb-12">
          <div>
            <dt className="font-semibold text-slate-900 mb-0.5">What is molarity?</dt>
            <dd className="text-slate-700">
              Molar concentration (symbol M) is the number of moles of solute dissolved per litre of solution. Unit: mol/L (M).
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 mb-0.5">Formulas</dt>
            <dd className="text-slate-700">
              From moles: <span className="font-mono">M = n / V</span> &nbsp;·&nbsp;
              From mass: <span className="font-mono">M = mass / (molar mass × V)</span>
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 mb-0.5">Worked example — 0.1 M NaCl</dt>
            <dd className="text-slate-700">
              5.844 g NaCl (M<sub>w</sub> = 58.44 g/mol) dissolved in 1 L of water gives 0.1 mol/L = 0.1 M.
              The same concentration in 500 mL requires 2.922 g.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 mb-0.5">Molarity vs molality</dt>
            <dd className="text-slate-700">
              Molarity (mol/L) depends on solution volume, which changes with temperature. Molality (mol/kg solvent) does not — prefer it when temperature varies.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 mb-0.5">Need the molar mass?</dt>
            <dd className="text-slate-700">
              Use the{' '}
              <Link href="/tools/molecular-weight-calculator" className="text-blue-600 hover:text-blue-700 underline">
                Molecular Weight Calculator
              </Link>{' '}
              to compute M<sub>w</sub> from a chemical formula.
            </dd>
          </div>
        </dl>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-4 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <LogoFull size={20} textSize={12} />
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/tools" className="hover:text-slate-700 transition-colors">Free Tools</Link>
            <Link href="/pricing" className="hover:text-slate-700 transition-colors">Pricing</Link>
            <Link href="/app" className="hover:text-slate-700 transition-colors">Create a figure</Link>
          </div>
          <p className="text-xs text-slate-300">© 2025 FigureReady</p>
        </div>
      </footer>

    </div>
  )
}
