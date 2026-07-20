import type { Metadata } from 'next'
import Link from 'next/link'
import GatedAppLink from '@/components/GatedAppLink'

export const metadata: Metadata = {
  title: 'Free Publication Figure Templates for Researchers',
  description: 'Download free publication-ready figure templates for Nature, Science, IEEE. Or upload your Excel and get a custom figure in seconds with FigureReady.',
  alternates: { canonical: 'https://figureready.com/publication-figure-templates' },
  openGraph: {
    title: 'Free Publication Figure Templates for Researchers',
    description: 'Free publication-ready figure templates for Nature, Science, IEEE. Upload your Excel and get a custom figure in seconds.',
    url: 'https://figureready.com/publication-figure-templates',
    type: 'website',
    siteName: 'FigureReady',
  },
  twitter: {
    card: 'summary',
    title: 'Free Publication Figure Templates for Researchers',
    description: 'Free publication-ready figure templates for Nature, Science, IEEE. Upload your Excel, export in seconds.',
  },
}

const templates: { name: string; journal: string; type: string; desc: string }[] = [
  { name: 'Nature Line Chart',      journal: 'Nature / Nature Methods',   type: 'Line chart',    desc: 'Clean black axes, 8pt Helvetica, single-column 88 mm width.' },
  { name: 'ACS Bar Chart',          journal: 'ACS / JACS / Analytical',   type: 'Bar chart',     desc: 'Grayscale-first palette, correct tick lengths, no gridlines.' },
  { name: 'Science Scatter Plot',   journal: 'Science / Science Advances', type: 'Scatter plot',  desc: '57 mm single-column, minimal markers, publication axis weight.' },
  { name: 'IEEE Line Chart',        journal: 'IEEE Transactions',          type: 'Line chart',    desc: 'Times New Roman labels, standard IEEE tick and axis formatting.' },
  { name: 'Elsevier Bar Chart',     journal: 'Elsevier / ScienceDirect',   type: 'Bar chart',     desc: 'Arial font, 90 mm single-column, clean white background.' },
  { name: 'Clean Multi-Series',     journal: 'Universal',                  type: 'Multi-series',  desc: 'Accessible color palette with error bars. Works for any journal.' },
]

const comparison: { feature: string; manual: string; manualBad?: boolean; figureready: string; figurereadyGood?: boolean }[] = [
  { feature: 'Template source',          manual: 'Download & edit in Excel/PPT',  manualBad: true,  figureready: 'Built-in journal styles',        figurereadyGood: true },
  { feature: 'Correct journal sizing',   manual: 'âœ— Manual resizing required',    manualBad: true,  figureready: 'âœ“ Applied automatically',         figurereadyGood: true },
  { feature: 'Font & line weight',       manual: 'âœ— Must set manually',           manualBad: true,  figureready: 'âœ“ Pre-configured per journal',    figurereadyGood: true },
  { feature: 'Export quality',           manual: 'Screen resolution (72 dpi)',    manualBad: true,  figureready: 'High-res PNG (300 dpi) + SVG',    figurereadyGood: true },
  { feature: 'Error bars',              manual: 'âœ— Complex to add correctly',    manualBad: true,  figureready: 'âœ“ Select column, done',           figurereadyGood: true },
  { feature: 'Time to export',          manual: '30â€“90 min per figure',          manualBad: true,  figureready: '< 30 seconds',                   figurereadyGood: true },
  { feature: 'Price',                   manual: 'Free but slow',                               figureready: 'Free and fast',                  figurereadyGood: true },
]

