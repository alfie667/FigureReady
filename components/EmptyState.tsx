interface Props {
  onUploadClick?: () => void
}

// ── Thumbnail: Bar chart with error bars + grid ────────────────────────────
const BarChartThumb = () => (
  <svg viewBox="0 0 150 90" className="w-full h-auto">
    {/* Subtle grid */}
    <line x1="20" y1="25" x2="143" y2="25" stroke="#e2e8f0" strokeWidth="0.8"/>
    <line x1="20" y1="42" x2="143" y2="42" stroke="#e2e8f0" strokeWidth="0.8"/>
    <line x1="20" y1="58" x2="143" y2="58" stroke="#e2e8f0" strokeWidth="0.8"/>
    {/* Axes */}
    <line x1="20" y1="8" x2="20" y2="75" stroke="#94a3b8" strokeWidth="1.5"/>
    <line x1="20" y1="75" x2="143" y2="75" stroke="#94a3b8" strokeWidth="1.5"/>
    {/* Y ticks */}
    <line x1="17" y1="25" x2="20" y2="25" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="17" y1="42" x2="20" y2="42" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="17" y1="58" x2="20" y2="58" stroke="#94a3b8" strokeWidth="1"/>
    {/* X ticks */}
    <line x1="35" y1="75" x2="35" y2="78" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="58" y1="75" x2="58" y2="78" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="81" y1="75" x2="81" y2="78" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="104" y1="75" x2="104" y2="78" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="127" y1="75" x2="127" y2="78" stroke="#94a3b8" strokeWidth="1"/>
    {/* Bars */}
    <rect x="27" y="33" width="16" height="42" fill="#1e3a5f"/>
    <rect x="50" y="47" width="16" height="28" fill="#1e3a5f"/>
    <rect x="73" y="17" width="16" height="58" fill="#1e3a5f"/>
    <rect x="96" y="40" width="16" height="35" fill="#1e3a5f"/>
    <rect x="119" y="25" width="16" height="50" fill="#1e3a5f"/>
    {/* Error bars — vertical stem + top cap */}
    <line x1="35" y1="27" x2="35" y2="34" stroke="#1e3a5f" strokeWidth="1.5"/>
    <line x1="32" y1="27" x2="38" y2="27" stroke="#1e3a5f" strokeWidth="1.5"/>
    <line x1="58" y1="41" x2="58" y2="48" stroke="#1e3a5f" strokeWidth="1.5"/>
    <line x1="55" y1="41" x2="61" y2="41" stroke="#1e3a5f" strokeWidth="1.5"/>
    <line x1="81" y1="11" x2="81" y2="18" stroke="#1e3a5f" strokeWidth="1.5"/>
    <line x1="78" y1="11" x2="84" y2="11" stroke="#1e3a5f" strokeWidth="1.5"/>
    <line x1="104" y1="34" x2="104" y2="41" stroke="#1e3a5f" strokeWidth="1.5"/>
    <line x1="101" y1="34" x2="107" y2="34" stroke="#1e3a5f" strokeWidth="1.5"/>
    <line x1="127" y1="19" x2="127" y2="26" stroke="#1e3a5f" strokeWidth="1.5"/>
    <line x1="124" y1="19" x2="130" y2="19" stroke="#1e3a5f" strokeWidth="1.5"/>
  </svg>
)

