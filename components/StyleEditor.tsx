import { useState } from 'react'
import { fontOptions, type ChartStyle, type LegendPosition, type StyleOverrides } from '@/lib/chartStyles'
import { saveDefaultStyle } from '@/lib/styleStorage'
import { ColorSwatchPicker, ToggleSwitch } from './StyleControls'

const LEGEND_POSITION_OPTIONS: { value: LegendPosition; label: string }[] = [
  { value: 'top-left',      label: 'Top left'      },
  { value: 'top-center',    label: 'Top center'    },
  { value: 'top-right',     label: 'Top right'     },
  { value: 'bottom-left',   label: 'Bottom left'   },
  { value: 'bottom-center', label: 'Bottom center' },
  { value: 'bottom-right',  label: 'Bottom right'  },
  { value: 'outside-right', label: 'Outside right' },
  { value: 'outside-top',   label: 'Outside top'   },
]

interface Props {
  baseStyle: ChartStyle
  overrides: StyleOverrides
  hasMultipleSeries: boolean
  columns?: string[]
  onChange: (overrides: StyleOverrides) => void
}

const parseNum = (raw: string) => (raw === '' ? undefined : Number(raw))

const inputCls = "w-full min-w-0 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-[#2563eb]"

// Compact single-row size control: label  [S] [M] [L]  [##]
function CompactSizeRow({
  label, value, sm, md, lg, min = 6, max = 36, onChange
}: {
  label: string; value: number
  sm: number; md: number; lg: number
  min?: number; max?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-500 flex-1 truncate">{label}</span>
      {[{ l: 'S', v: sm }, { l: 'M', v: md }, { l: 'L', v: lg }].map(({ l, v }) => (
        <button key={l} onClick={() => onChange(v)}
          className={`w-[18px] h-[18px] text-[9px] font-bold rounded transition-colors ${
            value === v ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >{l}</button>
      ))}
      <input type="number" min={min} max={max} value={value}
        onChange={e => { const v = Number(e.target.value); if (v >= min && v <= max) onChange(v) }}
        className="w-10 border border-slate-200 rounded px-1 py-0.5 text-[10px] text-center focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
      />
    </div>
  )
}

// Compact axis width row: Thin / Med / Thick
function AxisWidthRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const opts = [{ l: 'Thin', v: 1 }, { l: 'Med', v: 2 }, { l: 'Thick', v: 3 }]
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-500 flex-1">Axis width</span>
      <div className="flex gap-1">
        {opts.map(({ l, v }) => (
          <button key={l} onClick={() => onChange(v)}
            className={`px-2 h-[18px] text-[9px] font-semibold rounded transition-colors ${
              value === v ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >{l}</button>
        ))}
      </div>
    </div>
  )
}

// Collapsible section
function Section({ title, defaultOpen = false, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-slate-100 pt-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full mb-1.5 select-none"
      >
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <svg className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  )
}

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

  const titleSize   = overrides.xTitleSize       ?? baseStyle.fontSize
  const tickSize    = overrides.xTickSize         ?? baseStyle.tickFontSize
  const annotSize   = overrides.annotationFontSize ?? 12
  const axisWidth   = overrides.axisWidth         ?? baseStyle.axisWidth
  const axisColor   = overrides.axisColor         ?? baseStyle.axisColor
  const showGrid    = overrides.showGrid          ?? baseStyle.showGrid
  const boldLabels  = overrides.boldLabels        ?? false
  const fontFamily  = overrides.fontFamily        ?? baseStyle.fontFamily
  const legendFontSize = overrides.legendFontSize ?? baseStyle.tickFontSize
  const showLegend  = overrides.showLegend        ?? hasMultipleSeries

  const setTitleSize = (v: number) => onChange({ ...overrides, xTitleSize: v, yTitleSize: v })
  const setTickSize  = (v: number) => onChange({ ...overrides, xTickSize: v,  yTickSize: v  })

  return (
    <div className="space-y-2">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-600">Style</span>
        <div className="flex items-center gap-2">
          <button onClick={saveAsDefault} className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors">
            {saved ? 'Saved!' : 'Save default'}
          </button>
          <button onClick={reset} className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors">Reset</button>
        </div>
      </div>

      {/* Font */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-500 flex-1">Font</span>
        <select
          value={fontFamily}
          onChange={e => set('fontFamily', e.target.value as typeof fontFamily)}
          className="border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] max-w-[130px]"
        >
          {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {/* Labels section */}
      <Section title="Labels" defaultOpen>
        <CompactSizeRow label="Axis labels" value={titleSize} sm={10} md={13} lg={16} onChange={setTitleSize} />
        <CompactSizeRow label="Tick labels" value={tickSize}  sm={9}  md={11} lg={13} onChange={setTickSize}  />
        <CompactSizeRow label="Annotations" value={annotSize} sm={10} md={14} lg={20} onChange={v => set('annotationFontSize', v)} />
        <ToggleSwitch label="Bold labels" checked={boldLabels} onChange={v => set('boldLabels', v)} />
      </Section>

      {/* Axes section */}
      <Section title="Axes" defaultOpen>
        <AxisWidthRow value={axisWidth} onChange={v => set('axisWidth', v)} />
        <ColorSwatchPicker label="Color" value={axisColor} onChange={v => set('axisColor', v)} />
        <ToggleSwitch label="Show grid" checked={showGrid} onChange={v => set('showGrid', v)} />
      </Section>

      {/* Legend section */}
      <Section title="Legend">
        <ToggleSwitch label="Show legend" checked={showLegend} onChange={v => set('showLegend', v)} />
        {showLegend && (
          <>
            <div className="flex gap-1">
              {(['box', 'inline'] as const).map(mode => (
                <button key={mode}
                  onClick={() => set('legendMode', mode === 'box' ? undefined : 'inline')}
                  className={`flex-1 text-[10px] py-1 rounded border transition-colors ${
                    (overrides.legendMode ?? 'box') === mode
                      ? 'bg-[#2563eb] text-white border-[#2563eb]'
                      : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >{mode === 'box' ? 'Box' : 'Inline'}</button>
              ))}
            </div>

            {(overrides.legendMode ?? 'box') === 'box' && (
              <div>
                <select
                  value={overrides.legendPosition ?? 'top-right'}
                  onChange={e => onChange({
                    ...overrides,
                    legendPosition: e.target.value as LegendPosition,
                    legendXPct: undefined, legendYPct: undefined,
                  })}
                  className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                >
                  {LEGEND_POSITION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="flex gap-3 mt-2">
                  <ToggleSwitch label="Vertical" checked={(overrides.legendOrientation ?? 'h') === 'v'} onChange={v => set('legendOrientation', v ? 'v' : 'h')} />
                  <ToggleSwitch label="Background" checked={overrides.legendBg ?? true} onChange={v => set('legendBg', v)} />
                </div>
              </div>
            )}
            <CompactSizeRow label="Text size" value={legendFontSize} sm={9} md={12} lg={15} onChange={v => set('legendFontSize', v)} />
          </>
        )}
      </Section>

      {/* Figure size */}
      <Section title="Figure size">
        <div className="flex gap-1.5">
          {[{ label: 'S', width: 450, height: 320 }, { label: 'M', width: 650, height: 450 }, { label: 'L', width: 900, height: 600 }].map(p => (
            <button key={p.label}
              onClick={() => onChange({ ...overrides, figureWidth: p.width, figureHeight: p.height })}
              className="flex-1 text-[10px] py-1 border border-slate-200 rounded font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >{p.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <input type="number" value={overrides.figureWidth ?? ''} placeholder="700" min={1}
            onChange={e => set('figureWidth', parseNum(e.target.value))} className={inputCls} />
          <span className="text-[10px] text-slate-400 shrink-0">W</span>
          <span className="text-[10px] text-slate-300">×</span>
          <input type="number" value={overrides.figureHeight ?? ''} placeholder={String(baseStyle.chartHeight)} min={1}
            onChange={e => set('figureHeight', parseNum(e.target.value))} className={inputCls} />
          <span className="text-[10px] text-slate-400 shrink-0">H px</span>
        </div>
      </Section>

      {/* Advanced */}
      <Section title="Axis ranges">
        <div className="grid grid-cols-[36px_1fr_1fr] gap-x-1.5 gap-y-1.5 items-center">
          <div />
          <p className="text-[9px] font-bold text-slate-400 text-center">X</p>
          <p className="text-[9px] font-bold text-slate-400 text-center">Y</p>

          <p className="text-[9px] text-slate-400 text-right">Min</p>
          <input type="number" value={overrides.xMin ?? ''} placeholder="Auto" onChange={e => set('xMin', parseNum(e.target.value))} className={inputCls} />
          <input type="number" value={overrides.yMin ?? ''} placeholder="Auto" onChange={e => set('yMin', parseNum(e.target.value))} className={inputCls} />

          <p className="text-[9px] text-slate-400 text-right">Max</p>
          <input type="number" value={overrides.xMax ?? ''} placeholder="Auto" onChange={e => set('xMax', parseNum(e.target.value))} className={inputCls} />
          <input type="number" value={overrides.yMax ?? ''} placeholder="Auto" onChange={e => set('yMax', parseNum(e.target.value))} className={inputCls} />

          <p className="text-[9px] text-slate-400 text-right">Step</p>
          <input type="number" value={overrides.xStep ?? ''} placeholder="Auto" min={0} onChange={e => set('xStep', parseNum(e.target.value))} className={inputCls} />
          <input type="number" value={overrides.yStep ?? ''} placeholder="Auto" min={0} onChange={e => set('yStep', parseNum(e.target.value))} className={inputCls} />
        </div>
      </Section>

    </div>
  )
}
