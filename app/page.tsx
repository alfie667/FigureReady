import Link from 'next/link'
import BetaSignupForm from '@/components/BetaSignupForm'
import GatedAppLink from '@/components/GatedAppLink'
import SampleDataButton from '@/components/SampleDataButton'

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

const tableRows = [
  ['0', '0.12', '0.06'],
  ['1', '0.31', '0.14'],
  ['2', '0.48', '0.25'],
  ['3', '0.69', '0.38'],
  ['4', '0.86', '0.47'],
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-900 font-sans antialiased">
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
            <Link href="/pricing" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">Pricing</Link>
            <Link href="/roadmap" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">Roadmap</Link>
            <GatedAppLink className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              Try it free
            </GatedAppLink>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-medium text-blue-700">Free beta — no account needed</span>
        </div>

        <h1
          className="font-extrabold text-slate-900 leading-tight mb-4"
          style={{ fontSize: '56px', letterSpacing: '-0.03em' }}
        >
          From Excel to publication-ready<br className="hidden sm:block" /> figure in seconds
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          No Origin. No Prism. Upload your data and get a clean, journal-quality graphic ready to export.
        </p>

        {/* Email capture */}
        <div className="mb-10">
          <p className="text-sm text-slate-500 mb-3">Join 50+ researchers in beta</p>
          <BetaSignupForm />
        </div>

        {/* Excel → Figure transformation */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-5 mb-10">

          {/* Excel mock */}
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-lg w-full max-w-[268px] text-left shrink-0">
            <div className="bg-[#1D6F42] px-3 py-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 1.5L18.5 9H13zM8.5 17l2-3-2-3h1.6l1.2 2 1.2-2H14l-2 3 2 3h-1.6l-1.2-2-1.2 2z"/>
              </svg>
              <span className="text-white text-xs font-semibold">data.xlsx</span>
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-3 py-2 text-left font-semibold text-slate-500 border-r border-slate-200">Conc. (mM)</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500 border-r border-slate-200">Sample A</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">Sample B</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(([c, a, b], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="px-3 py-1.5 border-r border-slate-100 text-slate-600">{c}</td>
                    <td className="px-3 py-1.5 border-r border-slate-100 text-right font-mono text-slate-700">{a}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-slate-700">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-md rotate-90 lg:rotate-0 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">FigureReady</span>
          </div>

          {/* Publication-ready figure */}
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-lg bg-white w-full max-w-sm shrink-0">
            <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Publication-ready figure</span>
            </div>
            <div className="p-4 bg-white">
              {/* ACS / OriginLab style — full box, inward ticks, no grid, mixed markers */}
              <svg viewBox="0 0 480 308" className="w-full" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>

                {/* Plot box */}
                <rect x="65" y="20" width="380" height="240" fill="none" stroke="#111" strokeWidth="1.5" />

                {/* X ticks bottom (inward) + top mirror */}
                {[0,1,2,3,4].map(i => (
                  <g key={i}>
                    <line x1={65+i*95} y1={260} x2={65+i*95} y2={253} stroke="#111" strokeWidth="1.5" />
                    <line x1={65+i*95} y1={20}  x2={65+i*95} y2={27}  stroke="#111" strokeWidth="1.5" />
                  </g>
                ))}

                {/* Y ticks left (inward) + right mirror */}
                {[0,1,2,3,4].map(i => (
                  <g key={i}>
                    <line x1={65}  y1={260-i*60} x2={72}  y2={260-i*60} stroke="#111" strokeWidth="1.5" />
                    <line x1={445} y1={260-i*60} x2={438} y2={260-i*60} stroke="#111" strokeWidth="1.5" />
                  </g>
                ))}

                {/* X tick labels */}
                {[0,1,2,3,4].map((v,i) => (
                  <text key={v} x={65+i*95} y={277} textAnchor="middle" fontSize="11" fill="#1a1a1a">{v}</text>
                ))}

                {/* Y tick labels */}
                {[0,0.25,0.50,0.75,1.00].map((v,i) => (
                  <text key={v} x={57} y={260-i*60+4} textAnchor="end" fontSize="11" fill="#1a1a1a">{v.toFixed(2)}</text>
                ))}

                {/* Axis titles */}
                <text x={255} y={297} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a">Concentration (mM)</text>
                <text x={14} y={140} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a" transform="rotate(-90 14 140)">Absorbance (a.u.)</text>

                {/* Sample A error bars (black) — data: 0.12, 0.31, 0.48, 0.69, 0.86 */}
                {([[65,231,7],[160,186,10],[255,145,10],[350,94,12],[445,54,10]] as [number,number,number][]).map(([x,y,e],i) => (
                  <g key={i} stroke="#111" strokeWidth="1.1">
                    <line x1={x} y1={y-e} x2={x} y2={y+e} />
                    <line x1={x-4} y1={y-e} x2={x+4} y2={y-e} />
                    <line x1={x-4} y1={y+e} x2={x+4} y2={y+e} />
                  </g>
                ))}

                {/* Sample B error bars (red) — data: 0.06, 0.14, 0.25, 0.38, 0.47 */}
                {([[65,246,5],[160,226,7],[255,200,7],[350,169,7],[445,147,10]] as [number,number,number][]).map(([x,y,e],i) => (
                  <g key={i} stroke="#c0392b" strokeWidth="1.1">
                    <line x1={x} y1={y-e} x2={x} y2={y+e} />
                    <line x1={x-4} y1={y-e} x2={x+4} y2={y-e} />
                    <line x1={x-4} y1={y+e} x2={x+4} y2={y+e} />
                  </g>
                ))}

                {/* Sample A line */}
                <polyline points="65,231 160,186 255,145 350,94 445,54" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

                {/* Sample B line */}
                <polyline points="65,246 160,226 255,200 350,169 445,147" fill="none" stroke="#c0392b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

                {/* Sample A markers: filled circles */}
                {[[65,231],[160,186],[255,145],[350,94],[445,54]].map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r="5" fill="#111" />
                ))}

                {/* Sample B markers: filled squares */}
                {[[65,246],[160,226],[255,200],[350,169],[445,147]].map(([x,y],i) => (
                  <rect key={i} x={x-4.5} y={y-4.5} width="9" height="9" fill="#c0392b" />
                ))}

                {/* Legend */}
                <rect x="73" y="28" width="132" height="52" fill="white" stroke="#d1d5db" strokeWidth="0.8" rx="2" />
                <line x1="81" y1="46" x2="103" y2="46" stroke="#111" strokeWidth="1.8" />
                <circle cx="92" cy="46" r="4.5" fill="#111" />
                <text x="109" y="50" fontSize="11" fill="#1a1a1a">Sample A</text>
                <line x1="81" y1="68" x2="103" y2="68" stroke="#c0392b" strokeWidth="1.8" />
                <rect x="87.5" y="63.5" width="9" height="9" fill="#c0392b" />
                <text x="109" y="72" fontSize="11" fill="#1a1a1a">Sample B</text>
              </svg>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <GatedAppLink className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-colors shadow-md">
            Start for free →
          </GatedAppLink>
          <SampleDataButton className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700 text-base font-semibold rounded-xl transition-colors cursor-pointer" />
        </div>
        <p className="text-xs text-slate-400 mt-3">↑ Downloads a ready-to-use .xlsx file — open it in the app to see it become a figure</p>

      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <p className="text-center mb-3" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2563eb' }}>Features</p>
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">Everything you need, nothing you don&apos;t</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <div key={f.label} className="flex items-start gap-3 bg-white" style={{ border: '1px solid #e4e7ec', borderRadius: '12px', padding: '24px' }}>
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
      <section className="bg-white border-t border-[#e4e7ec] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center mb-3" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2563eb' }}>How it works</p>
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

      {/* Pricing */}
      <section className="bg-white border-t border-[#e4e7ec] py-20" id="pricing">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center mb-3" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2563eb' }}>Pricing</p>
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-3">Simple, transparent pricing</h2>
          <p className="text-center text-slate-500 text-sm mb-12">Start free. Upgrade when you need more.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="border border-slate-200 rounded-2xl p-7 flex flex-col">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Free</p>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-extrabold text-slate-900">0€</span>
                <span className="text-slate-400 text-sm mb-1.5">/month</span>
              </div>
              <ul className="space-y-2 flex-1 mb-6 text-sm text-slate-600">
                {['3 figures per month', 'Excel upload (.xlsx)', 'PNG & SVG export', 'ACS / Nature styles'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <GatedAppLink className="block text-center py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors w-full">
                Get started free
              </GatedAppLink>
            </div>

            {/* Pro Monthly */}
            <div className="bg-blue-600 rounded-2xl p-7 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wide whitespace-nowrap">
                Most popular
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">Pro Monthly</p>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-extrabold text-white">12€</span>
                <span className="text-blue-200 text-sm mb-1.5">/month</span>
              </div>
              <ul className="space-y-2 flex-1 mb-6 text-sm text-white">
                {['Unlimited figures', 'Excel upload (.xlsx)', 'PNG & SVG export (3×)', 'Error bars', 'Style customization', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="block text-center py-2.5 px-4 bg-white rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                Subscribe monthly →
              </Link>
            </div>

            {/* Pro Yearly */}
            <div className="border border-slate-200 rounded-2xl p-7 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wide whitespace-nowrap">
                Save 31%
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Pro Yearly</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold text-slate-900">99€</span>
                <span className="text-slate-400 text-sm mb-1.5">/year</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">~8.25€/month</p>
              <ul className="space-y-2 flex-1 mb-6 text-sm text-slate-600">
                {['Unlimited figures', 'Excel upload (.xlsx)', 'PNG & SVG export (3×)', 'Error bars', 'Style customization', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="block text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
                Subscribe yearly →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Try FigureReady now</h2>
        <p className="text-slate-500 text-sm mb-8">No account needed. Works in your browser.</p>
        <GatedAppLink className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md">
          Upload your first figure →
        </GatedAppLink>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>FigureReady — free beta, 2026</span>
          <div className="flex items-center gap-5">
            <Link href="/pricing" className="hover:text-slate-600 transition-colors">Pricing</Link>
            <Link href="/roadmap" className="hover:text-slate-600 transition-colors">Roadmap</Link>
            <Link href="/graphpad-alternative" className="hover:text-slate-600 transition-colors">Free GraphPad Prism Alternative</Link>
            <a href="mailto:zeggai_nouh@hotmail.fr" className="hover:text-slate-600 transition-colors">Contact</a>
            <Link href="/admin" className="hover:text-slate-600 transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
