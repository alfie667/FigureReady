'use client'
import { useEffect, useRef, useState } from 'react'
import FileUploader from '@/components/FileUploader'
import ColumnSelector from '@/components/ColumnSelector'
import ChartTypeSelector from '@/components/ChartTypeSelector'
import StyleEditor from '@/components/StyleEditor'
import ChartPreview, { type ChartPreviewHandle } from '@/components/ChartPreview'
import MultiPanelPreview, { type MultiPanelPreviewHandle } from '@/components/MultiPanelPreview'
import PanelLayoutSelector from '@/components/PanelLayoutSelector'
import EmptyState from '@/components/EmptyState'
import Header from '@/components/Header'
import FeedbackButton from '@/components/FeedbackButton'
import SaveTemplateModal from '@/components/SaveTemplateModal'
import TemplateSelector from '@/components/TemplateSelector'
import { chartStyles, type StyleName, type StyleOverrides } from '@/lib/chartStyles'
import type { ChartAnnotation } from '@/lib/annotations'
import { isErrorColumn, matchErrorColumn } from '@/lib/detectColumns'
import { loadDefaultStyle } from '@/lib/styleStorage'
import { saveUserTemplate, type ChartTemplate, type ChartType } from '@/lib/templateStorage'
import type { MarkerShape } from '@/lib/markerShapes'
import { trackUpload, trackChartCreated, trackSampleDataLoaded, trackAppOpen, trackDemoFigureCreated } from '@/lib/analytics'
import { SAMPLE_ROWS } from '@/components/SampleDataButton'
import { isProUser } from '@/lib/usageLimit'
import PaywallModal from '@/components/PaywallModal'
import { type PanelConfig, type PanelLayout, getLayoutCount, PANEL_LABELS } from '@/lib/panels'
import { parseExcelFile } from '@/lib/parseExcel'
import { LineThicknessPicker, ToggleSwitch, type NumericPreset } from '@/components/StyleControls'

const inputCls = "w-full min-w-0 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
const insetLinePresets: NumericPreset[] = [
  { label: 'Thin', value: 0.8 },
  { label: 'Med', value: 1.5 },
  { label: 'Thick', value: 2.5 },
]

// ── Icon bar tab definitions ─────────────────────────────────────────────────

const SIDEBAR_TABS = [
  {
    id: 'data',
    label: 'Data',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    id: 'style',
    label: 'Style',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    id: 'journal',
    label: 'Journal',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    id: 'annotate',
    label: 'Annotate',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    id: 'inset',
    label: 'Inset',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
      </svg>
    ),
  },
]

const PANEL_LABELS_MAP: Record<string, string> = {
  data: 'Data',
  style: 'Style',
  journal: 'Journal',
  annotate: 'Annotate',
  inset: 'Inset Figure',
  templates: 'Templates',
}

