import { useState } from 'react'
import { fontOptions, type ChartStyle, type StyleOverrides } from '@/lib/chartStyles'
import { saveDefaultStyle } from '@/lib/styleStorage'
import {
  ColorSwatchPicker, LegendPositionPicker, LineThicknessPicker, TextSizePicker, ToggleSwitch,
  type NumericPreset,
} from './StyleControls'

interface Props {
  baseStyle: ChartStyle
  overrides: StyleOverrides
  hasMultipleSeries: boolean
  onChange: (overrides: StyleOverrides) => void
}

const figurePresets: { label: string; width: number; height: number }[] = [
  { label: 'Small', width: 450, height: 320 },
  { label: 'Medium', width: 650, height: 450 },
  { label: 'Large', width: 900, height: 600 },
]

const titleSizePresets: NumericPreset[] = [
  { label: 'Petit', value: 10 },
  { label: 'Moyen', value: 13 },
  { label: 'Grand', value: 16 },
]

const tickSizePresets: NumericPreset[] = [
  { label: 'Petit', value: 9 },
  { label: 'Moyen', value: 11 },
  { label: 'Grand', value: 13 },
]

const annotationSizePresets: NumericPreset[] = [
  { label: 'Petit', value: 10 },
  { label: 'Moyen', value: 14 },
  { label: 'Grand', value: 20 },
]

const legendSizePresets: NumericPreset[] = [
  { label: 'Petit', value: 9 },
  { label: 'Moyen', value: 12 },
  { label: 'Grand', value: 15 },
]

const axisWidthPresets: NumericPreset[] = [
  { label: 'Fin', value: 1 },
  { label: 'Moyen', value: 2 },
  { label: 'Épais', value: 3 },
]

function SizeFieldWithInput({
  label, value, presets, min = 6, max = 36, onChange,
}: {
  label: string
  value: number
  presets: NumericPreset[]
  min?: number
  max?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (v >= min && v <= max) onChange(v)
          }}
          className="w-14 border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <TextSizePicker value={value} presets={presets} onChange={onChange} />
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

  const titleSize = overrides.xTitleSize ?? baseStyle.fontSize
  const tickSize = overrides.xTickSize ?? baseStyle.tickFontSize
  const annotationFontSize = overrides.annotationFontSize ?? 12
  const axisWidth = overrides.axisWidth ?? baseStyle.axisWidth
  const axisColor = overrides.axisColor ?? baseStyle.axisColor
  const showGrid = overrides.showGrid ?? baseStyle.showGrid
  const boldLabels = overrides.boldLabels ?? false
  const fontFamily = overrides.fontFamily ?? baseStyle.fontFamily
  const legendFontSize = overrides.legendFontSize ?? baseStyle.tickFontSize
  const legendPosition = overrides.legendPosition ?? 'top'
  const showLegend = overrides.showLegend ?? hasMultipleSeries

  const setTitleSize = (v: number) => onChange({ ...overrides, xTitleSize: v, yTitleSize: v })
  const setTickSize = (v: number) => onChange({ ...overrides, xTickSize: v, yTickSize: v })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">Style</p>
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

      <SizeFieldWithInput label="Taille des titres d'axes" value={titleSize} presets={titleSizePresets} onChange={setTitleSize} />
      <SizeFieldWithInput label="Taille des graduations" value={tickSize} presets={tickSizePresets} onChange={setTickSize} />
      <SizeFieldWithInput label="Taille des textes ajoutés" value={annotationFontSize} presets={annotationSizePresets} onChange={(v) => set('annotationFontSize', v)} />

      <ToggleSwitch label="Texte en gras (titres et graduations)" checked={boldLabels} onChange={(v) => set('boldLabels', v)} />

      <div className="pt-2 border-t border-slate-100 space-y-4">
        <p className="text-xs font-semibold text-slate-600">Axes</p>
        <LineThicknessPicker label="Épaisseur des axes" value={axisWidth} presets={axisWidthPresets} onChange={(v) => set('axisWidth', v)} />
        <ColorSwatchPicker label="Couleur des axes" value={axisColor} onChange={(v) => set('axisColor', v)} />
        <ToggleSwitch label="Afficher la grille" checked={showGrid} onChange={(v) => set('showGrid', v)} />
      </div>

      <div className="pt-2 border-t border-slate-100 space-y-4">
        <p className="text-xs font-semibold text-slate-600">Légende</p>
        <ToggleSwitch label="Afficher la légende" checked={showLegend} onChange={(v) => set('showLegend', v)} />
        {showLegend && (
          <>
            <LegendPositionPicker label="Position" value={legendPosition} onChange={(v) => set('legendPosition', v)} />
            <TextSizePicker label="Taille du texte" value={legendFontSize} presets={legendSizePresets} onChange={(v) => set('legendFontSize', v)} />
          </>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 space-y-3">
        <p className="text-xs font-semibold text-slate-600">Taille de la figure</p>
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
      </div>

      <details className="pt-2 border-t border-slate-100 group">
        <summary className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
          Options avancées
          <svg className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>

        <div className="mt-4 space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <DimensionField label="Largeur personnalisée" value={overrides.figureWidth} placeholder={700} onChange={(v) => set('figureWidth', v)} />
            <DimensionField label="Hauteur personnalisée" value={overrides.figureHeight} placeholder={baseStyle.chartHeight} onChange={(v) => set('figureHeight', v)} />
          </div>
        </div>
      </details>
    </div>
  )
}
