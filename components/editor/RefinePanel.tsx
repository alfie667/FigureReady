'use client'
import { useState, useEffect } from 'react'
import type { SelectedChartElement } from '@/lib/chartSelection'
import { fontOptions, type ChartStyle, type LegendPosition, type StyleOverrides } from '@/lib/chartStyles'
import { saveDefaultStyle } from '@/lib/styleStorage'
import { ColorSwatchPicker, LineThicknessPicker, MarkerShapePicker, MarkerSizePicker, ToggleSwitch, type NumericPreset } from '@/components/StyleControls'
import type { MarkerShape } from '@/lib/markerShapes'
import type { Fit4PLResult } from '@/lib/curveFit4PL'

type ChartType = 'line' | 'lineOnly' | 'scatter' | 'bar' | 'doseResponse'

function fmtIC50(v: number): string {
  if (!isFinite(v) || v <= 0) return '—'
  if (v < 1e-3 || v >= 1e4) return v.toExponential(2)
  return parseFloat(v.toPrecision(3)).toString()
}
function fmtN(v: number, dec = 2): string {
  return isFinite(v) ? v.toFixed(dec) : '—'
}

interface Props {
  // Series appearance
  yCols: string[]
  seriesNames: Record<string, string>
  seriesColors: Record<string, string>
  seriesStrokeWidths: Record<string, number>
  seriesMarkerSizes: Record<string, number>
  seriesMarkerShapes: Record<string, MarkerShape>
  chartType: ChartType
  defaultColors: string[]
  defaultStrokeWidth: number
  defaultMarkerSize: number
  onSeriesColorsChange: (colors: Record<string, string>) => void
  onSeriesStrokeWidthsChange: (widths: Record<string, number>) => void
  onSeriesMarkerSizesChange: (sizes: Record<string, number>) => void
  onSeriesMarkerShapesChange: (shapes: Record<string, MarkerShape>) => void
  // Direct-manipulation selection
  selectedElement: SelectedChartElement | null
  onElementSelect: (el: SelectedChartElement | null) => void
  // Global style
  baseStyle: ChartStyle
  overrides: StyleOverrides
  onChange: (overrides: StyleOverrides) => void
  // Dose–response fit results (computed in parent, passed down — never hardcoded)
  doseResponseFits?: Record<string, Fit4PLResult>
}

const strokePresets: NumericPreset[] = [
  { label: 'Thin', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'Thick', value: 3 },
  { label: 'X-Thick', value: 4 },
]
const markerSizePresets: NumericPreset[] = [
  { label: 'None', value: 0 },
  { label: 'Small', value: 2 },
  { label: 'Medium', value: 4 },
  { label: 'Large', value: 6 },
]

const LEGEND_POSITIONS: { value: LegendPosition; label: string }[] = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-center', label: 'Top center' },
  { value: 'top-right', label: 'Top right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-center', label: 'Bottom center' },
  { value: 'bottom-right', label: 'Bottom right' },
  { value: 'outside-right', label: 'Outside right' },
  { value: 'outside-top', label: 'Outside top' },
]

const inputCls = "w-full min-w-0 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-[#2563eb]"

function SectionHeader({
  title, open, onToggle,
}: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full py-3 border-t border-[#E2E8F0] select-none"
    >
      <span className="text-[13px] font-semibold text-[#334155]">{title}</span>
      <svg className={`w-4 h-4 text-[#94A3B8] transition-transform ${open ? 'rotate-180' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

function CompactSizeRow({ label, value, sm, md, lg, min = 6, max = 36, onChange }: {
  label: string; value: number; sm: number; md: number; lg: number; min?: number; max?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-500 flex-1 truncate">{label}</span>
      {[{ l: 'S', v: sm }, { l: 'M', v: md }, { l: 'L', v: lg }].map(({ l, v }) => (
        <button key={l} onClick={() => onChange(v)}
          className={`w-[18px] h-[18px] text-[9px] font-bold rounded transition-colors ${value === v ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >{l}</button>
      ))}
      <input type="number" min={min} max={max} value={value}
        onChange={e => { const v = Number(e.target.value); if (v >= min && v <= max) onChange(v) }}
        className="w-10 border border-slate-200 rounded px-1 py-0.5 text-[10px] text-center focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
      />
    </div>
  )
}

