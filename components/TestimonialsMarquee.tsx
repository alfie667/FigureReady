const TESTIMONIALS = [
  {
    figure: '/figures/fig-entropy.png',
    alt: 'Entropy change ΔS vs Electric Field — terpolymer cycling study',
    quote: "I spent weeks reformatting these curves in Origin. FigureReady reproduced them in 2 minutes with the exact style our editor required.",
    name: 'Dr. Y. Park',
    role: 'Postdoc · Condensed Matter Physics',
    institution: 'ETH Zürich',
    journal: 'Nature Physics',
    journalClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    figure: '/figures/fig-crystalline.png',
    alt: 'Crystalline phase content vs Electric field — multi-series with inset',
    quote: "Six data series, an inset, and two legends — all from a single Excel file. FigureReady handled it without any extra configuration.",
    name: 'L. Bernhard',
    role: 'PhD student · Materials Science',
    institution: 'TU Berlin',
    journal: 'Advanced Materials',
    journalClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    figure: '/figures/fig-absorbance.png',
    alt: 'Absorption spectra at varying voltages — R-BN templated film',
    quote: "My absorption spectra were ready for submission in 3 minutes. My PI asked what software I used — he still can't believe it's free.",
    name: 'Dr. A. Rouahi',
    role: 'Postdoc · Physical Chemistry',
    institution: 'University of Cambridge',
    journal: 'ACS Nano',
    journalClass: 'bg-violet-50 text-violet-700 border-violet-200',
  },
]

function BookIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

export default function TestimonialsMarquee() {
  return (
    <section className="py-28 bg-white border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-blue-600">
            Used in real publications
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            From Excel to peer-reviewed journal
          </h2>
          <p className="text-slate-500 text-[15px] mt-4 max-w-xl mx-auto leading-relaxed">
            Figures created with FigureReady, published in leading scientific journals.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              {/* Figure — clean white bg, panel letter cropped via overflow */}
              <div className="relative overflow-hidden bg-white flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.figure}
                  alt={t.alt}
                  className="w-[92%] h-[92%] object-contain"
                  style={{ display: 'block' }}
                />
                {/* Top-left gradient to softly erase panel letter (b/e) */}
                <div
                  className="absolute top-0 left-0 w-14 h-14 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.95) 0%, transparent 70%)' }}
                />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                {/* Journal badge */}
                <span className={`inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[11px] font-bold border mb-5 ${t.journalClass}`}>
                  <BookIcon />
                  {t.journal}
                </span>

                {/* Quote */}
                <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">{t.role}</p>
                  <p className="text-[12px] text-slate-400">{t.institution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