// ── Thumbnail: Scatter with confidence band + regression line ──────────────
const ScatterThumb = () => (
  <svg viewBox="0 0 150 90" className="w-full h-auto">
    <defs>
      <clipPath id="sc-clip">
        <rect x="20" y="8" width="123" height="67"/>
      </clipPath>
    </defs>
    {/* Axes */}
    <line x1="20" y1="8" x2="20" y2="75" stroke="#94a3b8" strokeWidth="1.5"/>
    <line x1="20" y1="75" x2="143" y2="75" stroke="#94a3b8" strokeWidth="1.5"/>
    {/* Y ticks */}
    <line x1="17" y1="20" x2="20" y2="20" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="17" y1="38" x2="20" y2="38" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="17" y1="56" x2="20" y2="56" stroke="#94a3b8" strokeWidth="1"/>
    {/* X ticks */}
    <line x1="52" y1="75" x2="52" y2="78" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="88" y1="75" x2="88" y2="78" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="124" y1="75" x2="124" y2="78" stroke="#94a3b8" strokeWidth="1"/>
    {/* Confidence band + regression (clipped to plot area) */}
    <g clipPath="url(#sc-clip)">
      <polygon points="24,80 140,12 140,22 24,90" fill="#1f2937" fillOpacity="0.07"/>
      <line x1="24" y1="72" x2="140" y2="16" stroke="#1f2937" strokeWidth="1.5"/>
    </g>
    {/* Data points */}
    <circle cx="30" cy="68" r="3.5" fill="#1f2937"/>
    <circle cx="44" cy="72" r="3.5" fill="#1f2937"/>
    <circle cx="55" cy="63" r="3.5" fill="#1f2937"/>
    <circle cx="66" cy="53" r="3.5" fill="#1f2937"/>
    <circle cx="78" cy="57" r="3.5" fill="#1f2937"/>
    <circle cx="90" cy="44" r="3.5" fill="#1f2937"/>
    <circle cx="100" cy="37" r="3.5" fill="#1f2937"/>
    <circle cx="112" cy="27" r="3.5" fill="#1f2937"/>
    <circle cx="124" cy="22" r="3.5" fill="#1f2937"/>
    <circle cx="136" cy="17" r="3.5" fill="#1f2937"/>
  </svg>
)

// ── Thumbnail: 2-series line graph with bezier curves + area fill ──────────
const LineThumb = () => (
  <svg viewBox="0 0 150 90" className="w-full h-auto">
    {/* Axes */}
    <line x1="20" y1="8" x2="20" y2="75" stroke="#94a3b8" strokeWidth="1.5"/>
    <line x1="20" y1="75" x2="143" y2="75" stroke="#94a3b8" strokeWidth="1.5"/>
    {/* Y ticks */}
    <line x1="17" y1="20" x2="20" y2="20" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="17" y1="38" x2="20" y2="38" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="17" y1="56" x2="20" y2="56" stroke="#94a3b8" strokeWidth="1"/>
    {/* X ticks */}
    <line x1="48" y1="75" x2="48" y2="78" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="83" y1="75" x2="83" y2="78" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="118" y1="75" x2="118" y2="78" stroke="#94a3b8" strokeWidth="1"/>
    {/* Area fill under series 1 */}
    <path
      d="M 25,68 C 36,62 41,53 48,52 C 55,51 61,41 68,40 C 75,39 80,48 88,48 C 96,48 101,27 108,25 C 115,23 122,20 128,19 L 128,75 L 25,75 Z"
      fill="#2563eb" fillOpacity="0.1" stroke="none"
    />
    {/* Series 2: orange dashed */}
    <path
      d="M 25,72 C 36,69 41,66 48,65 C 55,64 61,61 68,61 C 75,61 80,63 88,63 C 96,63 101,51 108,50 C 115,49 122,47 128,46"
      stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray="5 3" fill="none"
    />
    {/* Series 1: blue smooth bezier */}
    <path
      d="M 25,68 C 36,62 41,53 48,52 C 55,51 61,41 68,40 C 75,39 80,48 88,48 C 96,48 101,27 108,25 C 115,23 122,20 128,19"
      stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      fill="none"
    />
    {/* Markers — series 1 (open circles) */}
    <circle cx="25" cy="68" r="3" fill="white" stroke="#2563eb" strokeWidth="2"/>
    <circle cx="48" cy="52" r="3" fill="white" stroke="#2563eb" strokeWidth="2"/>
    <circle cx="68" cy="40" r="3" fill="white" stroke="#2563eb" strokeWidth="2"/>
    <circle cx="88" cy="48" r="3" fill="white" stroke="#2563eb" strokeWidth="2"/>
    <circle cx="108" cy="25" r="3" fill="white" stroke="#2563eb" strokeWidth="2"/>
    <circle cx="128" cy="19" r="3" fill="white" stroke="#2563eb" strokeWidth="2"/>
    {/* Markers — series 2 (solid dots) */}
    <circle cx="25" cy="72" r="2.5" fill="#f97316"/>
    <circle cx="48" cy="65" r="2.5" fill="#f97316"/>
    <circle cx="68" cy="61" r="2.5" fill="#f97316"/>
    <circle cx="88" cy="63" r="2.5" fill="#f97316"/>
    <circle cx="108" cy="50" r="2.5" fill="#f97316"/>
    <circle cx="128" cy="46" r="2.5" fill="#f97316"/>
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
