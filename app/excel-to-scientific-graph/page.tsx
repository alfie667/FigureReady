import type { Metadata } from 'next'
import Link from 'next/link'
import GatedAppLink from '@/components/GatedAppLink'

export const metadata: Metadata = {
  title: 'Convert Excel to Scientific Graph — Publication Ready in Seconds',
  description: 'Convert your Excel data into a publication-ready scientific graph in seconds. No code, no Prism. Free tool for PhD students and researchers.',
  alternates: { canonical: 'https://figure-ready.vercel.app/excel-to-scientific-graph' },
  openGraph: {
    title: 'Convert Excel to Scientific Graph — Publication Ready in Seconds',
    description: 'Convert your Excel data into a publication-ready scientific graph in seconds. Free for PhD students and researchers.',
    url: 'https://figure-ready.vercel.app/excel-to-scientific-graph',
    type: 'website',
    siteName: 'FigureReady',
  },
  twitter: {
    card: 'summary',
    title: 'Convert Excel to Scientific Graph — Free Tool',
    description: 'Convert your Excel data into a publication-ready scientific graph in seconds. No code, no Prism.',
  },
}

const comparison: { feature: string; excel: string; excelBad?: boolean; figureready: string; figurereadyGood?: boolean }[] = [
  { feature: 'Scientific figure quality', excel: '✗ Not publication-ready',    excelBad: true,  figureready: '✓ Nature / ACS / IEEE quality',  figurereadyGood: true },
  { feature: 'Correct font sizes',        excel: '✗ Requires manual setup',    excelBad: true,  figureready: '✓ Pre-configured per journal',    figurereadyGood: true },
  { feature: 'Axis weight & formatting',  excel: '✗ Default Excel style',      excelBad: true,  figureready: '✓ Publication axes',              figurereadyGood: true },
  { feature: 'Error bars (SD / SEM)',     excel: 'Complex to add correctly',   excelBad: true,  figureready: '✓ Select column, done',           figurereadyGood: true },
  { feature: 'High-resolution export',   excel: '72 dpi (screen only)',        excelBad: true,  figureready: '300 dpi PNG + SVG',               figurereadyGood: true },
  { feature: 'Multiple Y series',         excel: '✓ Yes',                                       figureready: '✓ Yes' },
  { feature: 'Time to a usable figure',  excel: '30–90 min per figure',        excelBad: true,  figureready: '< 30 seconds',                   figurereadyGood: true },
  { feature: 'Price',                    excel: 'Included in Office',                           figureready: 'Free beta',                       figurereadyGood: true },
]

const whyCards = [
  { title: 'Upload any .xlsx',     desc: 'Drag and drop your Excel file. Headers are detected automatically — no reformatting needed.' },
  { title: 'Journal-ready output', desc: 'Nature, ACS, and IEEE styles applied in one click. Correct fonts, axis weights, and margins.' },
  { title: 'High-res export',      desc: 'PNG at 3× resolution and scalable SVG — meeting 300 dpi requirements for journal submission.' },
  { title: 'Error bars built in',  desc: 'Add SD or SEM in one step. No complex formula, no manual drawing.' },
  { title: 'Browser-based',        desc: 'No installation, no plugin. Works in any browser. Your data stays on your computer.' },
  { title: 'Free',                 desc: 'No subscription, no account, no credit card. Free during the beta.' },
]

const steps = [
  { n: '1', title: 'Upload your Excel file', desc: 'Drag and drop a .xlsx file. Columns are detected and listed automatically.' },
  { n: '2', title: 'Configure your graph',   desc: 'Select X and Y axes, chart type (line, scatter, bar), series names, and error bars.' },
  { n: '3', title: 'Export the graph',       desc: 'Download a high-resolution PNG (3×) or a scalable SVG ready for journal submission.' },
]

const faqs = [
  {
    q: 'How do I convert Excel data to a scientific graph?',
    a: 'With FigureReady: upload your .xlsx file, select the X and Y columns, choose a journal style (Nature, ACS, IEEE), and click export. The entire process takes less than 30 seconds. No code, no installation, no account required.',
  },
  {
    q: 'Why are Excel graphs not suitable for scientific publications?',
    a: 'Excel\'s default charts use screen-resolution output (72 dpi), incorrect font sizes for print, heavy gridlines, and non-standard axis formatting. Scientific journals require at least 300 dpi, specific font sizes (7–9 pt for axis labels), minimal chart decoration, and clean black axes — none of which Excel applies by default.',
  },
  {
    q: 'What types of scientific graphs can I create from Excel with FigureReady?',
    a: 'FigureReady supports line charts, scatter plots, and bar charts — the three most common figure types in scientific publications. Multiple Y series are supported, and you can add error bars (SD or SEM) by selecting any column as the error source.',
  },
  {
    q: 'Can I use FigureReady if my data is already in Excel?',
    a: 'Yes — FigureReady is built specifically for Excel users. Upload your .xlsx file directly. Columns are detected automatically, including headers. There is no need to reformat your data or copy-paste it into another tool.',
  },
  {
    q: 'What is the difference between FigureReady and using Excel or Prism?',
    a: 'Excel produces screen-quality charts that need extensive manual formatting for publication. Prism produces publication-quality figures but costs $840/year and requires installation. FigureReady produces publication-quality figures in seconds, runs in your browser, and is free.',
  },
]

export default function ExcelToScientificGraphPage() {
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
          <span className="text-xs font-medium text-blue-700">Excel to scientific graph</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
          Excel charts look amateur.<br className="hidden sm:block" />
          <span className="text-blue-600">Your data deserves better.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Convert your Excel data into a publication-ready scientific graph in seconds. No code, no Prism, no reformatting. Free for PhD students and researchers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <GatedAppLink className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-colors shadow-md">
            Convert my Excel data — free →
          </GatedAppLink>
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">FigureReady vs Excel for scientific graphs</h2>
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-4 text-left font-semibold text-slate-500 w-2/5">Feature</th>
                <th className="px-5 py-4 text-left font-semibold text-slate-700">Excel chart</th>
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
                  <td className={`px-5 py-3.5 font-medium ${row.excelBad ? 'text-red-500' : 'text-slate-500'}`}>
                    {row.excel}
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
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">Why researchers convert Excel data with FigureReady</h2>
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
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">Three steps to convert Excel to a scientific graph</h2>
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
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Stop reformatting Excel charts for publication</h2>
        <p className="text-slate-500 text-sm mb-8">Upload your .xlsx and export a publication-ready graph in under 30 seconds. Free.</p>
        <GatedAppLink className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md">
          Convert my Excel data — free →
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
