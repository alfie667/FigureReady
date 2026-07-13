interface Props {
  onUploadClick?: () => void
}

const BarChartThumb = () => (
  <svg viewBox="0 0 150 90" className="w-full h-auto" fill="none">
    <line x1="20" y1="8" x2="20" y2="75" stroke="#cbd5e1" strokeWidth="1.5"/>
    <line x1="20" y1="75" x2="143" y2="75" stroke="#cbd5e1" strokeWidth="1.5"/>
    <line x1="17" y1="22" x2="20" y2="22" stroke="#cbd5e1" strokeWidth="1"/>
    <line x1="17" y1="38" x2="20" y2="38" stroke="#cbd5e1" strokeWidth="1"/>
    <line x1="17" y1="54" x2="20" y2="54" stroke="#cbd5e1" strokeWidth="1"/>
    <line x1="17" y1="70" x2="20" y2="70" stroke="#cbd5e1" strokeWidth="1"/>
    <rect x="27" y="30" width="22" height="45" fill="#1e3a5f"/>
    <rect x="57" y="48" width="22" height="27" fill="#1e3a5f"/>
    <rect x="87" y="18" width="22" height="57" fill="#1e3a5f"/>
    <rect x="117" y="40" width="22" height="35" fill="#1e3a5f"/>
  </svg>
)

const ScatterThumb = () => (
  <svg viewBox="0 0 150 90" className="w-full h-auto" fill="none">
    <line x1="20" y1="8" x2="20" y2="75" stroke="#cbd5e1" strokeWidth="1.5"/>
    <line x1="20" y1="75" x2="143" y2="75" stroke="#cbd5e1" strokeWidth="1.5"/>
    <line x1="25" y1="72" x2="140" y2="14" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 2"/>
    <circle cx="30" cy="66" r="3.5" fill="#1f2937"/>
    <circle cx="44" cy="70" r="3.5" fill="#1f2937"/>
    <circle cx="56" cy="60" r="3.5" fill="#1f2937"/>
    <circle cx="68" cy="52" r="3.5" fill="#1f2937"/>
    <circle cx="80" cy="55" r="3.5" fill="#1f2937"/>
    <circle cx="90" cy="42" r="3.5" fill="#1f2937"/>
    <circle cx="102" cy="36" r="3.5" fill="#1f2937"/>
    <circle cx="114" cy="26" r="3.5" fill="#1f2937"/>
    <circle cx="124" cy="22" r="3.5" fill="#1f2937"/>
    <circle cx="136" cy="16" r="3.5" fill="#1f2937"/>
  </svg>
)

const LineThumb = () => (
  <svg viewBox="0 0 150 90" className="w-full h-auto" fill="none">
    <line x1="20" y1="8" x2="20" y2="75" stroke="#cbd5e1" strokeWidth="1.5"/>
    <line x1="20" y1="75" x2="143" y2="75" stroke="#cbd5e1" strokeWidth="1.5"/>
    <polyline
      points="28,66 50,54 70,44 90,50 110,30 125,22 140,26"
      stroke="#0f766e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
    />
    <circle cx="28" cy="66" r="3.5" fill="white" stroke="#0f766e" strokeWidth="2"/>
    <circle cx="50" cy="54" r="3.5" fill="white" stroke="#0f766e" strokeWidth="2"/>
    <circle cx="70" cy="44" r="3.5" fill="white" stroke="#0f766e" strokeWidth="2"/>
    <circle cx="90" cy="50" r="3.5" fill="white" stroke="#0f766e" strokeWidth="2"/>
    <circle cx="110" cy="30" r="3.5" fill="white" stroke="#0f766e" strokeWidth="2"/>
    <circle cx="125" cy="22" r="3.5" fill="white" stroke="#0f766e" strokeWidth="2"/>
    <circle cx="140" cy="26" r="3.5" fill="white" stroke="#0f766e" strokeWidth="2"/>
  </svg>
)

const EXAMPLES = [
  { thumb: <BarChartThumb />, chart: 'Bar chart', style: 'JACS style' },
  { thumb: <ScatterThumb />, chart: 'Scatter plot', style: 'Nature style' },
  { thumb: <LineThumb />,    chart: 'Line graph',   style: 'ACS style' },
]

export default function EmptyState({ onUploadClick }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 px-6 py-8 text-center">
      {/* Hero */}
      <div className="flex flex-col gap-2.5">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          From Excel to publication-ready in seconds
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
          Upload a .xlsx file to generate journal-formatted figures for Nature, ACS, JACS, and beyond.
        </p>
      </div>

      {/* Example gallery */}
      <div className="w-full grid grid-cols-3 gap-4">
        {EXAMPLES.map(ex => (
          <div key={ex.chart} className="flex flex-col gap-2">
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
              {ex.thumb}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-semibold text-slate-700">{ex.chart}</p>
              <p className="text-[11px] text-slate-400">{ex.style}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {onUploadClick && (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload Excel file
          </button>
          <p className="text-xs text-slate-400">.xlsx · no account required</p>
        </div>
      )}
    </div>
  )
}
