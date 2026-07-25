import { useState } from 'react'
import { fontOptions, type ChartStyle, type StyleOverrides } from '@/lib/chartStyles'
import { saveDefaultStyle } from '@/lib/styleStorage'
import {
  ColorSwatchPicker, LineThicknessPicker, TextSizePicker, ToggleSwitch,
  type NumericPreset,
} from './StyleControls'

interface Props {
  baseStyle: ChartStyle
  overrides: StyleOverrides
  hasMultipleSeries: boolean
  columns?: string[]
  onChange: (overrides: StyleOverrides) => void
}

const figurePresets: { label: string; width: number; height: number }[] = [
  { label: 'Small', width: 450, height: 320 },
  { label: 'Medium', width: 650, height: 450 },
  { label: 'Large', width: 900, height: 600 },
]

const titleSizePresets: NumericPreset[] = [
  { label: 'Small', value: 10 },
  { label: 'Medium', value: 13 },
  { label: 'Large', value: 16 },
]

const tickSizePresets: NumericPreset[] = [
  { label: 'Small', value: 9 },
  { label: 'Medium', value: 11 },
  { label: 'Large', value: 13 },
]

const annotationSizePresets: NumericPreset[] = [
  { label: 'Small', value: 10 },
  { label: 'Medium', value: 14 },
  { label: 'Large', value: 20 },
]

const legendSizePresets: NumericPreset[] = [
  { label: 'Small', value: 9 },
  { label: 'Medium', value: 12 },
  { label: 'Large', value: 15 },
]

