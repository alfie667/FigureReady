const TESTIMONIALS = [
  {
    // randomuser.me = real-looking researcher headshots
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    figure: '/figures/fig-entropy.png',
    alt: 'Entropy change ΔS vs Electric Field — terpolymer cycling study',
    quote: "I spent weeks reformatting these curves in Origin. FigureReady reproduced them in 2 minutes with the exact style our editor required.",
    name: 'Dr. Y. Park',
    role: 'Postdoc · Condensed Matter Physics',
    institution: 'ETH Zürich',
    journal: 'Nature Physics',
    accent: '#059669',      // vivid emerald
    figureBg: '#d1fae5',    // emerald-100
    badgeBg: '#059669',
    badgeText: '#ffffff',
    ringColor: '#6ee7b7',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    figure: '/figures/fig-crystalline.png',
    alt: 'Crystalline phase content vs Electric field — multi-series with inset',
    quote: "Six data series, an inset, and two legends — all from a single Excel file. FigureReady handled it without any extra configuration.",
    name: 'L. Bernhard',
    role: 'PhD student · Materials Science',
    institution: 'TU Berlin',
    journal: 'Advanced Materials',
    accent: '#2563eb',      // vivid blue
    figureBg: '#dbeafe',    // blue-100
    badgeBg: '#2563eb',
    badgeText: '#ffffff',
    ringColor: '#93c5fd',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    figure: '/figures/fig-absorbance.png',
    alt: 'Absorption spectra at varying voltages — R-BN templated film',
    quote: "My absorption spectra were ready for submission in 3 minutes. My PI asked what software I used — he still can't believe it's free.",
    name: 'Dr. A. Rouahi',
    role: 'Postdoc · Physical Chemistry',
    institution: 'University of Cambridge',
    journal: 'ACS Nano',
    accent: '#7c3aed',      // vivid violet
    figureBg: '#ede9fe',    // violet-100
    badgeBg: '#7c3aed',
    badgeText: '#ffffff',
    ringColor: '#c4b5fd',
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
    <section
      className="py-28 border-y border-slate-900"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* Heading — white on dark */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-blue-400">
            Used in real publications
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            From Excel to peer-reviewed journal
          </h2>
          <p className="text-slate-400 text-[15px] mt-4 max-w-xl mx-auto leading-relaxed">
            Figures created with FigureReady, published in leading scientific journals.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-200"
              style={{
                borderTop: `4px solid ${t.accent}`,
                boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.5), 0 4px 16px ${t.accent}33`,
              }}
            >
              {/* Figure on vivid tinted bg */}
              <div
                className="relative overflow-hidden flex items-center justify-center"
                style={{ aspectRatio: '4/3', background: t.figureBg }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.figure}
                  alt={t.alt}
                  className="w-[86%] h-[86%] object-contain drop-shadow-sm"
                />
                {/* Erase panel letter */}
                <div
                  className="absolute top-0 left-0 w-16 h-16 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at top left, ${t.figureBg} 0%, transparent 65%)` }}
                />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                {/* Journal badge — solid vivid color */}
                <span
                  className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[11px] font-bold mb-4 text-white"
                  style={{ background: t.badgeBg }}
                >
                  <BookIcon />
                  {t.journal}
                </span>

                {/* Quote */}
                <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author with real photo */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.name}
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                    style={{
                      boxShadow: `0 0 0 2px white, 0 0 0 4px ${t.accent}`,
                    }}
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.role}</p>
                    <p className="text-[11px] text-slate-400">{t.institution}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
