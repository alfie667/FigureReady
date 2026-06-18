import Link from 'next/link'
import BetaSignupForm from '@/components/BetaSignupForm'

const features = [
  { label: 'Excel upload (.xlsx)', desc: 'Drop your file, columns detected automatically.' },
  { label: 'Multiple curves', desc: 'Plot several Y series on the same figure.' },
  { label: 'Error bars', desc: 'Attach standard deviation or standard error columns.' },
  { label: 'Style customization', desc: 'Font, line width, markers, colors — visually.' },
  { label: 'PNG & SVG export', desc: 'High-resolution PNG (3×) and scalable SVG.' },
]

const steps = [
  { n: '1', title: 'Upload your Excel file', desc: 'Drag and drop a .xlsx file. Columns are detected automatically.' },
  { n: '2', title: 'Configure your figure', desc: 'Select X and Y axes, chart type, series names, and error bars.' },
  { n: '3', title: 'Export publication-ready graphics', desc: 'Download PNG at 3× resolution or SVG for vector editing.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 16l4-5 3 3 5-7" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">FigureReady</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/roadmap" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">Roadmap</Link>
            <Link href="/app" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              Try it free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-medium text-blue-700">Free beta — no account needed</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
          Create publication-ready<br className="hidden sm:block" /> scientific figures from Excel<br className="hidden sm:block" /> in minutes
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your data, customize your figure, and export publication-quality graphics without Origin or complex plotting software.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/app"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-colors shadow-md"
          >
            Start for free →
          </Link>
          <Link
            href="/roadmap"
            className="px-8 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-base font-semibold rounded-xl transition-colors"
          >
            See roadmap
          </Link>
        </div>

        {/* Beta email capture */}
        <div className="mt-12 pt-10 border-t border-slate-100">
          <p className="text-sm font-semibold text-slate-800 mb-1">Join the beta — get early access</p>
          <p className="text-xs text-slate-400 mb-5">Be the first to know about new features. No spam, ever.</p>
          <BetaSignupForm />
        </div>
      </section>

      {/* Chart illustration */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          {/* Fake app chrome */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-slate-400 font-mono">figureready.app</span>
          </div>
          {/* SVG chart preview */}
          <div className="p-8 flex items-center justify-center bg-white">
            <svg viewBox="0 0 480 300" className="w-full max-w-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Grid lines */}
              {[60, 120, 180, 240].map(y => (
                <line key={y} x1="60" y1={y} x2="440" y2={y} stroke="#f1f5f9" strokeWidth="1" />
              ))}
              {/* Axes */}
              <line x1="60" y1="16" x2="60" y2="260" stroke="#000" strokeWidth="1.5" />
              <line x1="60" y1="260" x2="440" y2="260" stroke="#000" strokeWidth="1.5" />
              {/* X ticks & labels */}
              {[0,1,2,3,4].map((i) => {
                const x = 60 + i * 95
                return (
                  <g key={i}>
                    <line x1={x} y1="260" x2={x} y2="266" stroke="#000" strokeWidth="1.5" />
                    <text x={x} y="278" textAnchor="middle" fontSize="11" fill="#334155" fontFamily="Helvetica Neue, sans-serif">{i}</text>
                  </g>
                )
              })}
              {/* Y ticks & labels */}
              {[0,1,2,3,4].map((i) => {
                const y = 260 - i * 60
                return (
                  <g key={i}>
                    <line x1="54" y1={y} x2="60" y2={y} stroke="#000" strokeWidth="1.5" />
                    <text x="48" y={y+4} textAnchor="end" fontSize="11" fill="#334155" fontFamily="Helvetica Neue, sans-serif">{i * 25}</text>
                  </g>
                )
              })}
              {/* Axis labels */}
              <text x="250" y="296" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a" fontFamily="Helvetica Neue, sans-serif">Concentration (mM)</text>
              <text x="20" y="140" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a" fontFamily="Helvetica Neue, sans-serif" transform="rotate(-90 20 140)">Absorbance (a.u.)</text>
              {/* Series 1 (black) */}
              <polyline points="60,220 155,185 250,145 345,95 440,55" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              {[[60,220],[155,185],[250,145],[345,95],[440,55]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="4" fill="#000" />
              ))}
              {/* Error bars series 1 */}
              {[[60,220,12],[155,185,10],[250,145,8],[345,95,9],[440,55,7]].map(([x,y,e],i) => (
                <g key={i}>
                  <line x1={x} y1={y-e} x2={x} y2={y+e} stroke="#000" strokeWidth="1" />
                  <line x1={x-4} y1={y-e} x2={x+4} y2={y-e} stroke="#000" strokeWidth="1" />
                  <line x1={x-4} y1={y+e} x2={x+4} y2={y+e} stroke="#000" strokeWidth="1" />
                </g>
              ))}
              {/* Series 2 (red) */}
              <polyline points="60,240 155,225 250,200 345,170 440,148" stroke="#E2211C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              {[[60,240],[155,225],[250,200],[345,170],[440,148]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="4" fill="#E2211C" />
              ))}
              {/* Legend */}
              <line x1="290" y1="30" x2="310" y2="30" stroke="#000" strokeWidth="1.5" />
              <circle cx="300" cy="30" r="3.5" fill="#000" />
              <text x="315" y="34" fontSize="11" fill="#334155" fontFamily="Helvetica Neue, sans-serif">Sample A</text>
              <line x1="380" y1="30" x2="400" y2="30" stroke="#E2211C" strokeWidth="1.5" />
              <circle cx="390" cy="30" r="3.5" fill="#E2211C" />
              <text x="405" y="34" fontSize="11" fill="#334155" fontFamily="Helvetica Neue, sans-serif">Sample B</text>
            </svg>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">Everything you need, nothing you don't</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <div key={f.label} className="flex items-start gap-3 p-5 rounded-xl border border-slate-100 bg-slate-50">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{f.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 border-t border-slate-100 py-20">
        <div className="max-w-4xl mx-auto px-6">
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
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Try FigureReady now</h2>
        <p className="text-slate-500 text-sm mb-8">No account needed. Works in your browser.</p>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md"
        >
          Upload your first figure →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>FigureReady — free beta, 2026</span>
          <div className="flex items-center gap-5">
            <Link href="/roadmap" className="hover:text-slate-600 transition-colors">Roadmap</Link>
            <a href="mailto:zeggai_nouh@hotmail.fr" className="hover:text-slate-600 transition-colors">Contact</a>
            <Link href="/admin" className="hover:text-slate-600 transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