export default function AppPage() {
  const [isDemoMode, setIsDemoMode] = useState(false)
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
  const [drawInsetMode, setDrawInsetMode] = useState(false)

  const chartPreviewRef = useRef<ChartPreviewHandle>(null)
  const multiPanelRef = useRef<MultiPanelPreviewHandle>(null)
  const [multiPanelPaywallOpen, setMultiPanelPaywallOpen] = useState(false)

  const handleExportSVG = () => chartPreviewRef.current?.triggerExport('svg')
  const handleExportPDF = () => chartPreviewRef.current?.triggerExport('pdf')
  const handleExportPNG = () => {
    if (isMultiPanel) {
      if (isProUser()) multiPanelRef.current?.exportPNG()
      else setMultiPanelPaywallOpen(true)
    } else {
      chartPreviewRef.current?.triggerExport('png')
    }
  }

  // Active sidebar panel — closed by default on mobile
  const [activeSidePanel, setActiveSidePanel] = useState<string | null>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? null : 'data'
  )
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false)
  const [panelWidth, setPanelWidth] = useState(280)
  const panelResizeRef = useRef(false)

  // Multi-panel state
  const [isMultiPanel, setIsMultiPanel] = useState(false)
  const [panelLayout, setPanelLayout] = useState<PanelLayout>('2h')
  const [panels, setPanels] = useState<PanelConfig[]>([])
  const [activePanel, setActivePanel] = useState(0)
  const [panelAnnotations, setPanelAnnotations] = useState<ChartAnnotation[][]>([[], [], [], []])

  useEffect(() => {
    trackAppOpen()
    const saved = loadDefaultStyle()
    if (saved) setStyleOverrides(saved)
  }, [])

  // ── Share via URL ─────────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const encoded = params.get('fig')
      if (!encoded) return
      const json = decodeURIComponent(escape(atob(encoded)))
      const cfg = JSON.parse(json)
      if (cfg.chartType)     setChartType(cfg.chartType)
      if (cfg.xAxisLabel)    setXAxisLabel(cfg.xAxisLabel)
      if (cfg.yAxisLabel)    setYAxisLabel(cfg.yAxisLabel)
      if (cfg.xCol)          setXCol(cfg.xCol)
      if (cfg.yCols)         setYCols(cfg.yCols)
      if (cfg.seriesNames)   setSeriesNames(cfg.seriesNames)
      if (cfg.errorCols)     setErrorCols(cfg.errorCols)
      if (cfg.styleOverrides) setStyleOverrides(cfg.styleOverrides)
      if (cfg.annotations)   setAnnotations(cfg.annotations)
    } catch { /* ignore malformed URLs */ }
  }, [])

  const handleShareLink = () => {
    const cfg = {
      chartType, xAxisLabel, yAxisLabel,
      xCol, yCols, seriesNames, errorCols,
      styleOverrides, annotations,
    }
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(cfg))))
    const url = `${window.location.origin}${window.location.pathname}?fig=${encoded}`
    navigator.clipboard.writeText(url)
  }

  // ── Undo history (Ctrl+Z) ────────────────────────────────────────────────────

  type HistorySnap = { styleOverrides: StyleOverrides; annotations: ChartAnnotation[] }
  const historyRef = useRef<HistorySnap[]>([])
  const historyIndexRef = useRef(-1)
  const isRestoringRef = useRef(false)
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMultiPanelRef = useRef(isMultiPanel)
  const styleOverridesSnapRef = useRef(styleOverrides)
  const annotationsSnapRef = useRef(annotations)
  useEffect(() => { isMultiPanelRef.current = isMultiPanel }, [isMultiPanel])
  useEffect(() => { styleOverridesSnapRef.current = styleOverrides }, [styleOverrides])
  useEffect(() => { annotationsSnapRef.current = annotations }, [annotations])

  // Debounced history push — 400 ms after last change
  useEffect(() => {
    if (isMultiPanel || isRestoringRef.current) return
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current)
    historyTimerRef.current = setTimeout(() => {
      const snap: HistorySnap = { styleOverrides, annotations }
      const cur = historyRef.current[historyIndexRef.current]
      if (cur && JSON.stringify(cur) === JSON.stringify(snap)) return
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
      historyRef.current.push(snap)
      if (historyRef.current.length > 50) historyRef.current.shift()
      else historyIndexRef.current++
    }, 400)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleOverrides, annotations, isMultiPanel])

  // Ctrl+Z handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'z' || e.shiftKey) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (isMultiPanelRef.current) return
      e.preventDefault()
      // Flush any pending debounce — commit current state before stepping back
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current)
        historyTimerRef.current = null
        const snap: HistorySnap = { styleOverrides: styleOverridesSnapRef.current, annotations: annotationsSnapRef.current }
        const cur = historyRef.current[historyIndexRef.current]
        if (!cur || JSON.stringify(cur) !== JSON.stringify(snap)) {
          historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
          historyRef.current.push(snap)
          if (historyRef.current.length <= 50) historyIndexRef.current++
          else historyRef.current.shift()
        }
      }
      if (historyIndexRef.current > 0) {
        historyIndexRef.current--
        const prev = historyRef.current[historyIndexRef.current]
        isRestoringRef.current = true
        setStyleOverrides(prev.styleOverrides)
        setAnnotations(prev.annotations)
        requestAnimationFrame(() => { isRestoringRef.current = false })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
    setIsDemoMode(false)

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
    setIsDemoMode(false)
  }

  const focusUpload = () => {
    document.getElementById('file-upload')?.click()
  }

  const handleSampleData = () => {
    const cols = Object.keys(SAMPLE_ROWS[0])
    handleData(cols, SAMPLE_ROWS)
    setIsDemoMode(true)
    trackSampleDataLoaded()
    trackDemoFigureCreated()
  }

  const handleFileFromBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const { columns: cols, rows } = await parseExcelFile(file)
      if (rows.length > 0) handleData(cols, rows)
    } catch { /* silently ignore parse errors */ }
  }

  // Auto-load demo when arriving from landing page CTA (?demo=1).
  // URL param is cleared immediately — no double-fire on refresh or back-navigation.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('demo') !== '1') return
    window.history.replaceState({}, '', window.location.pathname)
    handleSampleData()
  }, [])

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

  // ── Secondary panel content ───────────────────────────────────────────────────

  const renderPanelContent = () => {
    switch (activeSidePanel) {

      case 'data':
        return (
          <div className="space-y-5">
            <FileUploader onData={handleData} />

            {columns.length > 0 && (
              <div className="space-y-5">
                {/* Multi-panel toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Multi-panel figure</p>
                    <p className="text-[11px] text-slate-400">Combine charts in one figure</p>
                  </div>
                  <button
                    onClick={toggleMultiPanel}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${isMultiPanel ? 'bg-[#2563eb]' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isMultiPanel ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {isMultiPanel && (
                  <div className="space-y-3 rounded-2xl bg-[#dbeafe] p-3">
                    <div>
                      <p className="text-xs font-medium text-[#1d4ed8] mb-2">Layout</p>
                      <PanelLayoutSelector value={panelLayout} onChange={handleLayoutChange} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#1d4ed8] mb-2">Editing panel</p>
                      <div className="flex gap-1.5">
                        {panels.map((p, i) => (
                          <button
                            key={p.id}
                            onClick={() => setActivePanel(i)}
                            className={`w-9 h-9 text-sm font-bold rounded-xl transition-all ${i === activePanel ? 'bg-[#2563eb] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                          >
                            {p.id}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#1d4ed8] mb-2">
                        Excel file — Panel {panels[activePanel]?.id}
                      </p>
                      <label className="flex items-center gap-2 w-full py-2 px-3 rounded-xl bg-white border border-[#93c5fd] cursor-pointer hover:bg-violet-50 transition-colors">
                        <svg className="w-4 h-4 text-[#2563eb] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                {currentColumns.length > 0 && (
                  <>
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
                                className={`px-3.5 py-1 text-xs rounded-full border-0 transition-colors ${active ? 'bg-[#2563eb] text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
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
                                className={`px-3.5 py-1 text-xs rounded-full border-0 transition-colors ${active ? 'bg-[#2563eb] text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
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
            )}
          </div>
        )

      case 'style':
        return ready && !isMultiPanel ? (
          <StyleEditor
            baseStyle={chartStyles[styleName]}
            overrides={styleOverrides}
            hasMultipleSeries={yCols.length > 1}
            columns={columns.filter(c => c !== xCol)}
            onChange={setStyleOverrides}
          />
        ) : (
          <p className="text-xs text-slate-400">Load data first to edit styles.</p>
        )

      case 'journal':
        return (
          <div className="space-y-5">
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5">
              <p className="text-xs font-semibold text-[#1d4ed8]">ACS style active</p>
              <p className="text-[11px] text-blue-500 mt-0.5">American Chemical Society format</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Figure width</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={300}
                  max={1600}
                  step={50}
                  value={styleOverrides.figureWidth ?? 700}
                  onChange={e => {
                    const v = Number(e.target.value)
                    if (v >= 300 && v <= 1600) setStyleOverrides(prev => ({ ...prev, figureWidth: v }))
                  }}
                  className={inputCls}
                />
                <span className="text-[10px] text-slate-400 shrink-0">px</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] text-slate-400">More journal presets coming soon — Nature, Cell, JACS</p>
            </div>
          </div>
        )

      case 'annotate':
        return (
          <div className="space-y-4">
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5">
              <p className="text-xs font-semibold text-[#1d4ed8]">Annotation tools expanded</p>
              <p className="text-[11px] text-blue-500 mt-0.5">Use the toolbar above the chart to add annotations</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Available tools</p>
              {[
                { label: 'Lines & arrows', desc: 'Straight, dashed, double-headed' },
                { label: 'Shapes', desc: 'Rectangle and ellipse overlays' },
                { label: 'Text', desc: 'Click on the chart to place text' },
                { label: 'Symbols', desc: 'α β γ δ ± × ∞ and more' },
              ].map(tool => (
                <div key={tool.label} className="flex flex-col px-3 py-2 rounded-lg bg-white border border-slate-100">
                  <span className="text-xs font-medium text-slate-700">{tool.label}</span>
                  <span className="text-[11px] text-slate-400">{tool.desc}</span>
                </div>
              ))}
            </div>
            {annotations.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{annotations.length} annotation{annotations.length !== 1 ? 's' : ''}</p>
                <button
                  onClick={() => setAnnotations([])}
                  className="w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Clear all annotations
                </button>
              </div>
            )}
          </div>
        )

      case 'inset':
        return ready && !isMultiPanel && typeof data[0]?.[xCol] === 'number' ? (
          <div className="space-y-4">
            <button
              onClick={() => setDrawInsetMode(v => !v)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
                drawInsetMode
                  ? 'bg-[#2563eb] text-white border-[#2563eb]'
                  : styleOverrides.insetDefined
                    ? 'bg-blue-50 text-[#2563eb] border-blue-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {drawInsetMode ? 'Click & drag on chart…' : styleOverrides.insetDefined ? 'Redefine inset zone' : 'Add inset figure'}
            </button>

            {(() => {
              const so = styleOverrides
              const upd = (patch: Partial<StyleOverrides>) => setStyleOverrides(prev => ({ ...prev, ...patch }))
              const axisColor = so.axisColor ?? chartStyles[styleName].axisColor
              return (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="grid grid-cols-2 gap-x-3">
                    <div>
                      <p className="text-[10px] text-slate-400 mb-1">Size</p>
                      <div className="flex items-center gap-1">
                        <input type="number" min={10} max={80} value={so.insetSizePct ?? 35}
                          onChange={e => { const v = Number(e.target.value); if (v >= 10 && v <= 80) upd({ insetSizePct: v }) }}
                          className={inputCls} />
                        <span className="text-[10px] text-slate-400 shrink-0">%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-1">Tick font</p>
                      <div className="flex items-center gap-1">
                        <input type="number" min={5} max={14} value={so.insetTickFontSize ?? 7}
                          onChange={e => { const v = Number(e.target.value); if (v >= 5 && v <= 14) upd({ insetTickFontSize: v }) }}
                          className={inputCls} />
                        <span className="text-[10px] text-slate-400 shrink-0">pt</span>
                      </div>
                    </div>
                  </div>

                  <LineThicknessPicker label="Line width" value={so.insetLineWidth ?? 1.2} presets={insetLinePresets} onChange={v => upd({ insetLineWidth: v })} />

                  <div className="flex gap-4">
                    <ToggleSwitch label="Box frame" checked={so.insetShowFrame ?? false} onChange={v => upd({ insetShowFrame: v })} />
                    <ToggleSwitch label="Zoom rect" checked={so.insetShowZoomRect ?? false} onChange={v => upd({ insetShowZoomRect: v })} />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <ToggleSwitch label="Border" checked={so.insetBorder ?? false} onChange={v => upd({ insetBorder: v })} />
                    {(so.insetBorder ?? false) && (
                      <>
                        <input type="color" value={so.insetBorderColor ?? axisColor}
                          onChange={e => upd({ insetBorderColor: e.target.value })}
                          className="w-6 h-5 rounded cursor-pointer border border-slate-200 ml-1" />
                        <input type="number" min={0.5} max={4} step={0.5} value={so.insetBorderWidth ?? 1.5}
                          onChange={e => upd({ insetBorderWidth: Number(e.target.value) })}
                          className={`${inputCls} w-14`} />
                        <span className="text-[10px] text-slate-400 shrink-0">px</span>
                      </>
                    )}
                  </div>

                  {so.insetDefined && (
                    <p className="text-[10px] text-slate-400 italic">Press Del to remove</p>
                  )}
                </div>
              )
            })()}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Load numeric data to add an inset figure.</p>
        )

      case 'templates':
        return (
          <div className="space-y-4">
            <TemplateSelector onApply={handleApplyTemplate} />
            <button
              onClick={() => setSaveTemplateOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              Save current style as template
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {saveTemplateOpen && (
        <SaveTemplateModal
          onSave={handleSaveTemplate}
          onClose={() => setSaveTemplateOpen(false)}
        />
      )}
      <Header
        hasData={columns.length > 0}
        onReset={reset}
        onExportSVG={handleExportSVG}
        onExportPDF={handleExportPDF}
        onExportPNG={handleExportPNG}
        onShareLink={handleShareLink}
      />

      {isDemoMode && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between gap-4 shrink-0">
          <p className="text-xs text-blue-700 min-w-0">
            <span className="font-semibold">You&apos;re editing a sample dataset.</span>{' '}
            <span className="hidden sm:inline">Upload your own Excel file to create figures from your own data.</span>
          </p>
          <label className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-full transition-colors shadow-sm cursor-pointer whitespace-nowrap">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload your Excel
            <input type="file" accept=".xlsx" className="sr-only" onChange={handleFileFromBanner} />
          </label>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">

        {/* Icon bar — 72px wide, Figma-style — hidden on mobile */}
        <nav className="hidden md:flex w-[72px] shrink-0 border-r border-slate-100 flex-col items-center py-3 gap-0.5 bg-white">
          {SIDEBAR_TABS.flatMap((tab, i) => {
            const sep = (i === 2 || i === 4)
              ? [<div key={`sep-${i}`} className="w-9 h-px bg-slate-100 my-1.5 shrink-0" />]
              : []
            const btn = (
              <button
                key={tab.id}
                onClick={() => setActiveSidePanel(p => p === tab.id ? null : tab.id)}
                className={`w-[58px] h-[60px] rounded-2xl flex flex-col items-center justify-center gap-[5px] transition-all duration-150 select-none group ${
                  activeSidePanel === tab.id
                    ? 'bg-[#2563eb] text-white shadow-md shadow-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={tab.label}
              >
                <div className="w-[22px] h-[22px] shrink-0">{tab.icon}</div>
                <span className={`text-[9.5px] font-semibold leading-none tracking-wide ${
                  activeSidePanel === tab.id ? 'text-white/80' : ''
                }`}>{tab.label}</span>
              </button>
            )
            return [...sep, btn]
          })}
        </nav>

        {/* Secondary panel — resizable, desktop only */}
        {activeSidePanel && (
          <aside
            style={{ width: panelWidth }}
            className="hidden md:flex shrink-0 border-r border-slate-200 flex-col overflow-hidden bg-white relative"
          >
            <div className="px-4 pt-4 pb-3 border-b border-slate-100 shrink-0 flex items-center gap-2.5">
              <div className="w-1.5 h-5 rounded-full bg-[#2563eb] shrink-0" />
              <h2 className="text-[13px] font-bold text-slate-800 tracking-tight">
                {PANEL_LABELS_MAP[activeSidePanel] ?? activeSidePanel}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {renderPanelContent()}
            </div>
            {/* Drag handle on right edge */}
            <div
              className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-[#2563eb]/20 transition-colors z-10"
              onPointerDown={e => {
                e.preventDefault()
                panelResizeRef.current = true
                const startX = e.clientX
                const startW = panelWidth
                const onMove = (ev: PointerEvent) => {
                  if (!panelResizeRef.current) return
                  const next = Math.max(220, Math.min(520, startW + ev.clientX - startX))
                  setPanelWidth(next)
                }
                const onUp = () => {
                  panelResizeRef.current = false
                  window.removeEventListener('pointermove', onMove)
                  window.removeEventListener('pointerup', onUp)
                }
                window.addEventListener('pointermove', onMove)
                window.addEventListener('pointerup', onUp)
              }}
            />
          </aside>
        )}

        {/* Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Figure zone — always visible, grows to fill space above inline panel */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-[200px] md:min-h-0">
            {isMultiPanel && panels.length > 0 ? (
              <MultiPanelPreview
                ref={multiPanelRef}
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
                ref={chartPreviewRef}
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
                onStyleChange={(patch) => {
                  setStyleOverrides(prev => ({ ...prev, ...patch }))
                  if (patch.insetDefined === false) setDrawInsetMode(false)
                }}
                onSaveTemplate={() => setSaveTemplateOpen(true)}
                drawInsetActive={drawInsetMode}
                onDrawInsetActiveChange={setDrawInsetMode}
                annotOpen={activeSidePanel === 'annotate'}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#eff6ff]">
                <EmptyState onUploadClick={focusUpload} onSampleClick={handleSampleData} />
              </div>
            )}
          </div>

          {/* Editor-only compact legend strip — mobile only, never affects exports */}
          {ready && currentYCols.length > 0 && (
            <div className="md:hidden shrink-0 flex items-center gap-3 px-3 py-1.5 border-t border-slate-100 bg-white overflow-x-auto no-scrollbar">
              {currentYCols.map((col, i) => {
                const color = currentStyleOverrides.seriesColors?.[col] ?? chartStyles[styleName].colors[i % chartStyles[styleName].colors.length]
                const label = currentSeriesNames[col] ?? col
                return (
                  <div key={col} className="flex items-center gap-1.5 shrink-0" title={label}>
                    <span className="w-5 h-0.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                    <span className="text-[10px] font-medium text-slate-600 max-w-[80px] truncate leading-none">{label}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Mobile inline settings panel — docked below figure, never overlaps it */}
          {mobilePanelOpen && activeSidePanel && (
            <div
              className="md:hidden shrink-0 flex flex-col bg-white border-t border-slate-200 overflow-hidden"
              style={{ maxHeight: '40vh' }}
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-[#2563eb] shrink-0" />
                  <h2 className="text-sm font-bold text-slate-800">{PANEL_LABELS_MAP[activeSidePanel] ?? activeSidePanel}</h2>
                </div>
                <button
                  onClick={() => setMobilePanelOpen(false)}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain overflow-x-hidden p-3 space-y-3">
                {renderPanelContent()}
              </div>
            </div>
          )}

          {/* Spacer: reserves exact height for fixed bottom nav + iOS safe-area-inset-bottom */}
          <div
            className="md:hidden shrink-0"
            style={{ height: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}
            aria-hidden="true"
          />
        </main>

      </div>

      {/* ── Mobile bottom tab bar ─────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-slate-200 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around px-1 py-1">
          {SIDEBAR_TABS.map(tab => {
            const active = activeSidePanel === tab.id && mobilePanelOpen
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (active) { setMobilePanelOpen(false); return }
                  setActiveSidePanel(tab.id)
                  setMobilePanelOpen(true)
                }}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-colors min-w-0 flex-1 ${
                  active ? 'text-[#2563eb]' : 'text-slate-500'
                }`}
              >
                <div className="w-5 h-5 shrink-0">{tab.icon}</div>
                <span className="text-[9px] font-semibold leading-none truncate w-full text-center">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <FeedbackButton />

      {multiPanelPaywallOpen && (
        <PaywallModal
          mode="blocked"
          previewDataUrl={null}
          onClose={() => setMultiPanelPaywallOpen(false)}
        />
      )}
    </div>
  )
}
