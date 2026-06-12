import type { ChartStyle, StyleOverrides } from '@/lib/chartStyles'
import { formatAxisLabel } from '@/lib/formatLabel'

interface Props {
  baseStyle: ChartStyle
  overrides: StyleOverrides
  onChange: (overrides: StyleOverrides) => void
  yCols: string[]
  seriesNames: Record<string, string>
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

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="min-w-0">
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 bg-white">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border-none p-0 bg-transparent shrink-0"
        />
        <span className="text-xs text-slate-500 tabular-nums">{value}</span>
      </div>
    </div>
  )
}

export default function StyleEditor({ baseStyle, overrides, onChange, yCols, seriesNames }: Props) {
  const set = <K extends keyof StyleOverrides>(key: K, value: StyleOverrides[K]) => {
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

  const setSeriesColor = (col: string, color: string) => {
    onChange({ ...overrides, seriesColors: { ...overrides.seriesColors, [col]: color } })
  }
  const seriesLabel = (col: string) => seriesNames[col]?.trim() || formatAxisLabel(col)

  return (
    <div className="space-y-6">
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
          <ColorField label="Couleur des axes" value={axisColor} onChange={(v) => set('axisColor', v)} />
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

      <div className="space-y-3 pt-4 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-600">Courbes</p>
        <div className="grid grid-cols-2 gap-4">
          {yCols.map((col, i) => (
            <ColorField
              key={col}
              label={seriesLabel(col)}
              value={overrides.seriesColors?.[col] ?? baseStyle.colors[i % baseStyle.colors.length]}
              onChange={(v) => setSeriesColor(col, v)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
