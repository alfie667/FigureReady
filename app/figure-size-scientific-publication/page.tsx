import type { Metadata } from 'next'
import Link from 'next/link'
import GatedAppLink from '@/components/GatedAppLink'

export const metadata: Metadata = {
  title: 'Figure Size Guide for Scientific Publications — Nature, Science, IEEE',
  description: 'Complete guide to figure sizes for Nature, Science, Cell, IEEE and other major journals. Plus a free tool to generate correctly-sized figures from Excel.',
  alternates: {
    canonical: 'https://figure-ready.vercel.app/figure-size-scientific-publication',
  },
}

const journalSizes: { journal: string; singleCol: string; doubleCol: string; maxHeight: string; dpi: string }[] = [
  { journal: 'Nature',          singleCol: '88 mm',  doubleCol: '180 mm', maxHeight: '225 mm', dpi: '300+' },
  { journal: 'Science',         singleCol: '57 mm',  doubleCol: '119 mm', maxHeight: '178 mm', dpi: '300+' },
  { journal: 'Cell',            singleCol: '85 mm',  doubleCol: '170 mm', maxHeight: '225 mm', dpi: '300+' },
  { journal: 'PNAS',            singleCol: '87 mm',  doubleCol: '178 mm', maxHeight: '230 mm', dpi: '300+' },
  { journal: 'ACS Journals',    singleCol: '84 mm',  doubleCol: '177 mm', maxHeight: '230 mm', dpi: '300+' },
  { journal: 'IEEE Journals',   singleCol: '88 mm',  doubleCol: '180 mm', maxHeight: '234 mm', dpi: '300+' },
  { journal: 'Elsevier',        singleCol: '90 mm',  doubleCol: '190 mm', maxHeight: '240 mm', dpi: '300+' },
  { journal: 'PLOS ONE',        singleCol: '83 mm',  doubleCol: '174 mm', maxHeight: '225 mm', dpi: '300+' },
]

const whyCards = [
  { title: 'Correct sizing',    desc: 'FigureReady exports figures at the exact pixel dimensions specified by Nature, ACS, and IEEE.' },
  { title: '300 dpi output',    desc: 'All PNG exports are 3× resolution — meeting the minimum 300 dpi requirement of all major journals.' },
  { title: 'SVG for scaling',   desc: 'SVG exports are resolution-independent — scale to any journal dimension without quality loss.' },
  { title: 'No reformatting',   desc: 'No more resizing in PowerPoint or Photoshop. Export once, submit directly.' },
  { title: 'Font-size correct', desc: 'Axis labels and tick marks are sized to remain legible at single-column width after printing.' },
  { title: 'Free',              desc: 'No subscription, no trial. Just upload, configure, and export the correctly-sized figure.' },
]

const steps = [
  { n: '1', title: 'Upload your Excel file', desc: 'Drag and drop a .xlsx file. Columns are detected automatically.' },
  { n: '2', title: 'Select journal style',   desc: 'Choose Nature, ACS, IEEE or Clean. The correct dimensions and fonts are applied instantly.' },
  { n: '3', title: 'Export at correct size', desc: 'Download a high-resolution PNG or SVG sized for single- or double-column layout.' },
]

const faqs = [
  {
    q: 'What figure size does Nature require?',
    a: 'Nature requires single-column figures to be 88 mm wide and double-column figures to be 180 mm wide, with a maximum height of 225 mm. Resolution must be at least 300 dpi for raster images. FigureReady exports PNG at 3× resolution, which meets this requirement.',
  },
  {
    q: 'What is the standard figure size for scientific publications?',
    a: 'Most journals follow similar conventions: single-column figures are roughly 85–90 mm wide and double-column figures are 170–190 mm wide, with a maximum height around 225 mm. The resolution requirement is universally 300 dpi minimum for print quality.',
  },
  {
    q: 'How do I resize a figure for a journal submission?',
    a: 'The safest approach is to use a vector format (SVG, EPS, or PDF) and scale it to the target dimensions without resampling. If using a raster format (PNG, TIFF), ensure the resolution is at least 300 dpi at the final print size. FigureReady exports SVG (scalable, lossless) and high-resolution PNG.',
  },
  {
    q: 'What DPI do I need for a scientific figure?',
    a: 'Most journals require a minimum of 300 dpi for photographs and combination figures, and 1000 dpi for pure line art. FigureReady exports PNG at 3× screen resolution (typically 288–300 dpi at single-column width), which satisfies the 300 dpi requirement for combined figures.',
  },
  {
    q: 'Can FigureReady automatically format figures to the correct journal size?',
    a: 'Yes. FigureReady includes built-in styles for Nature, ACS, and IEEE that set font sizes, line widths, and axis formatting to match each journal\'s guidelines. Export as SVG and scale to the exact column width specified in the journal\'s author instructions.',
  },
]

export default function FigureSizeScientificPublicationPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">

      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 16l4-5 3 3 5-7" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">FigureReady</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/roadmap" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">Roadmap</Link>
            <GatedAppLink className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              Try it free
            </GatedAppLink>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs font-medium text-blue-700">Figure size for scientific publications</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
          Figure size guide for<br className="hidden sm:block" />
          <span className="text-blue-600">Nature, Science, IEEE & more.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          The complete reference for figure dimensions in major scientific journals — plus a free tool to export correctly-sized, publication-ready figures directly from Excel.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <GatedAppLink className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-colors shadow-md">
            Generate a correctly-sized figure — free →
          </GatedAppLink>
        </div>
      </section>

      {/* Journal size table */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">Figure size requirements by journal</h2>
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-4 text-left font-semibold text-slate-500">Journal</th>
                <th className="px-5 py-4 text-left font-semibold text-slate-700">Single column</th>
                <th className="px-5 py-4 text-left font-semibold text-slate-700">Double column</th>
                <th className="px-5 py-4 text-left font-semibold text-slate-700">Max height</th>
                <th className="px-5 py-4 text-left font-semibold text-green-600">Min DPI</th>
              </tr>
            </thead>
            <tbody>
              {journalSizes.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 bg-white hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-slate-800 font-semibold">{row.journal}</td>
                  <td className="px-5 py-3.5 text-slate-600">{row.singleCol}</td>
                  <td className="px-5 py-3.5 text-slate-600">{row.doubleCol}</td>
                  <td className="px-5 py-3.5 text-slate-600">{row.maxHeight}</td>
                  <td className="px-5 py-3.5 text-green-600 font-semibold">{row.dpi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center">Dimensions are approximate. Always verify with the current author guidelines of your target journal.</p>
      </section>

      {/* Why FigureReady */}
      <section className="bg-slate-50 border-t border-slate-100 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">Why researchers use FigureReady for sizing</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whyCards.map(c => (
              <div key={c.title} className="flex items-start gap-3 p-5 rounded-xl border border-slate-200 bg-white">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{c.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">Get a correctly-sized figure in three steps</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map(s => (
            <div key={s.n} className="text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white text-base font-bold flex items-center justify-center mx-auto mb-4">
                {s.n}
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">{s.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 border-t border-slate-100 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{f.q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Export a correctly-sized figure in seconds</h2>
        <p className="text-slate-500 text-sm mb-8">No account needed. Nature, ACS, and IEEE styles built in. Free during the beta.</p>
        <GatedAppLink className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md">
          Generate my figure — free →
        </GatedAppLink>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>FigureReady — free beta, 2026</span>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
            <Link href="/roadmap" className="hover:text-slate-600 transition-colors">Roadmap</Link>
            <a href="mailto:zeggai_nouh@hotmail.fr" className="hover:text-slate-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
