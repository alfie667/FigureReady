import type { Metadata } from 'next'
import Link from 'next/link'
import GatedAppLink from '@/components/GatedAppLink'

export const metadata: Metadata = {
  title: 'Free GraphPad Prism Alternative — FigureReady',
  description: 'FigureReady is a free GraphPad Prism alternative. Upload your Excel file and get a publication-ready figure in seconds. No installation, no subscription, no code.',
  alternates: { canonical: 'https://figure-ready.vercel.app/graphpad-alternative' },
  openGraph: {
    title: 'Free GraphPad Prism Alternative — FigureReady',
    description: 'Get publication-ready figures from Excel in seconds. Free alternative to GraphPad Prism.',
    url: 'https://figure-ready.vercel.app/graphpad-alternative',
    type: 'website',
    siteName: 'FigureReady',
  },
  twitter: {
    card: 'summary',
    title: 'Free GraphPad Prism Alternative — FigureReady',
    description: 'Get publication-ready figures from Excel in seconds. Free alternative to GraphPad Prism.',
  },
}

const comparison: { feature: string; graphpad: string; graphpadBad?: boolean; figureready: string; figurereadyGood?: boolean }[] = [
  { feature: 'Price',                        graphpad: '$840 / year',           graphpadBad: true,  figureready: 'Free beta',              figurereadyGood: true },
  { feature: 'Installation required',        graphpad: '✗ Yes (Windows/Mac)',   graphpadBad: true,  figureready: '✓ No — browser-based',   figurereadyGood: true },
  { feature: 'Excel (.xlsx) upload',         graphpad: '✓ Yes',                                    figureready: '✓ Yes' },
  { feature: 'Publication-ready figures',    graphpad: '✓ Yes',                                    figureready: '✓ Yes' },
  { feature: 'Error bars',                   graphpad: '✓ Yes',                                    figureready: '✓ Yes' },
  { feature: 'Multiple Y series',            graphpad: '✓ Yes',                                    figureready: '✓ Yes' },
  { feature: 'PNG / SVG export',             graphpad: '✓ Yes',                                    figureready: '✓ Yes (300 dpi)',        figurereadyGood: true },
  { feature: 'Nature / Science / IEEE format',graphpad: '✓ Yes',                                   figureready: '✓ Yes' },
  { feature: 'Complex statistics (ANOVA…)', graphpad: '✓ Yes',                                     figureready: '✗ Not yet' },
  { feature: 'Time to first figure',         graphpad: '~30 min',               graphpadBad: true,  figureready: '< 30 seconds',           figurereadyGood: true },
]

const whyCards = [
  { title: 'Instant',        desc: 'Upload your Excel file and get your figure in under 60 seconds. Zero learning curve.' },
  { title: 'Browser-based',  desc: 'No download, no installation, no IT tickets. Works on any computer with a browser.' },
  { title: 'Journal-ready',  desc: 'ACS-style figures with correct fonts, line widths and axis formatting for peer review.' },
  { title: 'Error bars',     desc: 'SD and SEM support built in. Select your error column and they appear automatically.' },
  { title: 'Style control',  desc: 'Font size, line width, markers and colors — all adjustable visually, like Canva.' },
  { title: 'Free',           desc: 'No subscription, no trial, no credit card. Free during the beta.' },
]

const steps = [
  { n: '1', title: 'Upload your Excel file', desc: 'Drag and drop a .xlsx file. Columns are detected automatically.' },
  { n: '2', title: 'Configure your figure',  desc: 'Select X and Y axes, chart type, series names, and error bars.' },
  { n: '3', title: 'Export in one click',    desc: 'Download a high-resolution PNG (3×) or a scalable SVG.' },
]

const faqs = [
  {
    q: 'Is FigureReady really free?',
    a: 'Yes. FigureReady is completely free during the beta. No credit card required, no trial period. Just upload your data and export your figure.',
  },
  {
    q: 'Does FigureReady work like GraphPad Prism?',
    a: 'FigureReady focuses on the most common use case: turning Excel data into a clean, publication-ready figure. You upload a .xlsx file, select your axes, and export. No statistical analysis engine — just fast, beautiful figures.',
  },
  {
    q: 'Can I create the same types of figures as in GraphPad?',
    a: 'FigureReady supports line charts, scatter plots and bar charts — the most common figure types in biology and chemistry publications. More types are on the roadmap.',
  },
  {
    q: 'Does FigureReady support error bars?',
    a: 'Yes. You can attach any column as an error bar (SD, SEM, CI). Error bars are rendered with correct cap formatting for publication.',
  },
  {
    q: 'What file formats does FigureReady export?',
    a: 'FigureReady exports high-resolution PNG at 3× screen resolution and scalable SVG for further editing in Illustrator or Inkscape.',
  },
  {
    q: 'Are FigureReady figures suitable for journal submission?',
    a: 'Yes. The default style follows ACS formatting guidelines: clean black axes, correct font sizes, no chart junk. Figures have been used in Nature, ACS and Elsevier submissions.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account is required. Everything runs in your browser. Your data never leaves your computer.',
  },
]

export default function GraphPadAlternativePage() {
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
          <span className="text-xs font-medium text-blue-700">Free GraphPad Prism alternative</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
          GraphPad Prism is great.<br className="hidden sm:block" />
          <span className="text-blue-600">$840/year</span> is not.
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          FigureReady is a free alternative to GraphPad Prism. Upload your Excel file and get a publication-ready figure in seconds — no installation, no subscription, no code.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <GatedAppLink className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-colors shadow-md">
            Create my first figure — free →
          </GatedAppLink>
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">FigureReady vs GraphPad Prism</h2>
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-4 text-left font-semibold text-slate-500 w-2/5">Feature</th>
                <th className="px-5 py-4 text-left font-semibold text-slate-700">GraphPad Prism</th>
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
                  <td className={`px-5 py-3.5 font-medium ${row.graphpadBad ? 'text-red-500' : 'text-slate-500'}`}>
                    {row.graphpad}
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
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Stop paying $840/year for figures</h2>
        <p className="text-slate-500 text-sm mb-8">FigureReady is free. No account needed. Works in your browser.</p>
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
