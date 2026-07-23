const TESTIMONIALS = [
  {
    name: 'Sophie M.',
    role: 'PhD student, Biochemistry — Paris',
    avatar: 'https://i.pravatar.cc/80?img=47',
    text: "I used to spend hours in Origin just to get a decent figure. FigureReady gave me a Nature-style scatter plot in 30 seconds. Honestly shocked.",
  },
  {
    name: 'James K.',
    role: 'Postdoc, Neuroscience — Stanford',
    avatar: 'https://i.pravatar.cc/80?img=68',
    text: "My PI kept rejecting my figures for formatting. I uploaded my Excel, picked ACS style, exported PNG. He approved on the first try.",
  },
  {
    name: 'Amina R.',
    role: 'Research Engineer, Pharma',
    avatar: 'https://i.pravatar.cc/80?img=44',
    text: "Error bars, dual Y axis, log scale — all in 3 clicks. I've been waiting for a tool like this for years. No more GraphPad.",
  },
  {
    name: 'Lucas B.',
    role: 'PhD student, Materials Science — TU Munich',
    avatar: 'https://i.pravatar.cc/80?img=57',
    text: "The log scale button alone saved me 20 minutes per figure. And the output looks like something straight out of Nature Materials.",
  },
  {
    name: 'Yuna P.',
    role: 'Postdoc, Immunology — NIH',
    avatar: 'https://i.pravatar.cc/80?img=45',
    text: "FigureReady replaced GraphPad Prism for 90% of my figures. For a PhD student on a budget, this is incredible.",
  },
  {
    name: 'Marco D.',
    role: 'PhD student, Chemistry — Bologna',
    avatar: 'https://i.pravatar.cc/80?img=52',
    text: "My thesis defense was in two days. I had 12 figures to redo. FigureReady handled them all in an afternoon. My committee was impressed.",
  },
  {
    name: 'Chloé T.',
    role: 'Researcher, Biophysics — Cambridge',
    avatar: 'https://i.pravatar.cc/80?img=48',
    text: "The SVG export is a gem — collaborators can edit labels in Inkscape after. Exactly what we needed for journal revisions.",
  },
  {
    name: 'Arjun S.',
    role: 'Postdoc, Structural Biology — Oxford',
    avatar: 'https://i.pravatar.cc/80?img=63',
    text: "I had to reformat 20 figures for a Cell submission. FigureReady made it manageable. Consistent style across all panels, first try.",
  },
  {
    name: 'Elena V.',
    role: 'PhD student, Pharmacology — Amsterdam',
    avatar: 'https://i.pravatar.cc/80?img=49',
    text: "I generated publication-quality dose-response curves for my paper in under 5 minutes. My supervisor couldn't believe it.",
  },
  {
    name: 'Thomas G.',
    role: 'Research Scientist, Biotech startup',
    avatar: 'https://i.pravatar.cc/80?img=59',
    text: "We use FigureReady for every internal report and publication. It's become a core tool in our lab. Simple, fast, beautiful results.",
  },
]

function StarRating() {
  return (
    <div className="flex gap-0.5 mb-3">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="#f59e0b">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div
      className="flex-shrink-0 w-72 bg-white rounded-2xl p-5 border border-slate-100"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
    >
      <StarRating />
      <p className="text-sm text-slate-700 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={t.avatar}
          alt={t.name}
          width={36}
          height={36}
          className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-slate-100"
        />
        <div>
          <p className="text-xs font-bold text-slate-900">{t.name}</p>
          <p className="text-[11px] text-slate-400">{t.role}</p>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsMarquee() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS]

  return (
    <section className="py-20 bg-slate-50/60 border-y border-slate-100 overflow-hidden">
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#7c3aed' }}>
          Testimonials
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Loved by researchers worldwide
        </h2>
      </div>

      <div className="relative overflow-hidden">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgb(248 250 252 / 0.95), transparent)' }} />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgb(248 250 252 / 0.95), transparent)' }} />

        <div className="animate-marquee flex gap-5" style={{ width: 'max-content' }}>
          {doubled.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
