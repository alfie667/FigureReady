'use client'
import { useEffect, useState } from 'react'
import FileUploader from '@/components/FileUploader'
import ColumnSelector from '@/components/ColumnSelector'
import ChartTypeSelector from '@/components/ChartTypeSelector'
import StyleEditor from '@/components/StyleEditor'
import ChartPreview from '@/components/ChartPreview'
import MultiPanelPreview from '@/components/MultiPanelPreview'
import PanelLayoutSelector from '@/components/PanelLayoutSelector'
import Panel from '@/components/Panel'
import EmptyState from '@/components/EmptyState'
import Header from '@/components/Header'
import WelcomeModal from '@/components/WelcomeModal'
import FeedbackButton from '@/components/FeedbackButton'
import SaveTemplateModal from '@/components/SaveTemplateModal'
import TemplateSelector from '@/components/TemplateSelector'
import { chartStyles, type StyleName, type StyleOverrides } from '@/lib/chartStyles'
import type { ChartAnnotation } from '@/lib/annotations'
import { isErrorColumn, matchErrorColumn } from '@/lib/detectColumns'
import { loadDefaultStyle } from '@/lib/styleStorage'
import { saveUserTemplate, type ChartTemplate, type ChartType } from '@/lib/templateStorage'
import type { MarkerShape } from '@/lib/markerShapes'
import { trackUpload, trackChartCreated } from '@/lib/analytics'
import { type PanelConfig, type PanelLayout, getLayoutCount, PANEL_LABELS } from '@/lib/panels'
import { parseExcelFile } from '@/lib/parseExcel'

