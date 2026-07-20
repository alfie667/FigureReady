import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Roadmap â€” FigureReady',
  description: 'See what has shipped and what is coming next in FigureReady â€” the free scientific figure maker for researchers.',
  alternates: { canonical: 'https://figureready.com/roadmap' },
  openGraph: {
    title: 'Roadmap â€” FigureReady',
    description: 'See what has shipped and what is coming next in FigureReady.',
    url: 'https://figureready.com/roadmap',
    type: 'website',
  },
}

const released = [
  'Excel (.xlsx) upload',
  'Multi-series line, scatter, and bar charts',
  'Error bars (SD / SEM)',
  'Visual style editor (font, color, line width, markers)',
  'PNG (3Ã—) and SVG export',
  'Saved style defaults',
]

const planned = [
  { title: 'Journal templates', desc: 'One-click presets matching Nature, Science, ACS, and Elsevier figure guidelines.', status: 'planned' },
  { title: 'Multi-panel figures', desc: 'Combine several charts into a single labelled figure (A, B, Câ€¦).', status: 'planned' },
  { title: 'Figure consistency checker', desc: 'Detect inconsistent fonts, axis ranges, or color palettes across panels.', status: 'planned' },
  { title: 'Advanced annotations', desc: 'Arrows, brackets, significance stars (*, **, ***), and text boxes.', status: 'planned' },
  { title: 'LaTeX axis labels', desc: 'Render mathematical expressions and subscripts in axis titles.', status: 'planned' },
  { title: 'PDF export', desc: 'Vector PDF ready for journal submission.', status: 'planned' },
  { title: 'Data table view', desc: 'Preview and edit uploaded data directly in the browser.', status: 'planned' },
]

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 16l4-5 3 3 5-7" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">FigureReady</span>
          </Link>
          <Link href="/app" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Try it free
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Roadmap</h1>
          <p className="text-slate-500">
            FigureReady is actively developed. Here is what has shipped and what is coming next.
          </p>
        </div>

        {/* Shipped */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">Shipped</h2>
          <div className="space-y-2">
            {released.map(item => (
              <div key={item} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Planned */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Planned</h2>
          <div className="space-y-3">
            {planned.map(item => (
              <div key={item.title} className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 p-6 rounded-2xl bg-blue-50 border border-blue-100 text-center">
          <p className="text-sm font-semibold text-blue-900 mb-1">Have a feature request?</p>
          <p className="text-xs text-blue-700 mb-4">Your feedback directly shapes the roadmap.</p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Try the app and send feedback
          </Link>
        </div>
      </main>
    </div>
  )
}

