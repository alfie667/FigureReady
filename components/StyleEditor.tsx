import type { ChartStyle, AxisStyleOverrides } from '@/lib/chartStyles'

interface Props {
  baseStyle: ChartStyle
  overrides: AxisStyleOverrides
  onChange: (overrides: AxisStyleOverrides) => void
}

function NumberField({
  label, value, min, max, step = 1, onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <div className="min-w-0">
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 min-w-0 accent-blue-600"
        />
        <span className="w-9 text-xs text-slate-500 text-right tabular-nums shrink-0">{value}</span>
      </div>
    </div>
  )
}

export default function StyleEditor({ baseStyle, overrides, onChange }: Props) {
  const set = <K extends keyof AxisStyleOverrides>(key: K, value: AxisStyleOverrides[K]) => {
    onChange({ ...overrides, [key]: value })
  }

  const reset = () => onChange({})

  const xTitleSize = overrides.xTitleSize ?? baseStyle.fontSize
  const yTitleSize = overrides.yTitleSize ?? baseStyle.fontSize
  const xTickSize = overrides.xTickSize ?? baseStyle.tickFontSize
  const yTickSize = overrides.yTickSize ?? baseStyle.tickFontSize
  const axisWidth = overrides.axisWidth ?? baseStyle.axisWidth
  const axisColor = overrides.axisColor ?? baseStyle.axisColor
  const showGrid = overrides.showGrid ?? baseStyle.showGrid

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">Axes</p>
        <button
          onClick={reset}
          className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
        >
          Réinitialiser
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumberField label="Taille titre axe X" value={xTitleSize} min={8} max={24} onChange={(v) => set('xTitleSize', v)} />
        <NumberField label="Taille titre axe Y" value={yTitleSize} min={8} max={24} onChange={(v) => set('yTitleSize', v)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumberField label="Taille graduations axe X" value={xTickSize} min={6} max={18} onChange={(v) => set('xTickSize', v)} />
        <NumberField label="Taille graduations axe Y" value={yTickSize} min={6} max={18} onChange={(v) => set('yTickSize', v)} />
      </div>

      <div className="grid grid-cols-2 gap-4 items-end">
        <NumberField label="Épaisseur des axes" value={axisWidth} min={0.5} max={4} step={0.5} onChange={(v) => set('axisWidth', v)} />
        <div className="min-w-0">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Couleur des axes</label>
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 bg-white">
            <input
              type="color"
              value={axisColor}
              onChange={(e) => set('axisColor', e.target.value)}
              className="w-7 h-7 rounded cursor-pointer border-none p-0 bg-transparent shrink-0"
            />
            <span className="text-xs text-slate-500 tabular-nums">{axisColor}</span>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={showGrid}
          onChange={(e) => set('showGrid', e.target.checked)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        Afficher la grille
      </label>
    </div>
  )
}
