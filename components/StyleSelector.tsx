import type { StyleName } from '@/lib/chartStyles'

interface Props {
  value: StyleName
  onChange: (style: StyleName) => void
}

const options: { value: StyleName; label: string }[] = [
  { value: 'Nature', label: 'Nature' },
  { value: 'ACS', label: 'ACS' },
  { value: 'Clean', label: 'Clean' },
]

export default function StyleSelector({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-1.5">Style</p>
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${
              value === opt.value
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
