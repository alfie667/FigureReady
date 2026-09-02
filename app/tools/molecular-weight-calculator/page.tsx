import type { Metadata } from 'next'
import Link from 'next/link'
import { LogoFull } from '@/components/Logo'
import MolecularWeightCalculator from './MolecularWeightCalculator'

export const metadata: Metadata = {
  title: 'Molecular Weight Calculator — Free Online Tool | FigureReady',
  description:
    'Calculate molecular weight from a chemical formula instantly. Free molecular weight calculator for scientists, researchers and students. Supports parentheses and hydrates.',
  alternates: { canonical: 'https://figureready.com/tools/molecular-weight-calculator' },
  openGraph: {
    title: 'Molecular Weight Calculator — Free Online Tool | FigureReady',
    description:
      'Calculate molecular weight from a chemical formula instantly. Free tool for scientists and researchers.',
    url: 'https://figureready.com/tools/molecular-weight-calculator',
    type: 'website',
    siteName: 'FigureReady',
  },
  twitter: {
    card: 'summary',
    title: 'Molecular Weight Calculator — Free Online Tool | FigureReady',
    description:
      'Calculate molecular weight from a chemical formula instantly. Free tool for scientists and researchers.',
  },
}

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Which formula syntax is supported?',
    a: 'Standard chemical formulas with element symbols and integer counts: H2O, NaCl, C6H12O6, C8H10N4O2, CaCO3. Parentheses at any nesting depth are supported: Ca(OH)2, Fe2(SO4)3, Al2(SO4)3. Hydrates with middle dot or period separator are supported: CuSO4·5H2O or CuSO4.5H2O.',
  },
  {
    q: 'What is NOT supported?',
    a: 'Ionic charge notation (Ca2+, SO4²⁻), isotopic notation (¹⁴C, [14C]), fractional atom counts (C3.5H5), and leading coefficients without a hydrate separator (2H2O on its own). The parser rejects these with a clear error rather than silently ignoring them.',
  },
  {
    q: 'What atomic weight values are used?',
    a: 'IUPAC 2021 Standard Atomic Weights, published by the Commission on Isotopic Abundances and Atomic Weights (CIAAW). For elements with no stable isotopes (Tc, Pm, and transuranic elements), the conventional mass of the most stable isotope is used, as recommended by IUPAC.',
  },
  {
    q: 'Is there a difference between molecular weight and molar mass?',
    a: 'Strictly, molecular weight is a dimensionless ratio (the mass of a molecule relative to 1/12 the mass of ¹²C), while molar mass is expressed in g/mol. In practice, their numerical values are identical and the terms are used interchangeably in laboratory settings. This calculator reports the result in g/mol (molar mass).',
  },
]

export default function MolecularWeightCalculatorPage() {
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
            <li className="text-slate-600">Molecular Weight Calculator</li>
          </ol>
        </nav>

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-blue-700">Free · No signup</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Molecular Weight Calculator
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed max-w-2xl">
            Calculate the molecular weight of a chemical formula instantly.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Result expressed in g/mol (molar mass). <a href="#mw-vs-mm" className="underline hover:text-slate-600 transition-colors">What&apos;s the difference?</a>
          </p>
        </div>

        {/* Calculator — above the fold */}
        <section
          aria-label="Calculator"
          className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8 mb-12"
        >
          <MolecularWeightCalculator />
        </section>

        {/* Supported syntax box */}
        <section className="mb-12 rounded-xl bg-slate-50 border border-slate-200 px-5 py-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-800 mb-2">Supported formula syntax</p>
          <ul className="space-y-1 list-none">
            <li><span className="font-mono text-slate-900">H2O, NaCl, C6H12O6</span> — standard element symbols with integer counts</li>
            <li><span className="font-mono text-slate-900">Ca(OH)2, Fe2(SO4)3</span> — parentheses at any nesting depth</li>
            <li><span className="font-mono text-slate-900">CuSO4·5H2O, CuSO4.5H2O</span> — hydrates (middle dot or period)</li>
          </ul>
          <p className="mt-2 text-slate-600 text-xs">
            Not supported in V1: ionic charges (Ca²⁺), isotopic notation (¹⁴C), fractional counts.
            Invalid syntax returns an explicit error — no silent partial calculation.
          </p>
        </section>

        {/* Educational content */}
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-slate-900 mb-0.5">What is molecular weight?</dt>
            <dd className="text-slate-700">Sum of the atomic masses of all atoms in a molecule, expressed in g/mol. Atomic masses from IUPAC 2021 (CIAAW).</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 mb-0.5" id="mw-vs-mm">Molecular weight vs molar mass</dt>
            <dd className="text-slate-700">Numerically identical. Molecular weight is dimensionless; molar mass is in g/mol. Used interchangeably in practice. This calculator reports g/mol.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 mb-0.5">Ionic charges, isotopes, fractions</dt>
            <dd className="text-slate-700">Not supported in V1. Ca²⁺, ¹⁴C, C3.5H5 will return an explicit error.</dd>
          </div>
        </dl>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-16 py-8">
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
