interface Props {
  onUploadClick?: () => void
}

const BarChartThumb = () => (
  <svg viewBox="0 0 200 155" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <rect width="200" height="155" fill="white"/>
    <line x1="32" y1="15" x2="32" y2="120" stroke="#1a1a1a" strokeWidth="1.8"/>
    <line x1="32" y1="120" x2="188" y2="120" stroke="#1a1a1a" strokeWidth="1.8"/>
    <line x1="44" y1="120" x2="44" y2="117" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="69" y1="120" x2="69" y2="117" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="94" y1="120" x2="94" y2="117" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="119" y1="120" x2="119" y2="117" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="144" y1="120" x2="144" y2="117" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="169" y1="120" x2="169" y2="117" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="32" y1="95" x2="35" y2="95" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="32" y1="70" x2="35" y2="70" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="32" y1="45" x2="35" y2="45" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="32" y1="20" x2="35" y2="20" stroke="#1a1a1a" strokeWidth="1.2"/>
    <text x="44" y="128" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial">ctrl</text>
    <text x="69" y="128" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial">1 μM</text>
    <text x="94" y="128" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial">5 μM</text>
    <text x="119" y="128" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial">10 μM</text>
    <text x="144" y="128" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial">25 μM</text>
    <text x="169" y="128" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial">50 μM</text>
    <text x="28" y="98" textAnchor="end" fontSize="7" fill="#555" fontFamily="Arial">25</text>
    <text x="28" y="73" textAnchor="end" fontSize="7" fill="#555" fontFamily="Arial">50</text>
    <text x="28" y="48" textAnchor="end" fontSize="7" fill="#555" fontFamily="Arial">75</text>
    <text x="28" y="23" textAnchor="end" fontSize="7" fill="#555" fontFamily="Arial">100</text>
    <rect x="35" y="38" width="18" height="82" fill="#1D6F42" rx="1"/>
    <line x1="44" y1="38" x2="44" y2="28" stroke="#1D6F42" strokeWidth="1.5"/>
    <line x1="40" y1="28" x2="48" y2="28" stroke="#1D6F42" strokeWidth="1.5"/>
    <line x1="40" y1="38" x2="48" y2="38" stroke="#1D6F42" strokeWidth="1.5"/>
    <rect x="60" y="45" width="18" height="75" fill="#4dac26" rx="1"/>
    <line x1="69" y1="45" x2="69" y2="35" stroke="#4dac26" strokeWidth="1.5"/>
    <line x1="65" y1="35" x2="73" y2="35" stroke="#4dac26" strokeWidth="1.5"/>
    <line x1="65" y1="45" x2="73" y2="45" stroke="#4dac26" strokeWidth="1.5"/>
    <rect x="85" y="58" width="18" height="62" fill="#d01c8b" rx="1"/>
    <line x1="94" y1="58" x2="94" y2="48" stroke="#d01c8b" strokeWidth="1.5"/>
    <line x1="90" y1="48" x2="98" y2="48" stroke="#d01c8b" strokeWidth="1.5"/>
    <line x1="90" y1="58" x2="98" y2="58" stroke="#d01c8b" strokeWidth="1.5"/>
    <rect x="110" y="72" width="18" height="48" fill="#f1a340" rx="1"/>
    <line x1="119" y1="72" x2="119" y2="62" stroke="#f1a340" strokeWidth="1.5"/>
    <line x1="115" y1="62" x2="123" y2="62" stroke="#f1a340" strokeWidth="1.5"/>
    <line x1="115" y1="72" x2="123" y2="72" stroke="#f1a340" strokeWidth="1.5"/>
    <rect x="135" y="88" width="18" height="32" fill="#998ec3" rx="1"/>
    <line x1="144" y1="88" x2="144" y2="78" stroke="#998ec3" strokeWidth="1.5"/>
    <line x1="140" y1="78" x2="148" y2="78" stroke="#998ec3" strokeWidth="1.5"/>
    <line x1="140" y1="88" x2="148" y2="88" stroke="#998ec3" strokeWidth="1.5"/>
    <rect x="160" y="100" width="18" height="20" fill="#e66101" rx="1"/>
    <line x1="169" y1="100" x2="169" y2="90" stroke="#e66101" strokeWidth="1.5"/>
    <line x1="165" y1="90" x2="173" y2="90" stroke="#e66101" strokeWidth="1.5"/>
    <line x1="165" y1="100" x2="173" y2="100" stroke="#e66101" strokeWidth="1.5"/>
    <text x="110" y="142" textAnchor="middle" fontSize="9" fill="#333" fontFamily="Arial" fontWeight="bold">Drug concentration</text>
    <text x="14" y="72" textAnchor="middle" fontSize="9" fill="#333" fontFamily="Arial" fontWeight="bold" transform="rotate(-90,14,72)">Cell viability (%)</text>
  </svg>
)