export default function AppPage() {
  const [columns, setColumns] = useState<string[]>([])
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [xCol, setXCol] = useState('')
  const [yCols, setYCols] = useState<string[]>([])
  const [chartType, setChartType] = useState<ChartType>('line')
  const styleName: StyleName = 'ACS'
  const [seriesNames, setSeriesNames] = useState<Record<string, string>>({})
  const [errorCols, setErrorCols] = useState<Record<string, string>>({})
  const [xAxisLabel, setXAxisLabel] = useState('')
  const [yAxisLabel, setYAxisLabel] = useState('')
  const [styleOverrides, setStyleOverrides] = useState<StyleOverrides>({})
  const [annotations, setAnnotations] = useState<ChartAnnotation[]>([])
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)

  // Multi-panel state
  const [isMultiPanel, setIsMultiPanel] = useState(false)
  const [panelLayout, setPanelLayout] = useState<PanelLayout>('2h')
  const [panels, setPanels] = useState<PanelConfig[]>([])
  const [activePanel, setActivePanel] = useState(0)
  const [panelAnnotations, setPanelAnnotations] = useState<ChartAnnotation[][]>([[], [], [], []])

  useEffect(() => {
    const saved = loadDefaultStyle()
    if (saved) setStyleOverrides(saved)
  }, [])

  // ── Multi-panel helpers ──────────────────────────────────────────────────────

  const updatePanel = (idx: number, patch: Partial<PanelConfig>) =>
    setPanels(prev => prev.map((p, i) => i === idx ? { ...p, ...patch } : p))

  const makeEmptyPanel = (id: string): PanelConfig => ({
    id, data: [], columns: [],
    xCol: '', yCols: [], chartType,
    styleOverrides: {}, seriesNames: {}, errorCols: {},
    xAxisLabel: '', yAxisLabel: '',
  })

  const toggleMultiPanel = () => {
    if (!isMultiPanel) {
      const count = getLayoutCount(panelLayout)
      setPanels(Array.from({ length: count }, (_, i) => makeEmptyPanel(PANEL_LABELS[i])))
      setActivePanel(0)
      setPanelAnnotations([[], [], [], []])
    }
    setIsMultiPanel(v => !v)
  }

  const handleLayoutChange = (newLayout: PanelLayout) => {
    const newCount = getLayoutCount(newLayout)
    setPanels(prev => {
      if (newCount > prev.length) {
        const extra = Array.from({ length: newCount - prev.length }, (_, i) =>
          makeEmptyPanel(PANEL_LABELS[prev.length + i])
        )
        return [...prev, ...extra]
      }
      return prev.slice(0, newCount)
    })
    if (activePanel >= newCount) setActivePanel(newCount - 1)
    setPanelLayout(newLayout)
  }

  // Per-panel file upload
  const handlePanelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const { columns: cols, rows } = await parseExcelFile(file)
      if (rows.length === 0) return
      const x = cols[0] ?? ''
      const yCandidates = cols.filter(c => c !== x && !isErrorColumn(c))
      const initialY = yCandidates[0] ? [yCandidates[0]] : cols[1] ? [cols[1]] : []
      const initialErrCols: Record<string, string> = {}
      initialY.forEach(y => {
        const match = matchErrorColumn(y, cols)
        if (match) initialErrCols[y] = match
      })
      updatePanel(activePanel, {
        data: rows, columns: cols,
        xCol: x, yCols: initialY,
        seriesNames: {}, errorCols: initialErrCols,
        xAxisLabel: x, yAxisLabel: initialY[0] ?? '',
        styleOverrides: {},
      })
    } catch { /* silently ignore parse errors */ }
  }

  // ── Derived current values (routes to active panel or global state) ──────────

  const currentPanel = isMultiPanel ? panels[activePanel] : null
  const currentColumns = currentPanel?.columns ?? columns
  const currentXCol = currentPanel?.xCol ?? xCol
  const currentYCols = currentPanel?.yCols ?? yCols
  const currentChartType = currentPanel?.chartType ?? chartType
  const currentSeriesNames = currentPanel?.seriesNames ?? seriesNames
  const currentErrorCols = currentPanel?.errorCols ?? errorCols
  const currentXAxisLabel = currentPanel?.xAxisLabel ?? xAxisLabel
  const currentYAxisLabel = currentPanel?.yAxisLabel ?? yAxisLabel
  const currentStyleOverrides = currentPanel?.styleOverrides ?? styleOverrides

  const setCurrentStyleOverrides = (v: StyleOverrides) => {
    if (isMultiPanel) updatePanel(activePanel, { styleOverrides: v })
    else setStyleOverrides(v)
  }
  const setCurrentChartType = (v: ChartType) => {
    if (isMultiPanel) updatePanel(activePanel, { chartType: v })
    else setChartType(v)
  }
  const setCurrentSeriesNames = (v: Record<string, string>) => {
    if (isMultiPanel) updatePanel(activePanel, { seriesNames: v })
    else setSeriesNames(v)
  }
  const setCurrentErrorCols = (v: Record<string, string>) => {
    if (isMultiPanel) updatePanel(activePanel, { errorCols: v })
    else setErrorCols(v)
  }
  const setCurrentXAxisLabel = (v: string) => {
    if (isMultiPanel) updatePanel(activePanel, { xAxisLabel: v })
    else setXAxisLabel(v)
  }
  const setCurrentYAxisLabel = (v: string) => {
    if (isMultiPanel) updatePanel(activePanel, { yAxisLabel: v })
    else setYAxisLabel(v)
  }
  const setCurrentXYCols = (x: string, y: string[]) => {
    if (isMultiPanel) updatePanel(activePanel, { xCol: x, yCols: y })
    else { setXCol(x); setYCols(y) }
  }

  // ── Data handlers ─────────────────────────────────────────────────────────────

  const handleData = (cols: string[], rows: Record<string, unknown>[]) => {
    setColumns(cols)
    setData(rows)
    const x = cols[0] ?? ''
    const yCandidates = cols.filter(c => c !== x && !isErrorColumn(c))
    const initialY = yCandidates[0] ? [yCandidates[0]] : cols[1] ? [cols[1]] : []
    setXCol(x)
    setYCols(initialY)
    setSeriesNames({})

    const initialErrorCols: Record<string, string> = {}
    initialY.forEach(y => {
      const match = matchErrorColumn(y, cols)
      if (match) initialErrorCols[y] = match
    })
    setErrorCols(initialErrorCols)
    setXAxisLabel(x)
    setYAxisLabel(initialY[0] ?? '')
    setStyleOverrides({})
    setAnnotations([])
    setIsMultiPanel(false)
    setPanels([])

    trackUpload()
    trackChartCreated()
  }

  const reset = () => {
    setColumns([])
    setData([])
    setXCol('')
    setYCols([])
    setSeriesNames({})
    setErrorCols({})
    setXAxisLabel('')
    setYAxisLabel('')
    setStyleOverrides({})
    setAnnotations([])
    setIsMultiPanel(false)
    setPanels([])
  }

  const focusUpload = () => {
    document.getElementById('file-upload')?.click()
  }

  const handleSaveTemplate = (name: string) => {
    const base = chartStyles[styleName]
    saveUserTemplate({
      name, chartType, overrides: styleOverrides,
      seriesColorsList: yCols.map((col, i) =>
        styleOverrides.seriesColors?.[col] ?? base.colors[i % base.colors.length]
      ),
      seriesStrokeWidthsList: yCols.map(col =>
        styleOverrides.seriesStrokeWidths?.[col] ?? base.strokeWidth
      ),
      seriesMarkerSizesList: yCols.map(col =>
        styleOverrides.seriesMarkerSizes?.[col] ?? base.dotRadius
      ),
      seriesMarkerShapesList: yCols.map(col =>
        (styleOverrides.seriesMarkerShapes?.[col] ?? 'circle') as MarkerShape
      ),
    })
  }

  const handleApplyTemplate = (template: ChartTemplate) => {
    setChartType(template.chartType)
    const newSeriesColors: Record<string, string> = {}
    const newSeriesStrokeWidths: Record<string, number> = {}
    const newSeriesMarkerSizes: Record<string, number> = {}
    const newSeriesMarkerShapes: Record<string, MarkerShape> = {}

    yCols.forEach((col, i) => {
      if (template.seriesColorsList?.[i] != null)
        newSeriesColors[col] = template.seriesColorsList[i]
      if (template.seriesStrokeWidthsList?.[i] != null)
        newSeriesStrokeWidths[col] = template.seriesStrokeWidthsList[i]
      if (template.seriesMarkerSizesList?.[i] != null)
        newSeriesMarkerSizes[col] = template.seriesMarkerSizesList[i]
      if (template.seriesMarkerShapesList?.[i] != null)
        newSeriesMarkerShapes[col] = template.seriesMarkerShapesList[i]
    })

    setStyleOverrides({
      ...template.overrides,
      ...(Object.keys(newSeriesColors).length && { seriesColors: newSeriesColors }),
      ...(Object.keys(newSeriesStrokeWidths).length && { seriesStrokeWidths: newSeriesStrokeWidths }),
      ...(Object.keys(newSeriesMarkerSizes).length && { seriesMarkerSizes: newSeriesMarkerSizes }),
      ...(Object.keys(newSeriesMarkerShapes).length && { seriesMarkerShapes: newSeriesMarkerShapes }),
    })
  }

  const ready = xCol && yCols.length > 0 && data.length > 0

  return (
    <div className="min-h-screen lg:h-screen bg-white flex flex-col overflow-hidden">
      <WelcomeModal />
      {saveTemplateOpen && (
        <SaveTemplateModal
          onSave={handleSaveTemplate}
          onClose={() => setSaveTemplateOpen(false)}
        />
      )}
      <Header hasData={columns.length > 0} onReset={reset} />

      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
        <aside className="w-full lg:w-[380px] lg:shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 lg:overflow-y-auto bg-[#f5f3ff]">
          <Panel
            id="data"
            title="Data"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            }
          >
            <FileUploader onData={handleData} />
          </Panel>

          {columns.length > 0 && (
            <Panel
              id="config"
              title="Settings"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m9 6h3.75M16.5 12a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 12H13.5m-9.75 6h9.75M13.5 18a1.5 1.5 0 1003 0m-3 0a1.5 1.5 0 003 0m3.75 0H17.25" />
                </svg>
              }
            >
              <div className="space-y-5">

                {/* Multi-panel toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Multi-panel figure</p>
                    <p className="text-[11px] text-slate-400">Combine charts in one figure</p>
                  </div>
                  <button
                    onClick={toggleMultiPanel}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${isMultiPanel ? 'bg-[#7c3aed]' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isMultiPanel ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {isMultiPanel && (
                  <div className="space-y-3 rounded-2xl bg-[#ede9fe] p-3">
                    {/* Layout */}
                    <div>
                      <p className="text-xs font-medium text-[#5b21b6] mb-2">Layout</p>
                      <PanelLayoutSelector value={panelLayout} onChange={handleLayoutChange} />
                    </div>

                    {/* Panel tabs */}
                    <div>
                      <p className="text-xs font-medium text-[#5b21b6] mb-2">Editing panel</p>
                      <div className="flex gap-1.5">
                        {panels.map((p, i) => (
                          <button
                            key={p.id}
                            onClick={() => setActivePanel(i)}
                            className={`w-9 h-9 text-sm font-bold rounded-xl transition-all ${i === activePanel ? 'bg-[#7c3aed] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                          >
                            {p.id}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Per-panel file upload */}
                    <div>
                      <p className="text-xs font-medium text-[#5b21b6] mb-2">
                        Excel file — Panel {panels[activePanel]?.id}
                      </p>
                      <label className="flex items-center gap-2 w-full py-2 px-3 rounded-xl bg-white border border-[#c4b5fd] cursor-pointer hover:bg-violet-50 transition-colors">
                        <svg className="w-4 h-4 text-[#7c3aed] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="text-xs text-slate-600 flex-1 truncate">
                          {panels[activePanel]?.columns.length > 0
                            ? `${panels[activePanel].columns.length} columns loaded`
                            : 'Upload a .xlsx file…'}
                        </span>
                        <input
                          type="file"
                          accept=".xlsx"
                          className="hidden"
                          onChange={handlePanelFileChange}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Column selector — only show when current panel has data */}
                {currentColumns.length > 0 && (
                  <>
                    <TemplateSelector onApply={handleApplyTemplate} />
                    <ColumnSelector
                      columns={currentColumns}
                      xCol={currentXCol}
                      yCols={currentYCols}
                      seriesNames={currentSeriesNames}
                      errorCols={currentErrorCols}
                      xAxisLabel={currentXAxisLabel}
                      yAxisLabel={currentYAxisLabel}
                      chartType={currentChartType}
                      seriesColors={currentStyleOverrides.seriesColors ?? {}}
                      seriesStrokeWidths={currentStyleOverrides.seriesStrokeWidths ?? {}}
                      seriesMarkerSizes={currentStyleOverrides.seriesMarkerSizes ?? {}}
                      seriesMarkerShapes={currentStyleOverrides.seriesMarkerShapes ?? {}}
                      yAxisAssignment={currentStyleOverrides.yAxisAssignment ?? {}}
                      defaultColors={chartStyles[styleName].colors}
                      defaultStrokeWidth={chartStyles[styleName].strokeWidth}
                      defaultMarkerSize={chartStyles[styleName].dotRadius}
                      onChange={setCurrentXYCols}
                      onSeriesNamesChange={setCurrentSeriesNames}
                      onErrorColsChange={setCurrentErrorCols}
                      onXAxisLabelChange={setCurrentXAxisLabel}
                      onYAxisLabelChange={setCurrentYAxisLabel}
                      onSeriesColorsChange={(colors) => setCurrentStyleOverrides({ ...currentStyleOverrides, seriesColors: colors })}
                      onSeriesStrokeWidthsChange={(widths) => setCurrentStyleOverrides({ ...currentStyleOverrides, seriesStrokeWidths: widths })}
                      onSeriesMarkerSizesChange={(sizes) => setCurrentStyleOverrides({ ...currentStyleOverrides, seriesMarkerSizes: sizes })}
                      onSeriesMarkerShapesChange={(shapes) => setCurrentStyleOverrides({ ...currentStyleOverrides, seriesMarkerShapes: shapes })}
                      onYAxisAssignmentChange={(assignment) => setCurrentStyleOverrides({ ...currentStyleOverrides, yAxisAssignment: assignment })}
                    />
                    <div className="flex flex-wrap gap-6">
                      <ChartTypeSelector value={currentChartType} onChange={setCurrentChartType} />
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500 w-14 shrink-0">X Scale</span>
                        <div className="flex gap-1.5">
                          {(['linear', 'log', 'ln'] as const).map(sc => {
                            const active = (currentStyleOverrides.xScale ?? 'linear') === sc
                            return (
                              <button key={sc}
                                onClick={() => setCurrentStyleOverrides({ ...currentStyleOverrides, xScale: sc })}
                                className={`px-3.5 py-1 text-xs rounded-full border-0 transition-colors ${active ? 'bg-[#7c3aed] text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
                                {sc === 'linear' ? 'Linear' : sc === 'log' ? 'Log' : 'Ln'}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500 w-14 shrink-0">Y Scale</span>
                        <div className="flex gap-1.5">
                          {(['linear', 'log', 'ln'] as const).map(sc => {
                            const active = (currentStyleOverrides.yScale ?? 'linear') === sc
                            return (
                              <button key={sc}
                                onClick={() => setCurrentStyleOverrides({ ...currentStyleOverrides, yScale: sc })}
                                className={`px-3.5 py-1 text-xs rounded-full border-0 transition-colors ${active ? 'bg-[#7c3aed] text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
                                {sc === 'linear' ? 'Linear' : sc === 'log' ? 'Log' : 'Ln'}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Panel>
          )}

          {ready && !isMultiPanel && (
            <Panel
              id="style"
              title="Style"
              defaultOpen={false}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              }
            >
              <StyleEditor
                baseStyle={chartStyles[styleName]}
                overrides={styleOverrides}
                hasMultipleSeries={yCols.length > 1}
                onChange={setStyleOverrides}
              />
            </Panel>
          )}
        </aside>

        <main className="flex-1 flex flex-col lg:overflow-hidden">
          {isMultiPanel && panels.length > 0 ? (
            <MultiPanelPreview
              panels={panels}
              layout={panelLayout}
              activePanel={activePanel}
              styleName={styleName}
              panelAnnotations={panelAnnotations}
              onAnnotationsChange={(idx, anns) =>
                setPanelAnnotations(prev => prev.map((a, i) => i === idx ? anns : a))
              }
              onStyleChange={(idx, patch) =>
                updatePanel(idx, { styleOverrides: { ...panels[idx].styleOverrides, ...patch } })
              }
              onPanelClick={setActivePanel}
              onSaveTemplate={() => setSaveTemplateOpen(true)}
            />
          ) : ready ? (
            <ChartPreview
              data={data}
              xCol={xCol}
              yCols={yCols}
              seriesNames={seriesNames}
              errorCols={errorCols}
              xAxisLabel={xAxisLabel}
              yAxisLabel={yAxisLabel}
              chartType={chartType}
              styleName={styleName}
              styleOverrides={styleOverrides}
              annotations={annotations}
              onAnnotationsChange={setAnnotations}
              onStyleChange={(patch) => setStyleOverrides(prev => ({ ...prev, ...patch }))}
              onSaveTemplate={() => setSaveTemplateOpen(true)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#f5f3ff]">
              <EmptyState onUploadClick={focusUpload} />
            </div>
          )}
        </main>
      </div>

      <FeedbackButton />
    </div>
  )
}
