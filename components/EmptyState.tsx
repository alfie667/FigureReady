interface Props {
  onUploadClick?: () => void
}

const BarChartThumb = () => (
  <svg viewBox="0 0 200 155" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <rect width="200" height="155" fill="white"/>
    <line x1="32" y1="15" x2="32" y2="120" stroke="#1a1a1a" strokeWidth="1.8"/>
    <line x1="32" y1="120" x2="188" y2="120" stroke="#1a1a1a" strokeWidth="1.8"/>
    <rect x="35" y="38" width="18" height="82" fill="#7c3aed" rx="2"/>
    <rect x="60" y="45" width="18" height="75" fill="#a78bfa" rx="2"/>
    <rect x="85" y="58" width="18" height="62" fill="#d01c8b" rx="2"/>
    <rect x="110" y="72" width="18" height="48" fill="#f1a340" rx="2"/>
    <rect x="135" y="88" width="18" height="32" fill="#4dac26" rx="2"/>
    <rect x="160" y="100" width="18" height="20" fill="#e66101" rx="2"/>
    <text x="110" y="142" textAnchor="middle" fontSize="9" fill="#333" fontFamily="Arial" fontWeight="bold">Drug concentration</text>
    <text x="14" y="72" textAnchor="middle" fontSize="9" fill="#333" fontFamily="Arial" fontWeight="bold" transform="rotate(-90,14,72)">Cell viability (%)</text>
  </svg>
)

const ScatterThumb = () => (
  <svg viewBox="0 0 200 155" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <rect width="200" height="155" fill="white"/>
    <line x1="38" y1="15" x2="38" y2="120" stroke="#1a1a1a" strokeWidth="1.8"/>
    <line x1="38" y1="120" x2="188" y2="120" stroke="#1a1a1a" strokeWidth="1.8"/>
    <line x1="42" y1="118" x2="185" y2="22" stroke="#aaa" strokeWidth="1" strokeDasharray="3,2"/>
    <circle cx="50" cy="112" r="4.5" fill="#7c3aed" stroke="white" strokeWidth="1.2"/>
    <circle cx="65" cy="102" r="4.5" fill="#7c3aed" stroke="white" strokeWidth="1.2"/>
    <circle cx="80" cy="91" r="4.5" fill="#7c3aed" stroke="white" strokeWidth="1.2"/>
    <circle cx="95" cy="80" r="4.5" fill="#d01c8b" stroke="white" strokeWidth="1.2"/>
    <circle cx="110" cy="70" r="4.5" fill="#d01c8b" stroke="white" strokeWidth="1.2"/>
    <circle cx="125" cy="58" r="4.5" fill="#d01c8b" stroke="white" strokeWidth="1.2"/>
    <circle cx="142" cy="48" r="4.5" fill="#4dac26" stroke="white" strokeWidth="1.2"/>
    <circle cx="158" cy="36" r="4.5" fill="#4dac26" stroke="white" strokeWidth="1.2"/>
    <circle cx="174" cy="26" r="4.5" fill="#4dac26" stroke="white" strokeWidth="1.2"/>
    <text x="113" y="142" textAnchor="middle" fontSize="9" fill="#333" fontFamily="Arial" fontWeight="bold">Concentration (mM)</text>
    <text x="14" y="72" textAnchor="middle" fontSize="9" fill="#333" fontFamily="Arial" fontWeight="bold" transform="rotate(-90,14,72)">Absorbance (a.u.)</text>
  </svg>
)

const LineThumb = () => (
  <svg viewBox="0 0 200 155" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <rect width="200" height="155" fill="white"/>
    <line x1="38" y1="15" x2="38" y2="120" stroke="#1a1a1a" strokeWidth="1.8"/>
    <line x1="38" y1="120" x2="188" y2="120" stroke="#1a1a1a" strokeWidth="1.8"/>
    <polyline points="42,108 78,88 114,65 150,45 185,25" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinejoin="round"/>
    <circle cx="42" cy="108" r="4" fill="#7c3aed" stroke="white" strokeWidth="1.2"/>
    <circle cx="78" cy="88" r="4" fill="#7c3aed" stroke="white" strokeWidth="1.2"/>
    <circle cx="114" cy="65" r="4" fill="#7c3aed" stroke="white" strokeWidth="1.2"/>
    <circle cx="150" cy="45" r="4" fill="#7c3aed" stroke="white" strokeWidth="1.2"/>
    <circle cx="185" cy="25" r="4" fill="#7c3aed" stroke="white" strokeWidth="1.2"/>
    <polyline points="42,115 78,102 114,88 150,75 185,62" fill="none" stroke="#d01c8b" strokeWidth="2" strokeLinejoin="round"/>
    <rect x="39" y="112" width="6" height="6" fill="#d01c8b" stroke="white" strokeWidth="1"/>
    <rect x="75" y="99" width="6" height="6" fill="#d01c8b" stroke="white" strokeWidth="1"/>
    <rect x="111" y="85" width="6" height="6" fill="#d01c8b" stroke="white" strokeWidth="1"/>
    <rect x="147" y="72" width="6" height="6" fill="#d01c8b" stroke="white" strokeWidth="1"/>
    <rect x="182" y="59" width="6" height="6" fill="#d01c8b" stroke="white" strokeWidth="1"/>
    <text x="113" y="142" textAnchor="middle" fontSize="9" fill="#333" fontFamily="Arial" fontWeight="bold">Time (h)</text>
    <text x="14" y="72" textAnchor="middle" fontSize="9" fill="#333" fontFamily="Arial" fontWeight="bold" transform="rotate(-90,14,72)">Expression (fold)</text>
  </svg>
)

const EXAMPLES = [
  { thumb: <BarChartThumb />, chart: 'Bar chart',    style: 'JACS style' },
  { thumb: <ScatterThumb />, chart: 'Scatter plot',  style: 'Nature style' },
  { thumb: <LineThumb />,    chart: 'Line graph',    style: 'ACS style' },
]

export default function EmptyState({ onUploadClick }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-10 px-6 py-12 text-center">

      {/* Icon hero */}
      <div className="flex flex-col items-center gap-5">
        <div className="w-20 h-20 rounded-3xl bg-[#ede9fe] flex items-center justify-center shadow-[0_8px_32px_rgba(124,58,237,0.18)]">
          <svg className="w-10 h-10 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 3v18h18M7 16l4-5 3 3 5-7" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            From Excel to publication-ready
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
            Upload a .xlsx file and get journal-formatted figures for Nature, ACS, JACS, and beyond — in seconds.
          </p>
        </div>
      </div>

      {/* CTA */}
      {onUploadClick && (
        <div className="flex flex-col items-center gap-2.5">
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2.5 px-8 py-3.5 bg-[#7c3aed] hover:bg-[#5b21b6] text-white text-sm font-bold rounded-2xl transition-all duration-200 shadow-lg shadow-[#7c3aed]/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload your Excel file
          </button>
          <p className="text-xs text-slate-400">.xlsx · no account required · free</p>
        </div>
      )}

      {/* Example gallery */}
      <div className="w-full grid grid-cols-3 gap-4">
        {EXAMPLES.map(ex => (
          <div key={ex.chart} className="flex flex-col gap-2.5 group">
            <div className="bg-white rounded-2xl p-3 shadow-[0_2px_16px_rgba(124,58,237,0.10)] group-hover:shadow-[0_4px_24px_rgba(124,58,237,0.18)] group-hover:-translate-y-1 transition-all duration-200">
              {ex.thumb}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-bold text-slate-700">{ex.chart}</p>
              <p className="text-[11px] text-slate-400">{ex.style}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