const ScatterThumb = () => (
  <svg viewBox="0 0 200 155" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <rect width="200" height="155" fill="white"/>
    <line x1="38" y1="15" x2="38" y2="120" stroke="#1a1a1a" strokeWidth="1.8"/>
    <line x1="38" y1="120" x2="188" y2="120" stroke="#1a1a1a" strokeWidth="1.8"/>
    <line x1="58" y1="120" x2="58" y2="117" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="98" y1="120" x2="98" y2="117" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="138" y1="120" x2="138" y2="117" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="178" y1="120" x2="178" y2="117" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="38" y1="95" x2="41" y2="95" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="38" y1="70" x2="41" y2="70" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="38" y1="45" x2="41" y2="45" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="38" y1="20" x2="41" y2="20" stroke="#1a1a1a" strokeWidth="1.2"/>
    <text x="58" y="128" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial">1</text>
    <text x="98" y="128" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial">2</text>
    <text x="138" y="128" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial">3</text>
    <text x="178" y="128" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial">4</text>
    <text x="34" y="98" textAnchor="end" fontSize="7" fill="#555" fontFamily="Arial">0.2</text>
    <text x="34" y="73" textAnchor="end" fontSize="7" fill="#555" fontFamily="Arial">0.4</text>
    <text x="34" y="48" textAnchor="end" fontSize="7" fill="#555" fontFamily="Arial">0.6</text>
    <text x="34" y="23" textAnchor="end" fontSize="7" fill="#555" fontFamily="Arial">0.8</text>
    <line x1="42" y1="118" x2="185" y2="22" stroke="#aaa" strokeWidth="1" strokeDasharray="3,2"/>
    <circle cx="50" cy="112" r="4.5" fill="#1D6F42" stroke="white" strokeWidth="1.2"/>
    <circle cx="65" cy="102" r="4.5" fill="#1D6F42" stroke="white" strokeWidth="1.2"/>
    <circle cx="80" cy="91" r="4.5" fill="#1D6F42" stroke="white" strokeWidth="1.2"/>
    <circle cx="95" cy="80" r="4.5" fill="#d01c8b" stroke="white" strokeWidth="1.2"/>
    <circle cx="110" cy="70" r="4.5" fill="#d01c8b" stroke="white" strokeWidth="1.2"/>
    <circle cx="125" cy="58" r="4.5" fill="#d01c8b" stroke="white" strokeWidth="1.2"/>
    <circle cx="142" cy="48" r="4.5" fill="#4dac26" stroke="white" strokeWidth="1.2"/>
    <circle cx="158" cy="36" r="4.5" fill="#4dac26" stroke="white" strokeWidth="1.2"/>
    <circle cx="174" cy="26" r="4.5" fill="#4dac26" stroke="white" strokeWidth="1.2"/>
    <rect x="39" y="18" width="88" height="42" fill="white" stroke="#ddd" strokeWidth="0.8" rx="3"/>
    <circle cx="48" cy="28" r="3.5" fill="#1D6F42"/>
    <text x="54" y="31" fontSize="7.5" fill="#333" fontFamily="Arial">Group A</text>
    <circle cx="48" cy="38" r="3.5" fill="#d01c8b"/>
    <text x="54" y="41" fontSize="7.5" fill="#333" fontFamily="Arial">Group B</text>
    <circle cx="48" cy="48" r="3.5" fill="#4dac26"/>
    <text x="54" y="51" fontSize="7.5" fill="#333" fontFamily="Arial">Group C</text>
    <text x="148" y="108" fontSize="8" fill="#333" fontFamily="Arial" fontStyle="italic">R² = 0.97</text>
    <text x="113" y="142" textAnchor="middle" fontSize="9" fill="#333" fontFamily="Arial" fontWeight="bold">Concentration (mM)</text>
    <text x="14" y="72" textAnchor="middle" fontSize="9" fill="#333" fontFamily="Arial" fontWeight="bold" transform="rotate(-90,14,72)">Absorbance (a.u.)</text>
  </svg>
)