const whyCards = [
  { title: 'Journal-accurate',  desc: 'Nature, ACS, IEEE, and Science styles built in. Fonts, line widths, and sizes match each journal\'s author guidelines.' },
  { title: 'No editing needed', desc: 'Apply the template, upload your data, and export. No PowerPoint, no Illustrator reformatting.' },
  { title: 'Error bars',        desc: 'SD and SEM support included. Select your error column and bars are rendered correctly.' },
  { title: 'SVG export',        desc: 'Export scalable SVG to resize for single- or double-column submission without quality loss.' },
  { title: 'Instant preview',   desc: 'See the figure update live as you change the style â€” before you commit to an export.' },
  { title: 'Free',              desc: 'No subscription, no account. All templates are free during the beta.' },
]

const steps = [
  { n: '1', title: 'Upload your Excel file', desc: 'Drag and drop a .xlsx file. FigureReady detects columns automatically.' },
  { n: '2', title: 'Choose a journal style', desc: 'Select Nature, ACS, IEEE, Science, or Clean. The template is applied instantly.' },
  { n: '3', title: 'Export your figure',     desc: 'Download a publication-ready PNG (300 dpi) or SVG in one click.' },
]

const faqs = [
  {
    q: 'Where can I find free publication figure templates?',
    a: 'FigureReady provides built-in publication figure templates for Nature, Science, ACS, IEEE, and Elsevier journals. Upload your Excel data, select the target journal style, and export a correctly-formatted figure in seconds â€” no design software required.',
  },
  {
    q: 'What makes a good publication figure template?',
    a: 'A good publication figure template matches the target journal\'s author guidelines: correct column width (typically 88 mm for single-column), minimum 300 dpi resolution, appropriate font (Arial or Helvetica, 7â€“9 pt for axis labels), clean axes without gridlines, and a legible color palette that also works in grayscale.',
  },
  {
    q: 'Can I use these templates for Nature or ACS journals?',
    a: 'Yes. FigureReady\'s Nature and ACS styles are designed to match the respective author guidelines â€” correct axis weight, font size, and figure dimensions. Export as SVG and scale to single- or double-column width before submission.',
  },
  {
    q: 'Do the templates support multiple data series?',
    a: 'Yes. You can add multiple Y columns to a single figure, with individual series names and colors. The multi-series layout uses an accessible color palette that remains distinguishable in print and greyscale.',
  },
  {
    q: 'Can I edit the figure after exporting?',
    a: 'Yes. Export as SVG and open in Adobe Illustrator, Inkscape, or Affinity Designer for final adjustments. Every element â€” axes, labels, markers â€” is a separate SVG object and fully editable.',
  },
]

export default function PublicationFigureTemplatesPage() {
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
          <span className="text-xs font-medium text-blue-700">Free publication figure templates</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
          Free publication figure templates<br className="hidden sm:block" />
          <span className="text-blue-600">for Nature, ACS, IEEE & more.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Apply a journal-accurate template to your Excel data and export a publication-ready figure in seconds. No design software, no reformatting, no cost.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <GatedAppLink className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-colors shadow-md">
            Apply a template â€” free â†’
          </GatedAppLink>
        </div>
      </section>

      {/* Template gallery */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">Available publication figure templates</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{t.type}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{t.name}</h3>
              <p className="text-[10px] font-medium text-blue-600 mb-2">{t.journal}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4 text-center">All templates are applied in-browser. Upload your data to see them live.</p>
      </section>

      {/* Comparison table */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">FigureReady templates vs manual formatting</h2>
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-4 text-left font-semibold text-slate-500 w-2/5">Feature</th>
                <th className="px-5 py-4 text-left font-semibold text-slate-700">Manual (Excel / PPT)</th>
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
                  <td className={`px-5 py-3.5 font-medium ${row.manualBad ? 'text-red-500' : 'text-slate-500'}`}>
                    {row.manual}
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
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">Why researchers choose FigureReady templates</h2>
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
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Apply a journal template to your data now</h2>
        <p className="text-slate-500 text-sm mb-8">No account, no installation. Nature, ACS, and IEEE templates included. Free.</p>
        <GatedAppLink className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md">
          Apply a template â€” free â†’
        </GatedAppLink>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>FigureReady â€” free beta, 2026</span>
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