export default function RefinePanel({
  yCols, seriesNames, seriesColors, seriesStrokeWidths, seriesMarkerSizes, seriesMarkerShapes,
  chartType, defaultColors, defaultStrokeWidth, defaultMarkerSize,
  onSeriesColorsChange, onSeriesStrokeWidthsChange, onSeriesMarkerSizesChange, onSeriesMarkerShapesChange,
  selectedElement, onElementSelect,
  baseStyle, overrides, onChange,
  doseResponseFits,
}: Props) {
  const [openSection, setOpenSection] = useState<string>('series')
  const [saved, setSaved] = useState(false)

  const selectedSeries = selectedElement?.type === 'series' ? (selectedElement.seriesKey ?? null) : null

  // Auto-open the section that matches the clicked chart element
  useEffect(() => {
    if (!selectedElement) return
    const map: Partial<Record<SelectedChartElement['type'], string>> = {
      series:     'series',
      xAxisLabel: 'labels',
      yAxisLabel: 'labels',
      xAxisTicks: 'axes',
      yAxisTicks: 'axes',
      legend:     'legend',
      figure:     'figsize',
    }
    const section = map[selectedElement.type]
    if (section) setOpenSection(section)
  }, [selectedElement])

  const toggle = (s: string) => setOpenSection(prev => prev === s ? '' : s)
  const set = <K extends keyof StyleOverrides>(key: K, value: StyleOverrides[K]) => onChange({ ...overrides, [key]: value })
  const parseNum = (raw: string): number | undefined => {
    if (raw === '') return undefined
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }

  const titleSize  = overrides.xTitleSize       ?? baseStyle.fontSize
  const tickSize   = overrides.xTickSize         ?? baseStyle.tickFontSize
  const axisWidth  = overrides.axisWidth         ?? baseStyle.axisWidth
  const axisColor  = overrides.axisColor         ?? baseStyle.axisColor
  const showGrid   = overrides.showGrid          ?? baseStyle.showGrid
  const boldLabels = overrides.boldLabels        ?? false
  const fontFamily = overrides.fontFamily        ?? baseStyle.fontFamily
  const showLegend = overrides.showLegend        ?? yCols.length > 1
  const legendFont = overrides.legendFontSize    ?? baseStyle.tickFontSize

  const setTitleSize = (v: number) => onChange({ ...overrides, xTitleSize: v, yTitleSize: v })
  const setTickSize  = (v: number) => onChange({ ...overrides, xTickSize: v, yTickSize: v })

  const saveAsDefault = () => {
    saveDefaultStyle(overrides)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#334155]">Font</span>
          <select
            value={fontFamily}
            onChange={e => set('fontFamily', e.target.value as typeof fontFamily)}
            className="border border-[#E2E8F0] rounded-lg px-2 py-1 text-[13px] text-[#0F172A] bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] max-w-[120px]"
          >
            {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={saveAsDefault} className="text-[12px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">
            {saved ? 'Saved!' : 'Save default'}
          </button>
          <button
            onClick={() => onChange({ seriesColors: overrides.seriesColors, seriesStrokeWidths: overrides.seriesStrokeWidths, seriesMarkerSizes: overrides.seriesMarkerSizes, seriesMarkerShapes: overrides.seriesMarkerShapes })}
            className="text-[12px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
          >Reset</button>
        </div>
      </div>

      {/* ── Series ─────────────────────────────────────────────────── */}
      <SectionHeader title="Series" open={openSection === 'series'} onToggle={() => toggle('series')} />
      {openSection === 'series' && (
        <div className="pb-3">
          {/* ── Series tab strip (always visible) ─────────────────── */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {yCols.map((col, i) => {
              const color = seriesColors[col] ?? defaultColors[i % defaultColors.length]
              const active = selectedSeries === col
              return (
                <button
                  key={col}
                  type="button"
                  onClick={() => onElementSelect(active ? null : { type: 'series', seriesKey: col })}
                  title={seriesNames[col] || col}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium transition-colors ${
                    active
                      ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                      : 'bg-white border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-black/10" style={{ backgroundColor: color }} />
                  <span className="max-w-[72px] truncate">{seriesNames[col] || col}</span>
                </button>
              )
            })}
          </div>

          {/* ── Single series editor (when one is selected) ─────── */}
          {selectedSeries && (() => {
            const col = selectedSeries
            const i = yCols.indexOf(col)
            if (i === -1) return null
            const color = seriesColors[col] ?? defaultColors[i % defaultColors.length]
            const strokeWidth = seriesStrokeWidths[col] ?? defaultStrokeWidth
            const markerSize = seriesMarkerSizes[col] ?? defaultMarkerSize
            const markerShape = seriesMarkerShapes[col] ?? 'circle'
            return (
              <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
                <ColorSwatchPicker label="Color" value={color}
                  onChange={v => onSeriesColorsChange({ ...seriesColors, [col]: v })} />
                {chartType !== 'scatter' && (
                  <LineThicknessPicker label="Line" value={strokeWidth} presets={strokePresets}
                    onChange={v => onSeriesStrokeWidthsChange({ ...seriesStrokeWidths, [col]: v })} compact />
                )}
                {chartType !== 'bar' && (
                  <>
                    <MarkerSizePicker label="Marker size" value={markerSize} presets={markerSizePresets}
                      onChange={v => onSeriesMarkerSizesChange({ ...seriesMarkerSizes, [col]: v })} compact />
                    <MarkerShapePicker label="Marker shape" value={markerShape}
                      onChange={shape => onSeriesMarkerShapesChange({ ...seriesMarkerShapes, [col]: shape })} compact />
                  </>
                )}

                {/* ── Dose–response: visibility + fit results ─────────── */}
                {chartType === 'doseResponse' && (() => {
                  const hidePoints    = overrides.seriesHidePoints?.[col] ?? false
                  const hideErrorBars = overrides.seriesHideErrorBars?.[col] ?? false
                  const hideFit       = overrides.seriesHideFit?.[col] ?? false
                  const fit = doseResponseFits?.[col]
                  return (
                    <>
                      {/* Visibility toggles */}
                      <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Visibility</p>
                        <ToggleSwitch label="Show points" checked={!hidePoints}
                          onChange={v => onChange({ ...overrides, seriesHidePoints: { ...overrides.seriesHidePoints, [col]: !v } })} />
                        <ToggleSwitch label="Show error bars" checked={!hideErrorBars}
                          onChange={v => onChange({ ...overrides, seriesHideErrorBars: { ...overrides.seriesHideErrorBars, [col]: !v } })} />
                        <ToggleSwitch label="Show fit curve" checked={!hideFit}
                          onChange={v => onChange({ ...overrides, seriesHideFit: { ...overrides.seriesHideFit, [col]: !v } })} />
                      </div>

                      {/* Fit results */}
                      <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">4PL Fit Results</p>
                        {!fit ? (
                          <p className="text-[10px] text-slate-400">No data loaded.</p>
                        ) : fit.converged ? (
                          <>
                            <div className="grid grid-cols-[52px_1fr] gap-x-2 gap-y-1.5">
                              {([
                                ['IC50',   fmtIC50(fit.ic50)],
                                ['Hill',   fmtN(fit.hillSlope, 2)],
                                ['Top',    fmtN(fit.top, 1) + ' %'],
                                ['Bottom', fmtN(fit.bottom, 1) + ' %'],
                                ['R²',     fmtN(fit.r2, 4)],
                              ] as [string, string][]).map(([lbl, val]) => (
                                <div key={lbl} className="contents">
                                  <span className="text-[10px] text-slate-400 self-center">{lbl}</span>
                                  <span className="text-[11px] font-mono text-slate-700 self-center">{val}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <svg className="w-3 h-3 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                              <span className="text-[10px] text-green-600">Converged · {fit.nPoints} pts</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-start gap-1.5">
                            <svg className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            <span className="text-[10px] text-amber-700">{fit.reason}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>
            )
          })()}
        </div>
      )}

      {/* ── Axes ───────────────────────────────────────────────────── */}
      <SectionHeader title="Axes" open={openSection === 'axes'} onToggle={() => toggle('axes')} />
      {openSection === 'axes' && (
        <div className="space-y-2 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 flex-1">Width</span>
            <div className="flex gap-1">
              {[{ l: 'Thin', v: 1 }, { l: 'Med', v: 2 }, { l: 'Thick', v: 3 }].map(({ l, v }) => (
                <button key={l} onClick={() => set('axisWidth', v)}
                  className={`px-2 h-[18px] text-[9px] font-semibold rounded transition-colors ${axisWidth === v ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >{l}</button>
              ))}
            </div>
          </div>
          <ColorSwatchPicker label="Color" value={axisColor} onChange={v => set('axisColor', v)} />
          <ToggleSwitch label="Show grid" checked={showGrid} onChange={v => set('showGrid', v)} />
          <div className="border-t border-slate-100 pt-2 space-y-1.5">
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
            </div>
          </div>
        </div>
      )}

      {/* ── Labels ─────────────────────────────────────────────────── */}
      <SectionHeader title="Labels" open={openSection === 'labels'} onToggle={() => toggle('labels')} />
      {openSection === 'labels' && (
        <div className="space-y-2 pb-3">
          <CompactSizeRow label="Axis labels" value={titleSize} sm={10} md={13} lg={16} onChange={setTitleSize} />
          <CompactSizeRow label="Tick labels"  value={tickSize}  sm={9}  md={11} lg={13} onChange={setTickSize}  />
          <CompactSizeRow label="Annotations" value={overrides.annotationFontSize ?? 12} sm={10} md={14} lg={20} onChange={v => set('annotationFontSize', v)} />
          <ToggleSwitch label="Bold labels" checked={boldLabels} onChange={v => set('boldLabels', v)} />
        </div>
      )}

      {/* ── Legend ─────────────────────────────────────────────────── */}
      <SectionHeader title="Legend" open={openSection === 'legend'} onToggle={() => toggle('legend')} />
      {openSection === 'legend' && (
        <div className="space-y-2 pb-3">
          <ToggleSwitch label="Show legend" checked={showLegend} onChange={v => set('showLegend', v)} />
          {showLegend && (
            <>
              <div className="flex gap-1">
                {(['box', 'inline'] as const).map(mode => (
                  <button key={mode} onClick={() => set('legendMode', mode === 'box' ? undefined : 'inline')}
                    className={`flex-1 text-[10px] py-1 rounded border transition-colors ${(overrides.legendMode ?? 'box') === mode ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >{mode === 'box' ? 'Box' : 'Inline'}</button>
                ))}
              </div>
              {(overrides.legendMode ?? 'box') === 'box' && (
                <ToggleSwitch label="Cadre" checked={overrides.legendBg ?? true} onChange={v => set('legendBg', v)} />
              )}
              <CompactSizeRow label="Text size" value={legendFont} sm={9} md={12} lg={15} onChange={v => set('legendFontSize', v)} />
            </>
          )}
        </div>
      )}

      {/* ── Figure Size ─────────────────────────────────────────────── */}
      <SectionHeader title="Figure Size" open={openSection === 'figsize'} onToggle={() => toggle('figsize')} />
      {openSection === 'figsize' && (
        <div className="space-y-2 pb-3">
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
        </div>
      )}
    </div>
  )
}
