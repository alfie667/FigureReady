import { useState } from 'react'
import { fontOptions, type ChartStyle, type LegendPosition, type StyleOverrides } from '@/lib/chartStyles'
import { saveDefaultStyle } from '@/lib/styleStorage'

interface Props {
  baseStyle: ChartStyle
  overrides: StyleOverrides
  hasMultipleSeries: boolean
  onChange: (overrides: StyleOverrides) => void
}

const legendPositionOptions: { value: LegendPosition; label: string }[] = [
  { value: 'top', label: 'Haut' },
  { value: 'bottom', label: 'Bas' },
  { value: 'left', label: 'Gauche' },
  { value: 'right', label: 'Droite' },
]

const figurePresets: { label: string; width: number; height: number }[] = [
  { label: 'Small', width: 450, height: 320 },
  { label: 'Medium', width: 650, height: 450 },
  { label: 'Large', width: 900, height: 600 },
]

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

function AxisRangeField({
  label, min, max, step, onMinChange, onMaxChange, onStepChange,
}: {
  label: string
  min?: number
  max?: number
  step?: number
  onMinChange: (value?: number) => void
  onMaxChange: (value?: number) => void
  onStepChange: (value?: number) => void
}) {
  const parse = (raw: string) => (raw === '' ? undefined : Number(raw))
  return (
    <div className="min-w-0 space-y-1.5">
      <label className="block text-xs font-medium text-slate-500">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={min ?? ''}
          placeholder="Auto"
          onChange={(e) => onMinChange(parse(e.target.value))}
          className="w-full min-w-0 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="text-xs text-slate-400 shrink-0">→</span>
        <input
          type="number"
          value={max ?? ''}
          placeholder="Auto"
          onChange={(e) => onMaxChange(parse(e.target.value))}
          className="w-full min-w-0 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 shrink-0">Pas</span>
        <input
          type="number"
          value={step ?? ''}
          placeholder="Auto"
          min={0}
          onChange={(e) => onStepChange(parse(e.target.value))}
          className="w-full min-w-0 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

function SelectField<T extends string>({
  label, value, options, onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="min-w-0">
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function DimensionField({
  label, value, placeholder, onChange,
}: {
  label: string
  value?: number
  placeholder: number
  onChange: (value?: number) => void
}) {
  return (
    <div className="min-w-0">
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value ?? ''}
          placeholder={String(placeholder)}
          min={1}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          className="w-full min-w-0 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="text-xs text-slate-400 shrink-0">px</span>
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

export default function StyleEditor({ baseStyle, overrides, hasMultipleSeries, onChange }: Props) {
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof StyleOverrides>(key: K, value: StyleOverrides[K]) => {
    onChange({ ...overrides, [key]: value })
  }

  const saveAsDefault = () => {
    saveDefaultStyle(overrides)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const reset = () => onChange({
    seriesColors: overrides.seriesColors,
    seriesStrokeWidths: overrides.seriesStrokeWidths,
    seriesMarkerSizes: overrides.seriesMarkerSizes,
    seriesMarkerShapes: overrides.seriesMarkerShapes,
  })

  const xTitleSize = overrides.xTitleSize ?? baseStyle.fontSize
  const yTitleSize = overrides.yTitleSize ?? baseStyle.fontSize
  const xTickSize = overrides.xTickSize ?? baseStyle.tickFontSize
  const yTickSize = overrides.yTickSize ?? baseStyle.tickFontSize
  const axisWidth = overrides.axisWidth ?? baseStyle.axisWidth
  const axisColor = overrides.axisColor ?? baseStyle.axisColor
  const showGrid = overrides.showGrid ?? baseStyle.showGrid
  const boldLabels = overrides.boldLabels ?? false
  const fontFamily = overrides.fontFamily ?? baseStyle.fontFamily
  const legendFontSize = overrides.legendFontSize ?? baseStyle.tickFontSize
  const legendPosition = overrides.legendPosition ?? 'top'
  const showLegend = overrides.showLegend ?? hasMultipleSeries

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">Axes</p>
        <div className="flex items-center gap-3">
          <button
            onClick={saveAsDefault}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            {saved ? 'Enregistré !' : 'Enregistrer par défaut'}
          </button>
          <button
            onClick={reset}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <SelectField label="Police" value={fontFamily} options={fontOptions} onChange={(v) => set('fontFamily', v)} />

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

      <div className="grid grid-cols-2 gap-4">
        <AxisRangeField
          label="Plage de l'axe X (début → fin)"
          min={overrides.xMin}
          max={overrides.xMax}
          step={overrides.xStep}
          onMinChange={(v) => set('xMin', v)}
          onMaxChange={(v) => set('xMax', v)}
          onStepChange={(v) => set('xStep', v)}
        />
        <AxisRangeField
          label="Plage de l'axe Y (début → fin)"
          min={overrides.yMin}
          max={overrides.yMax}
          step={overrides.yStep}
          onMinChange={(v) => set('yMin', v)}
          onMaxChange={(v) => set('yMax', v)}
          onStepChange={(v) => set('yStep', v)}
        />
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

      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={boldLabels}
          onChange={(e) => set('boldLabels', e.target.checked)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        Texte en gras (titres et graduations)
      </label>

      <div className="pt-2 border-t border-slate-100 space-y-4">
        <p className="text-xs font-semibold text-slate-600">Légende</p>

        <div className="grid grid-cols-2 gap-4 items-end">
          <NumberField label="Taille police légende" value={legendFontSize} min={8} max={18} onChange={(v) => set('legendFontSize', v)} />
          <SelectField label="Position" value={legendPosition} options={legendPositionOptions} onChange={(v) => set('legendPosition', v)} />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={showLegend}
            onChange={(e) => set('showLegend', e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Afficher la légende
        </label>
      </div>

      <div className="pt-2 border-t border-slate-100 space-y-3">
        <p className="text-xs font-semibold text-slate-600">Figure</p>

        <div className="flex flex-wrap gap-2">
          {figurePresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => onChange({ ...overrides, figureWidth: preset.width, figureHeight: preset.height })}
              className="px-3 py-1.5 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DimensionField label="Largeur" value={overrides.figureWidth} placeholder={700} onChange={(v) => set('figureWidth', v)} />
          <DimensionField label="Hauteur" value={overrides.figureHeight} placeholder={baseStyle.chartHeight} onChange={(v) => set('figureHeight', v)} />
        </div>
      </div>
    </div>
  )
}
