import type { PanelLayout } from '@/lib/panels'

interface Props {
  value: PanelLayout
  onChange: (layout: PanelLayout) => void
}

const LAYOUTS: { key: PanelLayout; label: string }[] = [
  { key: '1',  label: '1×1' },
  { key: '2h', label: '1×2' },
  { key: '2v', label: '2×1' },
  { key: '4',  label: '2×2' },
  { key: '3h', label: '1×3' },
]

const Icon1x1 = () => (
  <svg viewBox="0 0 36 26" width="36" height="26" fill="currentColor">
    <rect x="1" y="1" width="34" height="24" rx="2" />
  </svg>
)
const Icon1x2 = () => (
  <svg viewBox="0 0 36 26" width="36" height="26" fill="currentColor">
    <rect x="1" y="1" width="15" height="24" rx="2" />
    <rect x="20" y="1" width="15" height="24" rx="2" />
  </svg>
)
const Icon2x1 = () => (
  <svg viewBox="0 0 36 26" width="36" height="26" fill="currentColor">
    <rect x="1" y="1" width="34" height="11" rx="2" />
    <rect x="1" y="14" width="34" height="11" rx="2" />
  </svg>
)
const Icon2x2 = () => (
  <svg viewBox="0 0 36 26" width="36" height="26" fill="currentColor">
    <rect x="1" y="1" width="15" height="11" rx="2" />
    <rect x="20" y="1" width="15" height="11" rx="2" />
    <rect x="1" y="14" width="15" height="11" rx="2" />
    <rect x="20" y="14" width="15" height="11" rx="2" />
  </svg>
)
const Icon1x3 = () => (
  <svg viewBox="0 0 36 26" width="36" height="26" fill="currentColor">
    <rect x="1"  y="1" width="10" height="24" rx="2" />
    <rect x="13" y="1" width="10" height="24" rx="2" />
    <rect x="25" y="1" width="10" height="24" rx="2" />
  </svg>
)

const ICONS: Record<PanelLayout, React.ReactNode> = {
  '1':  <Icon1x1 />,
  '2h': <Icon1x2 />,
  '2v': <Icon2x1 />,
  '4':  <Icon2x2 />,
  '3h': <Icon1x3 />,
}

export default function PanelLayoutSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {LAYOUTS.map(({ key, label }) => {
        const active = value === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            title={label}
            className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${
              active
                ? 'bg-[#2563eb] text-white'
                : 'bg-white text-slate-400 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {ICONS[key]}
            <span className="text-[10px] font-semibold leading-none">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
