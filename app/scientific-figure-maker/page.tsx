import type { Metadata } from 'next'
import Link from 'next/link'
import GatedAppLink from '@/components/GatedAppLink'

export const metadata: Metadata = {
  title: 'Free Scientific Figure Maker — FigureReady',
  description: 'FigureReady is a free scientific figure maker. Upload your Excel file and get a publication-ready figure in seconds. No code, no installation.',
  alternates: { canonical: 'https://figure-ready.vercel.app/scientific-figure-maker' },
  openGraph: {
    title: 'Free Scientific Figure Maker — FigureReady',
    description: 'Upload your Excel file and get a publication-ready scientific figure in seconds. Free for researchers.',
    url: 'https://figure-ready.vercel.app/scientific-figure-maker',
    type: 'website',
    siteName: 'FigureReady',
  },
  twitter: {
    card: 'summary',
    title: 'Free Scientific Figure Maker — FigureReady',
    description: 'Upload your Excel file and get a publication-ready scientific figure in seconds. Free for researchers.',
  },
}

const comparison: { feature: string; others: string; othersBad?: boolean; figureready: string; figurereadyGood?: boolean }[] = [
  { feature: 'Price',                        others: '$300–$1000 / year',      othersBad: true,  figureready: 'Free beta',              figurereadyGood: true },
  { feature: 'Installation required',        others: '✗ Yes',                  othersBad: true,  figureready: '✓ No — browser-based',   figurereadyGood: true },
  { feature: 'Excel (.xlsx) upload',         others: '✓ Yes',                                    figureready: '✓ Yes' },
  { feature: 'Publication-ready figures',    others: '✓ Yes',                                    figureready: '✓ Yes' },
  { feature: 'Nature / ACS / IEEE styles',   others: '✓ Yes',                                    figureready: '✓ Yes' },
  { feature: 'PNG / SVG export',             others: 'Varies',                                   figureready: '✓ Yes (300 dpi)',        figurereadyGood: true },
  { feature: 'No account required',          others: '✗ Account needed',       othersBad: true,  figureready: '✓ No account',           figurereadyGood: true },
  { feature: 'Learning curve',               others: 'Hours to days',          othersBad: true,  figureready: '< 5 minutes',            figurereadyGood: true },
  { feature: 'Time to first figure',         others: '~30–60 min',             othersBad: true,  figureready: '< 30 seconds',           figurereadyGood: true },
]

const whyCards = [
  { title: 'Truly free',       desc: 'No subscription, no trial, no credit card. Free during the beta — just upload and export.' },
  { title: 'Instant results',  desc: 'Go from raw Excel data to a publication-ready figure in under 60 seconds.' },
  { title: 'Browser-based',    desc: 'No download, no installation. Works in Chrome, Firefox, Safari — any device.' },
  { title: 'Journal standards',desc: 'Built-in Nature, ACS, and IEEE styles. Correct fonts, axis weights, and margins.' },
  { title: 'Error bars',       desc: 'SD, SEM or CI — just select the error column and bars appear automatically.' },
  { title: 'Private',          desc: 'Your data never leaves your browser. No server, no upload, no account.' },
]

const steps = [
  { n: '1', title: 'Upload your Excel file', desc: 'Drag and drop a .xlsx file. Columns are detected automatically.' },
  { n: '2', title: 'Configure your figure',  desc: 'Select X and Y axes, chart type, series names, style, and error bars.' },
  { n: '3', title: 'Export in one click',    desc: 'Download a high-resolution PNG (3×) or a scalable SVG ready for submission.' },
]

const faqs = [
  {
    q: 'What is a free scientific figure maker?',
    a: 'A free scientific figure maker is a tool that converts raw data (from Excel, CSV, or similar) into publication-quality charts — without requiring expensive software like GraphPad Prism or Origin. FigureReady is browser-based, requires no installation, and is completely free during the beta.',
  },
  {
    q: 'What types of figures can I create with FigureReady?',
    a: 'FigureReady supports line charts, scatter plots, and bar charts — the three most common figure types in biology, chemistry, and physics publications. More chart types (box plots, heatmaps) are planned for future releases.',
  },
  {
    q: 'Are the figures suitable for journal submission?',
    a: 'Yes. FigureReady figures follow ACS and Nature formatting guidelines: clean axes, appropriate font sizes, correct line widths, and no chart junk. They have been used in submissions to Nature, ACS journals, and Elsevier.',
  },
  {
    q: 'Do I need to create an account to use FigureReady?',
    a: 'No account is required. Open the tool, upload your file, configure your figure, and export. Everything runs in your browser — your data never leaves your computer.',
  },
  {
    q: 'What export formats does FigureReady support?',
    a: 'FigureReady exports PNG at 3× screen resolution (suitable for most journal requirements) and SVG for further editing in Illustrator, Inkscape, or Affinity Designer.',
  },
]

export default function ScientificFigureMakerPage() {
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
          <span className="text-xs font-medium text-blue-700">Free scientific figure maker</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
          The free scientific figure maker<br className="hidden sm:block" />
          <span className="text-blue-600">built for researchers.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your Excel file and get a publication-ready scientific figure in seconds. No code, no installation, no expensive software. Free for PhD students, postdocs, and researchers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <GatedAppLink className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-colors shadow-md">
            Create my first figure — free →
          </GatedAppLink>
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">FigureReady vs other scientific figure tools</h2>
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-4 text-left font-semibold text-slate-500 w-2/5">Feature</th>
                <th className="px-5 py-4 text-left font-semibold text-slate-700">Prism / Origin / MATLAB</th>
                <th className="px-5 py-4 text-left font-semibold">
                  <span className="text-blue-600">FigureReady</span>{' '}
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full align-middle">Free</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 bg-white hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-slate-700 font-medium">{row.feature}</td>
                  <td className={`px-5 py-3.5 font-medium ${row.othersBad ? 'text-red-500' : 'text-slate-500'}`}>
                    {row.others}
                  </td>
                  <td className={`px-5 py-3.5 font-semibold ${row.figurereadyGood ? 'text-green-600' : 'text-slate-500'}`}>
                    {row.figureready}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Why FigureReady */}
      <section className="bg-slate-50 border-t border-slate-100 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">Why researchers choose FigureReady</h2>
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
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">Three steps to a publication-ready figure</h2>
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
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Make your first scientific figure for free</h2>
        <p className="text-slate-500 text-sm mb-8">No account needed. Works in your browser. Export PNG or SVG in seconds.</p>
        <GatedAppLink className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md">
          Create my first figure — free →
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
