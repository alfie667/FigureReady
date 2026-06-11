type ChartType = 'line' | 'lineOnly' | 'scatter' | 'bar'

interface Props {
  value: ChartType
  onChange: (type: ChartType) => void
}

const icons: Record<ChartType, React.ReactNode> = {
  line: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 17l4-4 4 3 6-7 4 4" />
  ),
  lineOnly: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 17c3-1 5-7 8-7s5 6 8 0" />
  ),
  scatter: (
    <g fill="currentColor" stroke="none">
      <circle cx="6" cy="15" r="1.6" />
      <circle cx="11" cy="8" r="1.6" />
      <circle cx="16" cy="16" r="1.6" />
      <circle cx="19" cy="9" r="1.6" />
    </g>
  ),
  bar: (
    <g fill="currentColor" stroke="none">
      <rect x="4" y="11" width="3" height="8" rx="0.5" />
      <rect x="10.5" y="6" width="3" height="13" rx="0.5" />
      <rect x="17" y="14" width="3" height="5" rx="0.5" />
    </g>
  ),
}

const options: { value: ChartType; label: string }[] = [
  { value: 'line', label: 'Line' },
  { value: 'lineOnly', label: 'Line only' },
  { value: 'scatter', label: 'Scatter' },
  { value: 'bar', label: 'Bar' },
]

export default function ChartTypeSelector({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-1.5">Type de graphique</p>
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
              value === opt.value
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {icons[opt.value]}
            </svg>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
