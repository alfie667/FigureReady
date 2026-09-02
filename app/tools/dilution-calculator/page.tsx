import type { Metadata } from 'next'
import Link from 'next/link'
import { LogoFull } from '@/components/Logo'
import DilutionCalculator from './DilutionCalculator'

export const metadata: Metadata = {
  title: 'Dilution Calculator — C1V1 = C2V2 | FigureReady',
  description:
    'Calculate solution dilutions using C1V1 = C2V2. Free dilution calculator for stock concentrations, final concentrations and laboratory volumes.',
  alternates: { canonical: 'https://figureready.com/tools/dilution-calculator' },
  openGraph: {
    title: 'Dilution Calculator — C1V1 = C2V2 | FigureReady',
    description: 'Calculate solution dilutions using C1V1 = C2V2. Free tool for laboratory use.',
    url: 'https://figureready.com/tools/dilution-calculator',
    type: 'website',
    siteName: 'FigureReady',
  },
  twitter: {
    card: 'summary',
    title: 'Dilution Calculator — C1V1 = C2V2 | FigureReady',
    description: 'Calculate solution dilutions using C1V1 = C2V2.',
  },
}

export default function DilutionCalculatorPage() {
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
            <li className="text-slate-600">Dilution Calculator</li>
          </ol>
        </nav>

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-blue-700">Free · No signup</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Dilution Calculator
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed max-w-2xl">
            Calculate stock and final concentrations or volumes using C₁V₁ = C₂V₂.
          </p>
        </div>

        {/* Calculator */}
        <section
          aria-label="Calculator"
          className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8 mb-12"
        >
          <DilutionCalculator />
        </section>

        {/* Concise educational content */}
        <dl className="space-y-4 text-sm mb-12">
          <div>
            <dt className="font-semibold text-slate-900 mb-0.5">What is C₁V₁ = C₂V₂?</dt>
            <dd className="text-slate-700">
              The dilution equation states that the amount of solute is conserved: concentration × volume is constant before and after dilution.
              C₁ and V₁ are the stock values; C₂ and V₂ are the final (diluted) values.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 mb-0.5">Final volume vs. solvent volume</dt>
            <dd className="text-slate-700">
              V₂ is the <em>final solution volume</em>, not the volume of added solvent.
              Correct preparation: add stock solution (V₁), then bring to volume V₂ with solvent — do not simply add (V₂ − V₁) of solvent, as volumes are not always strictly additive.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 mb-0.5">Concentration units</dt>
            <dd className="text-slate-700">
              Supported molar units: M, mM, µM, nM. Supported mass concentration units: mg/mL, µg/mL, ng/mL.
              C₁ and C₂ must use the same family — mixing molar and mass units requires molar mass and is not supported here.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 mb-0.5">Need the stock concentration?</dt>
            <dd className="text-slate-700">
              Use the{' '}
              <Link href="/tools/molarity-calculator" className="text-blue-600 hover:text-blue-700 underline">
                Molarity Calculator
              </Link>{' '}
              to compute molarity from mass, molar mass, and volume.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 mb-0.5">Need to compute molar mass?</dt>
            <dd className="text-slate-700">
              Use the{' '}
              <Link href="/tools/molecular-weight-calculator" className="text-blue-600 hover:text-blue-700 underline">
                Molecular Weight Calculator
              </Link>{' '}
              to get molar mass from a chemical formula.
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