const LineThumb = () => (
  <svg viewBox="0 0 200 155" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <rect width="200" height="155" fill="white"/>
    <line x1="38" y1="15" x2="38" y2="120" stroke="#1a1a1a" strokeWidth="1.8"/>
    <line x1="38" y1="120" x2="188" y2="120" stroke="#1a1a1a" strokeWidth="1.8"/>
    <line x1="58" y1="120" x2="58" y2="117" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="98" y1="120" x2="98" y2="117" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="138" y1="120" x2="138" y2="117" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="178" y1="120" x2="178" y2="117" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="38" y1="95" x2="41" y2="95" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="38" y1="70" x2="41" y2="70" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="38" y1="45" x2="41" y2="45" stroke="#1a1a1a" strokeWidth="1.2"/>
    <line x1="38" y1="20" x2="41" y2="20" stroke="#1a1a1a" strokeWidth="1.2"/>
    <text x="58" y="128" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial">0</text>
    <text x="98" y="128" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial">6</text>
    <text x="138" y="128" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial">12</text>
    <text x="178" y="128" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial">24</text>
    <text x="34" y="98" textAnchor="end" fontSize="7" fill="#555" fontFamily="Arial">1</text>
    <text x="34" y="73" textAnchor="end" fontSize="7" fill="#555" fontFamily="Arial">2</text>
    <text x="34" y="48" textAnchor="end" fontSize="7" fill="#555" fontFamily="Arial">3</text>
    <text x="34" y="23" textAnchor="end" fontSize="7" fill="#555" fontFamily="Arial">4</text>
    <polyline points="42,108 78,88 114,65 150,45 185,25" fill="none" stroke="#1D6F42" strokeWidth="2" strokeLinejoin="round"/>
    <circle cx="42" cy="108" r="4" fill="#1D6F42" stroke="white" strokeWidth="1.2"/>
    <circle cx="78" cy="88" r="4" fill="#1D6F42" stroke="white" strokeWidth="1.2"/>
    <circle cx="114" cy="65" r="4" fill="#1D6F42" stroke="white" strokeWidth="1.2"/>
    <circle cx="150" cy="45" r="4" fill="#1D6F42" stroke="white" strokeWidth="1.2"/>
    <circle cx="185" cy="25" r="4" fill="#1D6F42" stroke="white" strokeWidth="1.2"/>
    <polyline points="42,115 78,102 114,88 150,75 185,62" fill="none" stroke="#d01c8b" strokeWidth="2" strokeLinejoin="round"/>
    <rect x="39" y="112" width="6" height="6" fill="#d01c8b" stroke="white" strokeWidth="1"/>
    <rect x="75" y="99" width="6" height="6" fill="#d01c8b" stroke="white" strokeWidth="1"/>
    <rect x="111" y="85" width="6" height="6" fill="#d01c8b" stroke="white" strokeWidth="1"/>
    <rect x="147" y="72" width="6" height="6" fill="#d01c8b" stroke="white" strokeWidth="1"/>
    <rect x="182" y="59" width="6" height="6" fill="#d01c8b" stroke="white" strokeWidth="1"/>
    <polyline points="42,118 78,112 114,104 150,96 185,86" fill="none" stroke="#4dac26" strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,2"/>
    <polygon points="42,122 46,114 38,114" fill="#4dac26" stroke="white" strokeWidth="1"/>
    <polygon points="78,116 82,108 74,108" fill="#4dac26" stroke="white" strokeWidth="1"/>
    <polygon points="114,108 118,100 110,100" fill="#4dac26" stroke="white" strokeWidth="1"/>
    <polygon points="150,100 154,92 146,92" fill="#4dac26" stroke="white" strokeWidth="1"/>
    <polygon points="185,90 189,82 181,82" fill="#4dac26" stroke="white" strokeWidth="1"/>
    <rect x="39" y="18" width="88" height="44" fill="white" stroke="#ddd" strokeWidth="0.8" rx="3"/>
    <line x1="44" y1="28" x2="58" y2="28" stroke="#1D6F42" strokeWidth="1.8"/>
    <circle cx="51" cy="28" r="3" fill="#1D6F42" stroke="white" strokeWidth="1"/>
    <text x="61" y="31" fontSize="7.5" fill="#333" fontFamily="Arial">WT</text>
    <line x1="44" y1="38" x2="58" y2="38" stroke="#d01c8b" strokeWidth="1.8"/>
    <rect x="48" y="35" width="6" height="6" fill="#d01c8b" stroke="white" strokeWidth="1"/>
    <text x="61" y="41" fontSize="7.5" fill="#333" fontFamily="Arial">KO</text>
    <line x1="44" y1="50" x2="58" y2="50" stroke="#4dac26" strokeWidth="1.8" strokeDasharray="4,2"/>
    <polygon points="51,54 55,46 47,46" fill="#4dac26" stroke="white" strokeWidth="1"/>
    <text x="61" y="53" fontSize="7.5" fill="#333" fontFamily="Arial">Rescue</text>
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
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
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
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1D6F42] hover:bg-[#155d35] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
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