const axisWidthPresets: NumericPreset[] = [
  { label: 'Thin', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'Thick', value: 3 },
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
          className="w-14 border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
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
        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

const inputCls = "w-full min-w-0 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-[#2563eb] placeholder:text-slate-300"
const parseNum = (raw: string) => (raw === '' ? undefined : Number(raw))

export default function StyleEditor({ baseStyle, overrides, hasMultipleSeries, columns = [], onChange }: Props) {
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
            {saved ? 'Saved!' : 'Save as default'}
          </button>
          <button
            onClick={reset}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <SelectField label="Font" value={fontFamily} options={fontOptions} onChange={(v) => set('fontFamily', v)} />

      <SizeFieldWithInput label="Axis label size" value={titleSize} presets={titleSizePresets} onChange={setTitleSize} />
      <SizeFieldWithInput label="Tick label size" value={tickSize} presets={tickSizePresets} onChange={setTickSize} />
      <SizeFieldWithInput label="Annotation text size" value={annotationFontSize} presets={annotationSizePresets} onChange={(v) => set('annotationFontSize', v)} />

      <ToggleSwitch label="Bold labels (titles & ticks)" checked={boldLabels} onChange={(v) => set('boldLabels', v)} />

      <div className="pt-2 border-t border-slate-100 space-y-4">
        <p className="text-xs font-semibold text-slate-600">Axes</p>
        <LineThicknessPicker label="Axis line width" value={axisWidth} presets={axisWidthPresets} onChange={(v) => set('axisWidth', v)} />
        <ColorSwatchPicker label="Axis color" value={axisColor} onChange={(v) => set('axisColor', v)} />
        <ToggleSwitch label="Show grid" checked={showGrid} onChange={(v) => set('showGrid', v)} />
      </div>

      <div className="pt-2 border-t border-slate-100 space-y-4">
        <p className="text-xs font-semibold text-slate-600">Legend</p>
        <ToggleSwitch label="Show legend" checked={showLegend} onChange={(v) => set('showLegend', v)} />
        {showLegend && (
          <>
            <TextSizePicker label="Text size" value={legendFontSize} presets={legendSizePresets} onChange={(v) => set('legendFontSize', v)} />
            <div className="flex gap-3">
              <ToggleSwitch label="Vertical layout" checked={(overrides.legendOrientation ?? 'h') === 'v'} onChange={(v) => set('legendOrientation', v ? 'v' : 'h')} />
              <ToggleSwitch label="Background" checked={overrides.legendBg ?? true} onChange={(v) => set('legendBg', v)} />
            </div>
          </>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 space-y-3">
        <p className="text-xs font-semibold text-slate-600">Figure size</p>
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

      {overrides.insetDefined && (
        <div className="pt-2 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-600">Inset figure</p>
            <span className="text-[10px] text-slate-400">Press Del to remove</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Size</p>
              <div className="flex items-center gap-2">
                <input type="range" min={20} max={50} value={overrides.insetSizePct ?? 35}
                  onChange={e => set('insetSizePct', Number(e.target.value))}
                  className="w-20 accent-[#2563eb]" />
                <span className="text-[10px] text-slate-400 w-7 text-right">{overrides.insetSizePct ?? 35}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Tick font</p>
              <div className="flex items-center gap-2">
                <input type="range" min={5} max={12} value={overrides.insetTickFontSize ?? 7}
                  onChange={e => set('insetTickFontSize', Number(e.target.value))}
                  className="w-20 accent-[#2563eb]" />
                <span className="text-[10px] text-slate-400 w-7 text-right">{overrides.insetTickFontSize ?? 7}pt</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Line width</p>
              <div className="flex items-center gap-2">
                <input type="range" min={5} max={30} step={5} value={Math.round((overrides.insetLineWidth ?? 1.2) * 10)}
                  onChange={e => set('insetLineWidth', Number(e.target.value) / 10)}
                  className="w-20 accent-[#2563eb]" />
                <span className="text-[10px] text-slate-400 w-7 text-right">{overrides.insetLineWidth ?? 1.2}px</span>
              </div>
            </div>

            <ToggleSwitch label="Box frame" checked={overrides.insetShowFrame ?? false} onChange={v => set('insetShowFrame', v)} />
            <ToggleSwitch label="Show zoom rectangle" checked={overrides.insetShowZoomRect ?? false} onChange={v => set('insetShowZoomRect', v)} />

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Border</p>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={overrides.insetBorder ?? false}
                  onChange={e => set('insetBorder', e.target.checked)}
                  className="accent-[#2563eb]" />
                {(overrides.insetBorder ?? false) && (
                  <>
                    <input type="color" value={overrides.insetBorderColor ?? axisColor}
                      onChange={e => set('insetBorderColor', e.target.value)}
                      className="w-6 h-5 rounded cursor-pointer border border-slate-200" title="Border color" />
                    <input type="range" min={1} max={4} step={0.5} value={overrides.insetBorderWidth ?? 1.5}
                      onChange={e => set('insetBorderWidth', Number(e.target.value))}
                      className="w-14 accent-[#2563eb]" />
                    <span className="text-[10px] text-slate-400 w-7 text-right">{overrides.insetBorderWidth ?? 1.5}px</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <details className="pt-2 border-t border-slate-100 group">
        <summary className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
          Advanced options
          <svg className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>

        <div className="mt-4 space-y-5">

          {/* Axis ranges — table layout */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">Axis ranges</p>
            <div className="grid grid-cols-[44px_1fr_1fr] gap-x-2 gap-y-2 items-center">
              <div />
              <p className="text-[10px] font-bold text-slate-500 text-center">X axis</p>
              <p className="text-[10px] font-bold text-slate-500 text-center">Y axis</p>

              <p className="text-[10px] text-slate-400 font-medium text-right pr-1">Min</p>
              <input type="number" value={overrides.xMin ?? ''} placeholder="Auto" onChange={(e) => set('xMin', parseNum(e.target.value))} className={inputCls} />
              <input type="number" value={overrides.yMin ?? ''} placeholder="Auto" onChange={(e) => set('yMin', parseNum(e.target.value))} className={inputCls} />

              <p className="text-[10px] text-slate-400 font-medium text-right pr-1">Max</p>
              <input type="number" value={overrides.xMax ?? ''} placeholder="Auto" onChange={(e) => set('xMax', parseNum(e.target.value))} className={inputCls} />
              <input type="number" value={overrides.yMax ?? ''} placeholder="Auto" onChange={(e) => set('yMax', parseNum(e.target.value))} className={inputCls} />

              <p className="text-[10px] text-slate-400 font-medium text-right pr-1">Step</p>
              <input type="number" value={overrides.xStep ?? ''} placeholder="Auto" min={0} onChange={(e) => set('xStep', parseNum(e.target.value))} className={inputCls} />
              <input type="number" value={overrides.yStep ?? ''} placeholder="Auto" min={0} onChange={(e) => set('yStep', parseNum(e.target.value))} className={inputCls} />
            </div>
          </div>

          {/* Figure dimensions */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">Figure size</p>
            <div className="flex items-center gap-2">
              <input type="number" value={overrides.figureWidth ?? ''} placeholder="700" min={1} onChange={(e) => set('figureWidth', parseNum(e.target.value))} className={inputCls} />
              <span className="text-[10px] text-slate-400 shrink-0 font-semibold">W</span>
              <span className="text-[10px] text-slate-300 shrink-0">×</span>
              <input type="number" value={overrides.figureHeight ?? ''} placeholder={String(baseStyle.chartHeight)} min={1} onChange={(e) => set('figureHeight', parseNum(e.target.value))} className={inputCls} />
              <span className="text-[10px] text-slate-400 shrink-0 font-semibold">H</span>
              <span className="text-[10px] text-slate-400 shrink-0">px</span>
            </div>
          </div>

        </div>
      </details>
    </div>
  )
}
