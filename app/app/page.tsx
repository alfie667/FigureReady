'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FileSpreadsheet, LayoutTemplate, LineChart, PenLine } from 'lucide-react'
import FileUploader from '@/components/FileUploader'
import ColumnSelector from '@/components/ColumnSelector'
import ChartTypeSelector from '@/components/ChartTypeSelector'
import StyleEditor from '@/components/StyleEditor'
import ChartPreview, { type ChartPreviewHandle } from '@/components/ChartPreview'
import MultiPanelPreview, { type MultiPanelPreviewHandle } from '@/components/MultiPanelPreview'
import PanelLayoutSelector from '@/components/PanelLayoutSelector'
import EmptyState from '@/components/EmptyState'
import FeedbackButton from '@/components/FeedbackButton'
import SaveTemplateModal from '@/components/SaveTemplateModal'
import TemplateSelector from '@/components/TemplateSelector'
import { chartStyles, type StyleName, type StyleOverrides } from '@/lib/chartStyles'
import type { ChartAnnotation } from '@/lib/annotations'
import { isErrorColumn, matchErrorColumn } from '@/lib/detectColumns'
import { loadDefaultStyle } from '@/lib/styleStorage'
import { saveUserTemplate, FTIR_DEV_TEMPLATE, PL_DEV_TEMPLATE_OVERLAY, UVVIS_DEV_TEMPLATE_OVERLAY, DOSE_RESPONSE_DEV_TEMPLATE, XRD_DEV_TEMPLATE, type ChartTemplate, type ChartType } from '@/lib/templateStorage'
import type { MarkerShape } from '@/lib/markerShapes'
import {
  trackAppOpen,
  trackSampleSelected,
  trackSampleFigureLoaded,
  trackReplaceWithMyDataClicked,
  trackSampleToUserUploadCompleted,
  trackUploadStarted,
  trackUploadCompleted,
  trackUploadFailed,
  trackFigureCreated,
  trackFigureEdited,
  trackSmartTemplateApplied,
  trackCheckoutReturnedWithoutPurchase,
  trackTemplateApplied,
  type SampleType,
  type FigureEditType,
} from '@/lib/analytics'
import { getPendingTemplate, clearPendingTemplate } from '@/lib/templates/session'
import { buildTemplateOverrides } from '@/lib/templates/apply'
import { FTIR_SAMPLE_ROWS, FTIR_COLUMNS, FTIR_X_COL, FTIR_Y_COLS } from '@/lib/samples/ftirSampleData'
import { PL_SAMPLE_ROWS, PL_COLUMNS, PL_X_COL, PL_Y_COLS } from '@/lib/samples/plSampleData'
import { UVVIS_SAMPLE_ROWS, UVVIS_COLUMNS, UVVIS_X_COL, UVVIS_Y_COLS } from '@/lib/samples/uvvisSampleData'
import { DR_SAMPLE_ROWS, DR_COLUMNS, DR_X_COL, DR_Y_COLS } from '@/lib/samples/doseResponseSampleData'
import { XRD_SAMPLE_ROWS, XRD_COLUMNS, XRD_X_COL, XRD_Y_COLS } from '@/lib/samples/xrdSampleData'
import { fit4PL, type Fit4PLResult } from '@/lib/curveFit4PL'
import { getPendingCheckout, clearPendingCheckout } from '@/lib/checkout'
import { SAMPLE_ROWS } from '@/components/SampleDataButton'
import { getCachedEntitlement, refreshEntitlement, hasLegacyProFlag } from '@/lib/usageLimit'
import RestoreAccessForm from '@/components/RestoreAccessForm'
import PaywallModal from '@/components/PaywallModal'
import { type PanelConfig, type PanelLayout, getLayoutCount, PANEL_LABELS } from '@/lib/panels'
import { parseExcelFile } from '@/lib/parseExcel'
import { LineThicknessPicker, ToggleSwitch, type NumericPreset } from '@/components/StyleControls'
import AnnotationToolbar from '@/components/AnnotationToolbar'
import type { AnnotationTool } from '@/hooks/useAnnotationInteraction'
import TopBar from '@/components/editor/TopBar'
import LeftNav, { type NavTab } from '@/components/editor/LeftNav'
import ContextPanel from '@/components/editor/ContextPanel'
import CanvasWorkspace from '@/components/editor/CanvasWorkspace'
import RightInspector from '@/components/editor/RightInspector'
import RefinePanel from '@/components/editor/RefinePanel'
import SmartTemplateGallery, { type SmartWorkflowResult } from '@/components/editor/SmartTemplateGallery'

const inputCls = "w-full min-w-0 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
const insetLinePresets: NumericPreset[] = [
  { label: 'Thin', value: 0.8 },
  { label: 'Med', value: 1.5 },
  { label: 'Thick', value: 2.5 },
]

// ── Left nav tab definitions (icon-only rail) ─────────────────────────────────

const NAV_TABS: NavTab[] = [
  {
    id: 'data',
    label: 'Data',
    icon: <FileSpreadsheet size={22} strokeWidth={1.75} />,
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: <LayoutTemplate size={22} strokeWidth={1.75} />,
  },
  {
    id: 'graph',
    label: 'Graph',
    icon: <LineChart size={22} strokeWidth={1.75} />,
  },
  {
    id: 'annotate',
    label: 'Annotate',
    icon: <PenLine size={22} strokeWidth={1.75} />,
  },
]

// Kept for mobile bottom bar (same tabs as NAV_TABS)
const SIDEBAR_TABS = NAV_TABS

const PANEL_LABELS_MAP: Record<string, string> = {
  data: 'Data',
  templates: 'Templates',
  graph: 'Graph',
  annotate: 'Annotate',
  // legacy — kept for mobile drawer fallback
  style: 'Style',
  journal: 'Journal',
  inset: 'Inset Figure',
}

export default function AppPage() {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [sampleBanner, setSampleBanner] = useState(false)
  const [dataSource, setDataSource] = useState<'user_upload' | 'sample' | null>(null)
  const figureCreatedFiredRef = useRef(false)
  const figureEditedFiredRef = useRef(false)
  const currentSampleTypeRef = useRef<SampleType | null>(null)
  const figureWorkflowRef = useRef<string>('user_upload')
  const [showRestorePrompt, setShowRestorePrompt] = useState(false)
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
  const [logScaleWarning, setLogScaleWarning] = useState<string | null>(null)

  // Fit results for dose–response — computed once here, passed to RefinePanel.
  // ChartPreview runs the same computation internally (memoized), so this is zero extra work.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doseResponseFits = useMemo((): Record<string, Fit4PLResult> => {
    if (chartType !== 'doseResponse' || !xCol || data.length === 0) return {}
    const rawX = data.map(row => Number(row[xCol]))
    return Object.fromEntries(
      yCols.map(col => [col, fit4PL(rawX, data.map(row => Number(row[col])))])
    )
  }, [chartType, data, xCol, yCols.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
  const [annotations, setAnnotations] = useState<ChartAnnotation[]>([])
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const [drawInsetMode, setDrawInsetMode] = useState(false)

  // ── Template undo ─────────────────────────────────────────────────────────────
  const [showTemplateUndo, setShowTemplateUndo] = useState(false)
  const appliedTemplateNameRef = useRef('')
  const preTemplateSnapRef = useRef<{ chartType: ChartType; styleOverrides: StyleOverrides } | null>(null)

  const chartPreviewRef = useRef<ChartPreviewHandle>(null)
  const multiPanelRef = useRef<MultiPanelPreviewHandle>(null)
  const [multiPanelPaywallOpen, setMultiPanelPaywallOpen] = useState(false)

  const handleExportSVG = () => chartPreviewRef.current?.triggerExport('svg')
  const handleExportPDF = () => chartPreviewRef.current?.triggerExport('pdf')
  const handleExportPNG = () => {
    if (isMultiPanel) {
      if (getCachedEntitlement().isPro) multiPanelRef.current?.exportPNG()
      else setMultiPanelPaywallOpen(true)
    } else {
      chartPreviewRef.current?.triggerExport('png')
    }
  }

  // Active sidebar panel — always null on SSR to avoid hydration mismatch;
  // useEffect below opens 'data' on desktop after mount.
  const [activeSidePanel, setActiveSidePanel] = useState<string | null>(null)
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false)
  const [panelWidth, setPanelWidth] = useState(280)
  const panelResizeRef = useRef(false)

  // Multi-panel state
  const [isMultiPanel, setIsMultiPanel] = useState(false)
  const [panelLayout, setPanelLayout] = useState<PanelLayout>('2h')
  const [panels, setPanels] = useState<PanelConfig[]>([])
  const [activePanel, setActivePanel] = useState(0)
  const [panelAnnotations, setPanelAnnotations] = useState<ChartAnnotation[][]>([[], [], [], []])
  const [sidebarActiveTool, setSidebarActiveTool] = useState<AnnotationTool>('select')

  // ── New shell state ────────────────────────────────────────────────────────
  const [activeTool, setActiveTool] = useState<AnnotationTool>('select')
  const [inspectorTab, setInspectorTab] = useState<'style' | 'settings'>('style')
  const [docName] = useState('Untitled figure')
  const [rightInspectorOpen, setRightInspectorOpen] = useState(true)
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)

  // ── Progressive disclosure state ──────────────────────────────────────────
  // true once user has applied a template, demo, or explicitly changed chart type
  const [figureConfigured, setFigureConfigured] = useState(false)
  // ID of the currently selected annotation (drives State 4 inspector)
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null)
  // Unified chart element selection (drives RefinePanel auto-section + ChartPreview highlights)
  const [selectedElement, setSelectedElement] = useState<import('@/lib/chartSelection').SelectedChartElement | null>(null)

  const selectedAnnotation = selectedAnnotationId
    ? annotations.find(a => a.id === selectedAnnotationId) ?? null
    : null

  const handleUpdateAnnotation = (id: string, changes: Record<string, unknown>) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, ...changes } : a))
  }
  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id))
    setSelectedAnnotationId(null)
  }

  useEffect(() => {
    const initParams = new URLSearchParams(window.location.search)
    const initDemo = initParams.get('demo')
    const initTab = initParams.get('tab')
    const entryPoint = initDemo ? 'demo_url' : 'direct'
    trackAppOpen({ entry_point: entryPoint, ...(initDemo ? { demo: initDemo } : {}) })
    const saved = loadDefaultStyle()
    if (saved) setStyleOverrides(saved)
    if (window.innerWidth >= 768) setActiveSidePanel('data')

    // Fetch server-side entitlement; show restore prompt for users with the old localStorage flag
    refreshEntitlement().then(e => {
      if (!e.isPro && hasLegacyProFlag()) setShowRestorePrompt(true)
    })

    // Same-tab return: user navigated to Polar then hit back — pending checkout
    // still in localStorage since success page never loaded to clear it.
    const pending = getPendingCheckout()
    if (pending) {
      trackCheckoutReturnedWithoutPurchase(pending)
      clearPendingCheckout()
    }
  }, [])

  // ── Template apply (from /templates gallery flow) ─────────────────────────────
  useEffect(() => {
    const pending = getPendingTemplate()
    if (!pending) return
    clearPendingTemplate()

    // Snapshot current state for undo before overwriting anything
    preTemplateSnapRef.current = { chartType, styleOverrides }
    appliedTemplateNameRef.current = pending.templateName

    // Apply data
    setColumns(pending.columns)
    setData(pending.rows)
    setXCol(pending.xCol)
    setYCols(pending.yCols)
    setErrorCols(pending.errorCols)
    setSeriesNames({})
    setXAxisLabel(pending.xAxisLabel)
    setYAxisLabel(pending.yAxisLabel)
    setAnnotations([])
    setIsMultiPanel(false)
    setPanels([])
    setIsDemoMode(false)
    setChartType(pending.chartType)

    // Apply template style (data-safe: never touches xMin/xMax/yMin/yMax/inset/annotations)
    setStyleOverrides(buildTemplateOverrides(pending, pending.yCols))

    setFigureConfigured(true)
    setShowTemplateUndo(true)
    setDataSource('user_upload')
    figureCreatedFiredRef.current = false
    figureEditedFiredRef.current = false
    figureWorkflowRef.current = 'template_gallery'
    trackTemplateApplied({
      template_id: pending.templateId,
      template_name: pending.templateName,
      chart_type: pending.chartType,
    })
    trackFigureCreated({ chart_type: pending.chartType, workflow: 'template_gallery', data_source: 'user_upload', series_count: pending.yCols.length })
    figureCreatedFiredRef.current = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUndoTemplate = () => {
    if (!preTemplateSnapRef.current) return
    setChartType(preTemplateSnapRef.current.chartType)
    setStyleOverrides(preTemplateSnapRef.current.styleOverrides)
    preTemplateSnapRef.current = null
    setShowTemplateUndo(false)
  }

  // New-tab return: app stays loaded while Polar opens in a new tab.
  // When the user closes Polar and refocuses the app, detect the abandoned checkout.
  useEffect(() => {
    const onFocus = () => {
      const pending = getPendingCheckout()
      if (!pending) return
      const secondsAway = (Date.now() - new Date(pending.started_at).getTime()) / 1000
      if (secondsAway < 5) return // too fast — user didn't actually visit Polar
      trackCheckoutReturnedWithoutPurchase(pending)
      clearPendingCheckout()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
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

  // Explicit undo/redo for TopBar buttons (same logic as keyboard shortcut)
  const handleUndo = () => {
    if (isMultiPanelRef.current) return
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--
      const prev = historyRef.current[historyIndexRef.current]
      isRestoringRef.current = true
      setStyleOverrides(prev.styleOverrides)
      setAnnotations(prev.annotations)
      requestAnimationFrame(() => { isRestoringRef.current = false })
    }
  }

  const handleRedo = () => {
    if (isMultiPanelRef.current) return
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++
      const next = historyRef.current[historyIndexRef.current]
      isRestoringRef.current = true
      setStyleOverrides(next.styleOverrides)
      setAnnotations(next.annotations)
      requestAnimationFrame(() => { isRestoringRef.current = false })
    }
  }

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
    // For multi-series charts the Y-axis label is not the column name.
    // Leave it blank so templates or the user can provide the right label.
    setYAxisLabel('')
    setStyleOverrides({})
    setAnnotations([])
    setIsMultiPanel(false)
    setPanels([])
    setIsDemoMode(false)
    setFigureConfigured(false)   // fresh upload → State 2 (mapping)
    setSelectedAnnotationId(null)

    // Analytics: new user dataset — reset tracking refs, fire figure_created
    setDataSource('user_upload')
    currentSampleTypeRef.current = null
    figureCreatedFiredRef.current = false
    figureEditedFiredRef.current = false
    // figureWorkflowRef is set by the caller before invoking handleData
    trackFigureCreated({ chart_type: chartType, workflow: figureWorkflowRef.current, data_source: 'user_upload', series_count: initialY.length })
    figureCreatedFiredRef.current = true
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
    setFigureConfigured(false)
    setSelectedAnnotationId(null)
  }

  const focusUpload = () => {
    document.getElementById('file-upload')?.click()
  }

  const handleSampleData = () => {
    const cols = Object.keys(SAMPLE_ROWS[0])
    const x = cols[0] ?? ''
    const yCandidates = cols.filter(c => c !== x && !isErrorColumn(c))
    const initialY = yCandidates[0] ? [yCandidates[0]] : cols[1] ? [cols[1]] : []
    setColumns(cols)
    setData(SAMPLE_ROWS)
    setXCol(x)
    setYCols(initialY)
    setSeriesNames({})
    setErrorCols({})
    setXAxisLabel(x)
    setYAxisLabel('')
    setStyleOverrides({})
    setAnnotations([])
    setIsMultiPanel(false)
    setPanels([])
    setSelectedAnnotationId(null)
    setIsDemoMode(true)
    setFigureConfigured(true)
    setDataSource('sample')
    currentSampleTypeRef.current = 'generic'
    figureCreatedFiredRef.current = false
    figureEditedFiredRef.current = false
    figureWorkflowRef.current = 'sample'
    trackSampleFigureLoaded({ sample_type: 'generic', workflow: 'generic' })
  }

  const handleFTIRSampleData = () => {
    setColumns(FTIR_COLUMNS)
    setData(FTIR_SAMPLE_ROWS)
    setXCol(FTIR_X_COL)
    setYCols(FTIR_Y_COLS)
    setSeriesNames({})
    setErrorCols({})
    setXAxisLabel('Wavenumber (cm⁻¹)')
    setYAxisLabel('Absorbance (a.u.)')
    setChartType('lineOnly')
    setStyleOverrides(buildTemplateOverrides(FTIR_DEV_TEMPLATE, FTIR_Y_COLS))
    setAnnotations([])
    setIsMultiPanel(false)
    setPanels([])
    setIsDemoMode(false)
    setFigureConfigured(true)
    setSelectedAnnotationId(null)
    setSampleBanner(true)
    setDataSource('sample')
    currentSampleTypeRef.current = 'ftir'
    figureCreatedFiredRef.current = false
    figureEditedFiredRef.current = false
    figureWorkflowRef.current = 'sample'
    trackSampleFigureLoaded({ sample_type: 'ftir', workflow: 'ftir-stacked' })
  }

  const handlePLSampleData = () => {
    setColumns(PL_COLUMNS)
    setData(PL_SAMPLE_ROWS)
    setXCol(PL_X_COL)
    setYCols(PL_Y_COLS)
    setSeriesNames({})
    setErrorCols({})
    setXAxisLabel('Wavelength (nm)')
    setYAxisLabel('Intensity (a.u.)')
    setChartType('lineOnly')
    setStyleOverrides(buildTemplateOverrides(PL_DEV_TEMPLATE_OVERLAY, PL_Y_COLS))
    setAnnotations([])
    setIsMultiPanel(false)
    setPanels([])
    setIsDemoMode(false)
    setFigureConfigured(true)
    setSelectedAnnotationId(null)
    setSampleBanner(true)
    setDataSource('sample')
    currentSampleTypeRef.current = 'fluorescence'
    figureCreatedFiredRef.current = false
    figureEditedFiredRef.current = false
    figureWorkflowRef.current = 'sample'
    trackSampleFigureLoaded({ sample_type: 'fluorescence', workflow: 'stacked-spectra' })
  }

  const handleUVVisSampleData = () => {
    setColumns(UVVIS_COLUMNS)
    setData(UVVIS_SAMPLE_ROWS)
    setXCol(UVVIS_X_COL)
    setYCols(UVVIS_Y_COLS)
    setSeriesNames({})
    setErrorCols({})
    setXAxisLabel('Wavelength (nm)')
    setYAxisLabel('Absorbance (a.u.)')
    setChartType('lineOnly')
    setStyleOverrides(buildTemplateOverrides(UVVIS_DEV_TEMPLATE_OVERLAY, UVVIS_Y_COLS))
    setAnnotations([])
    setIsMultiPanel(false)
    setPanels([])
    setIsDemoMode(false)
    setFigureConfigured(true)
    setSelectedAnnotationId(null)
    setSampleBanner(true)
    setDataSource('sample')
    currentSampleTypeRef.current = 'uvvis'
    figureCreatedFiredRef.current = false
    figureEditedFiredRef.current = false
    figureWorkflowRef.current = 'sample'
    trackSampleFigureLoaded({ sample_type: 'uvvis', workflow: 'stacked-spectra' })
  }

  const handleFileFromBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const fileType = file.name.endsWith('.csv') ? 'csv' : file.name.endsWith('.xls') ? 'xls' : 'xlsx'
    trackUploadStarted({ source: 'banner' })
    try {
      const { columns: cols, rows } = await parseExcelFile(file)
      if (rows.length === 0) {
        trackUploadFailed({ source: 'banner', file_type: fileType, error_code: 'empty_file' })
        return
      }
      const yCandidates = cols.filter(c => c !== (cols[0] ?? '') && !isErrorColumn(c))
      const initialY = yCandidates[0] ? [yCandidates[0]] : cols[1] ? [cols[1]] : []
      trackUploadCompleted({ source: 'banner', file_type: fileType, row_count: rows.length, column_count: cols.length, series_count: initialY.length })
      figureWorkflowRef.current = 'user_upload'
      handleData(cols, rows)
    } catch {
      trackUploadFailed({ source: 'banner', file_type: fileType, error_code: 'parse_error' })
    }
  }

  const handleDoseResponseSampleData = () => {
    setColumns(DR_COLUMNS)
    setData(DR_SAMPLE_ROWS)
    setXCol(DR_X_COL)
    setYCols(DR_Y_COLS)
    setSeriesNames({})
    setErrorCols({
      'Compound A': 'Compound A error',
      'Compound B': 'Compound B error',
    })
    setXAxisLabel('Concentration (µM)')
    setYAxisLabel('Inhibition (%)')
    setChartType('doseResponse')
    setStyleOverrides(buildTemplateOverrides(DOSE_RESPONSE_DEV_TEMPLATE, DR_Y_COLS))
    setAnnotations([])
    setIsMultiPanel(false)
    setPanels([])
    setIsDemoMode(false)
    setFigureConfigured(true)
    setSelectedAnnotationId(null)
    setSampleBanner(true)
    setDataSource('sample')
    currentSampleTypeRef.current = 'doseresponse'
    figureCreatedFiredRef.current = false
    figureEditedFiredRef.current = false
    figureWorkflowRef.current = 'sample'
    trackSampleFigureLoaded({ sample_type: 'doseresponse', workflow: 'dose-response' })
  }

  const handleXRDSampleData = () => {
    setColumns(XRD_COLUMNS)
    setData(XRD_SAMPLE_ROWS)
    setXCol(XRD_X_COL)
    setYCols(XRD_Y_COLS)
    setSeriesNames({})
    setErrorCols({})
    setXAxisLabel('2θ (°)')
    setYAxisLabel('Intensity (a.u.)')
    setChartType('lineOnly')
    setStyleOverrides(buildTemplateOverrides(XRD_DEV_TEMPLATE, XRD_Y_COLS))
    setAnnotations([])
    setIsMultiPanel(false)
    setPanels([])
    setIsDemoMode(false)
    setFigureConfigured(true)
    setSelectedAnnotationId(null)
    setSampleBanner(true)
    setDataSource('sample')
    currentSampleTypeRef.current = 'xrd'
    figureCreatedFiredRef.current = false
    figureEditedFiredRef.current = false
    figureWorkflowRef.current = 'sample'
    trackSampleFigureLoaded({ sample_type: 'xrd', workflow: 'xrd-stacked' })
  }

  const handleReplaceWithMyData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    trackReplaceWithMyDataClicked({ current_sample: currentSampleTypeRef.current })
    const fileType = file.name.endsWith('.csv') ? 'csv' : file.name.endsWith('.xls') ? 'xls' : 'xlsx'
    trackUploadStarted({ source: 'banner' })
    try {
      const { columns: cols, rows } = await parseExcelFile(file)
      if (rows.length === 0) {
        trackUploadFailed({ source: 'banner', file_type: fileType, error_code: 'empty_file' })
        return
      }
      const yCandidates = cols.filter(c => c !== (cols[0] ?? '') && !isErrorColumn(c))
      const initialY = yCandidates[0] ? [yCandidates[0]] : cols[1] ? [cols[1]] : []
      trackUploadCompleted({ source: 'banner', file_type: fileType, row_count: rows.length, column_count: cols.length, series_count: initialY.length })
      trackSampleToUserUploadCompleted({ row_count: rows.length, column_count: cols.length })
      figureWorkflowRef.current = 'user_upload'
      handleData(cols, rows)
      setSampleBanner(false)
    } catch {
      trackUploadFailed({ source: 'banner', file_type: fileType, error_code: 'parse_error' })
    }
  }

  const handleLoadFTIRData = () => {
    setColumns(FTIR_COLUMNS)
    setData(FTIR_SAMPLE_ROWS)
    setXCol(FTIR_X_COL)
    setYCols(FTIR_Y_COLS)
    setSeriesNames({})
    setErrorCols({})
    setAnnotations([])
    setIsMultiPanel(false)
    setPanels([])
    setIsDemoMode(false)
    setSelectedAnnotationId(null)
  }

  const handleLoadDRData = () => {
    setColumns(DR_COLUMNS)
    setData(DR_SAMPLE_ROWS)
    setXCol(DR_X_COL)
    setYCols(DR_Y_COLS)
    setSeriesNames({})
    setErrorCols({
      'Compound A': 'Compound A error',
      'Compound B': 'Compound B error',
    })
    setAnnotations([])
    setIsMultiPanel(false)
    setPanels([])
    setIsDemoMode(false)
    setSelectedAnnotationId(null)
  }

  const handleApplySmartWorkflow = (result: SmartWorkflowResult) => {
    setXCol(result.xCol)
    setYCols(result.yCols)
    setErrorCols(result.errorCols)
    setXAxisLabel(result.xAxisLabel)
    setYAxisLabel(result.yAxisLabel)
    setChartType(result.chartType)
    setStyleOverrides(result.overrides)
    setLogScaleWarning(null)
    setFigureConfigured(true)
    setActiveSidePanel(null)
    const smartDataSource = dataSource ?? 'user_upload'
    trackSmartTemplateApplied({ template_id: result.templateId, template_name: result.templateName, chart_type: result.chartType, series_count: result.yCols.length, data_source: smartDataSource })
    // Only fire figure_created for user-upload data, and only once per dataset
    if (smartDataSource === 'user_upload' && !figureCreatedFiredRef.current) {
      figureWorkflowRef.current = 'smart_template'
      trackFigureCreated({ chart_type: result.chartType, workflow: 'smart_template', data_source: 'user_upload', series_count: result.yCols.length })
      figureCreatedFiredRef.current = true
    }
  }

  const handleFileFromEmptyState = async (file: File) => {
    const fileType = file.name.endsWith('.csv') ? 'csv' : file.name.endsWith('.xls') ? 'xls' : 'xlsx'
    trackUploadStarted({ source: 'empty_state' })
    try {
      const { columns: cols, rows } = await parseExcelFile(file)
      if (rows.length === 0) {
        trackUploadFailed({ source: 'empty_state', file_type: fileType, error_code: 'empty_file' })
        return
      }
      const yCandidates = cols.filter(c => c !== (cols[0] ?? '') && !isErrorColumn(c))
      const initialY = yCandidates[0] ? [yCandidates[0]] : cols[1] ? [cols[1]] : []
      trackUploadCompleted({ source: 'empty_state', file_type: fileType, row_count: rows.length, column_count: cols.length, series_count: initialY.length })
      figureWorkflowRef.current = 'user_upload'
      handleData(cols, rows)
      setSampleBanner(false)
    } catch {
      trackUploadFailed({ source: 'empty_state', file_type: fileType, error_code: 'parse_error' })
    }
  }

  // Auto-open tab or load demo from URL params. Params are cleared immediately.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    const demo = params.get('demo')
    if (tab || demo) window.history.replaceState({}, '', window.location.pathname)
    if (tab === 'templates') { setActiveSidePanel('templates'); return }
    if (!demo) return
    const sampleIdMap: Record<string, SampleType> = {
      xrd: 'xrd', ftir: 'ftir', fluorescence: 'fluorescence',
      uvvis: 'uvvis', doseresponse: 'doseresponse',
    }
    const sampleType = sampleIdMap[demo] ?? 'generic'
    trackSampleSelected({ sample_type: sampleType, source: 'url_param' })
    if (demo === 'xrd') handleXRDSampleData()
    else if (demo === 'ftir') handleFTIRSampleData()
    else if (demo === 'fluorescence') handlePLSampleData()
    else if (demo === 'uvvis') handleUVVisSampleData()
    else if (demo === 'doseresponse') handleDoseResponseSampleData()
    else handleSampleData()
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
    setFigureConfigured(true)
    setChartType(template.chartType)
    setLogScaleWarning(null)

    const newSeriesColors: Record<string, string> = {}
    const newSeriesStrokeWidths: Record<string, number> = {}
    const newSeriesMarkerSizes: Record<string, number> = {}
    const newSeriesMarkerShapes: Record<string, MarkerShape> = {}
    const newSeriesYOffsets: Record<string, number> = {}

    yCols.forEach((col, i) => {
      if (template.seriesColorsList?.[i] != null)
        newSeriesColors[col] = template.seriesColorsList[i]
      if (template.seriesStrokeWidthsList?.[i] != null)
        newSeriesStrokeWidths[col] = template.seriesStrokeWidthsList[i]
      if (template.seriesMarkerSizesList?.[i] != null)
        newSeriesMarkerSizes[col] = template.seriesMarkerSizesList[i]
      if (template.seriesMarkerShapesList?.[i] != null)
        newSeriesMarkerShapes[col] = template.seriesMarkerShapesList[i]
      if (template.seriesYOffsetsList?.[i] != null)
        newSeriesYOffsets[col] = template.seriesYOffsetsList[i]
    })

    // Log X safety: if template requests log scale but current X data contains
    // zero or negative values, fall back to linear and warn the user.
    let appliedOverrides = { ...template.overrides }
    if (template.overrides.xScale === 'log' && xCol && data.length > 0) {
      const hasNonPositive = data.some(row => {
        const v = Number(row[xCol])
        return isFinite(v) && v <= 0
      })
      if (hasNonPositive) {
        appliedOverrides = { ...appliedOverrides, xScale: 'linear' }
        setLogScaleWarning('Log X scale requires all concentrations > 0. Linear scale applied instead.')
      }
    }

    setStyleOverrides({
      ...appliedOverrides,
      ...(Object.keys(newSeriesColors).length && { seriesColors: newSeriesColors }),
      ...(Object.keys(newSeriesStrokeWidths).length && { seriesStrokeWidths: newSeriesStrokeWidths }),
      ...(Object.keys(newSeriesMarkerSizes).length && { seriesMarkerSizes: newSeriesMarkerSizes }),
      ...(Object.keys(newSeriesMarkerShapes).length && { seriesMarkerShapes: newSeriesMarkerShapes }),
      ...(Object.keys(newSeriesYOffsets).length && { seriesYOffsets: newSeriesYOffsets }),
    })
    if (template.defaultAxisLabels?.x != null) setXAxisLabel(template.defaultAxisLabels.x)
    if (template.defaultAxisLabels?.y != null) setYAxisLabel(template.defaultAxisLabels.y)
    setActiveTemplateId(template.id)
  }

  // Wrapper for user-initiated style changes — fires figure_edited once per dataset
  const handleUserStyleChange = (overrides: StyleOverrides, editType: FigureEditType = 'other') => {
    if (!figureEditedFiredRef.current && dataSource !== null) {
      figureEditedFiredRef.current = true
      trackFigureEdited({ data_source: dataSource, edit_type: editType })
    }
    setCurrentStyleOverrides(overrides)
  }

  const handleUserStylePatch = (patch: Partial<StyleOverrides>) => {
    handleUserStyleChange({ ...currentStyleOverrides, ...patch })
  }

  const ready = xCol && yCols.length > 0 && data.length > 0

  // ── Secondary panel content ───────────────────────────────────────────────────

  const renderPanelContent = () => {
    switch (activeSidePanel) {

      case 'data': {
        // ── State 1: no data — canvas is the primary upload surface ──────────
        if (columns.length === 0) {
          return (
            <div className="space-y-2 pt-1">
              <button
                onClick={() => setActiveSidePanel('templates')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#334155] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
              >
                <svg className="w-4 h-4 shrink-0 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                </svg>
                Browse templates
              </button>
              <button
                onClick={handleSampleData}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#334155] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
              >
                <svg className="w-4 h-4 shrink-0 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Try demo data
              </button>
            </div>
          )
        }

        // ── State 2: data loaded, not configured (mapping step) ───────────────
        if (!figureConfigured) {
          return (
            <div>
              <FileUploader
                onData={(cols, rows) => {
                  const x = cols[0] ?? ''
                  const yCands = cols.filter(c => c !== x && !isErrorColumn(c))
                  const initialY = yCands[0] ? [yCands[0]] : cols[1] ? [cols[1]] : []
                  trackUploadCompleted({ source: 'compact', file_type: 'xlsx', row_count: rows.length, column_count: cols.length, series_count: initialY.length })
                  handleData(cols, rows)
                }}
                compact
              />

              {/* Multi-panel toggle */}
              <div className="flex items-center justify-between mt-4 mb-3">
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
                <div className="space-y-3 rounded-2xl bg-[#dbeafe] p-3 mb-3">
                  <div>
                    <p className="text-xs font-medium text-[#1d4ed8] mb-2">Layout</p>
                    <PanelLayoutSelector value={panelLayout} onChange={handleLayoutChange} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#1d4ed8] mb-2">Editing panel</p>
                    <div className="flex gap-1.5">
                      {panels.map((p, i) => (
                        <button key={p.id} onClick={() => setActivePanel(i)}
                          className={`w-9 h-9 text-sm font-bold rounded-xl transition-all ${i === activePanel ? 'bg-[#2563eb] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                        >{p.id}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#1d4ed8] mb-2">Excel file — Panel {panels[activePanel]?.id}</p>
                    <label className="flex items-center gap-2 w-full py-2 px-3 rounded-xl bg-white border border-[#93c5fd] cursor-pointer hover:bg-violet-50 transition-colors">
                      <svg className="w-4 h-4 text-[#2563eb] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="text-xs text-slate-600 flex-1 truncate">
                        {panels[activePanel]?.columns.length > 0 ? `${panels[activePanel].columns.length} columns loaded` : 'Upload a .xlsx file…'}
                      </span>
                      <input type="file" accept=".xlsx" className="hidden" onChange={handlePanelFileChange} />
                    </label>
                  </div>
                </div>
              )}

              {/* MAPPING */}
              {currentColumns.length > 0 && (
                <ColumnSelector
                  columns={currentColumns}
                  xCol={currentXCol}
                  yCols={currentYCols}
                  seriesNames={currentSeriesNames}
                  errorCols={currentErrorCols}
                  xAxisLabel={currentXAxisLabel}
                  yAxisLabel={currentYAxisLabel}
                  seriesColors={currentStyleOverrides.seriesColors ?? {}}
                  yAxisAssignment={currentStyleOverrides.yAxisAssignment ?? {}}
                  defaultColors={chartStyles[styleName].colors}
                  figureConfigured={false}
                  onChange={setCurrentXYCols}
                  onSeriesNamesChange={setCurrentSeriesNames}
                  onErrorColsChange={setCurrentErrorCols}
                  onXAxisLabelChange={setCurrentXAxisLabel}
                  onYAxisLabelChange={setCurrentYAxisLabel}
                  onYAxisAssignmentChange={(assignment) => setCurrentStyleOverrides({ ...currentStyleOverrides, yAxisAssignment: assignment })}
                />
              )}

              {/* Template CTA — primary next step */}
              <div className="mt-5 space-y-2">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 select-none">Next step</p>
                <button
                  onClick={() => { setActiveSidePanel('templates'); setFigureConfigured(true) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                  </svg>
                  Choose a template
                </button>

                {/* Chart type — secondary */}
                {ready && !isMultiPanel && (
                  <div>
                    <p className="text-[9px] text-slate-400 text-center my-2 select-none">or pick chart type manually</p>
                    <ChartTypeSelector
                      value={currentChartType}
                      onChange={v => { setCurrentChartType(v); setFigureConfigured(true) }}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        }

        // ── State 3: figure configured — compact, all sections collapsed ───────
        return (
          <div>
            <FileUploader
              onData={(cols, rows) => {
                const x = cols[0] ?? ''
                const yCands = cols.filter(c => c !== x && !isErrorColumn(c))
                const initialY = yCands[0] ? [yCands[0]] : cols[1] ? [cols[1]] : []
                trackUploadCompleted({ source: 'compact', file_type: 'xlsx', row_count: rows.length, column_count: cols.length, series_count: initialY.length })
                handleData(cols, rows)
              }}
              compact
            />

            {/* Multi-panel toggle */}
            <div className="flex items-center justify-between mt-4 mb-3">
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
              <div className="space-y-3 rounded-2xl bg-[#dbeafe] p-3 mb-3">
                <div>
                  <p className="text-xs font-medium text-[#1d4ed8] mb-2">Layout</p>
                  <PanelLayoutSelector value={panelLayout} onChange={handleLayoutChange} />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#1d4ed8] mb-2">Editing panel</p>
                  <div className="flex gap-1.5">
                    {panels.map((p, i) => (
                      <button key={p.id} onClick={() => setActivePanel(i)}
                        className={`w-9 h-9 text-sm font-bold rounded-xl transition-all ${i === activePanel ? 'bg-[#2563eb] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                      >{p.id}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#1d4ed8] mb-2">Excel file — Panel {panels[activePanel]?.id}</p>
                  <label className="flex items-center gap-2 w-full py-2 px-3 rounded-xl bg-white border border-[#93c5fd] cursor-pointer hover:bg-violet-50 transition-colors">
                    <svg className="w-4 h-4 text-[#2563eb] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-xs text-slate-600 flex-1 truncate">
                      {panels[activePanel]?.columns.length > 0 ? `${panels[activePanel].columns.length} columns loaded` : 'Upload a .xlsx file…'}
                    </span>
                    <input type="file" accept=".xlsx" className="hidden" onChange={handlePanelFileChange} />
                  </label>
                </div>
              </div>
            )}

            {currentColumns.length > 0 && (
              <ColumnSelector
                columns={currentColumns}
                xCol={currentXCol}
                yCols={currentYCols}
                seriesNames={currentSeriesNames}
                errorCols={currentErrorCols}
                xAxisLabel={currentXAxisLabel}
                yAxisLabel={currentYAxisLabel}
                seriesColors={currentStyleOverrides.seriesColors ?? {}}
                yAxisAssignment={currentStyleOverrides.yAxisAssignment ?? {}}
                defaultColors={chartStyles[styleName].colors}
                figureConfigured
                onChange={setCurrentXYCols}
                onSeriesNamesChange={setCurrentSeriesNames}
                onErrorColsChange={setCurrentErrorCols}
                onXAxisLabelChange={setCurrentXAxisLabel}
                onYAxisLabelChange={setCurrentYAxisLabel}
                onYAxisAssignmentChange={(assignment) => setCurrentStyleOverrides({ ...currentStyleOverrides, yAxisAssignment: assignment })}
              />
            )}
          </div>
        )
      }

      case 'style':
        return ready && !isMultiPanel ? (
          <StyleEditor
            baseStyle={chartStyles[styleName]}
            overrides={styleOverrides}
            hasMultipleSeries={yCols.length > 1}
            columns={columns.filter(c => c !== xCol)}
            onChange={handleUserStyleChange}
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
            {/* Compact tool row — mobile only; desktop sees the toolbar above the chart */}
            <div className="md:hidden -mx-3 px-3 overflow-x-auto no-scrollbar">
              <AnnotationToolbar
                activeTool={sidebarActiveTool}
                onToolChange={tool => {
                  setSidebarActiveTool(tool)
                  chartPreviewRef.current?.setActiveTool(tool)
                }}
                onInsertSymbol={sym => chartPreviewRef.current?.insertSymbol(sym)}
              />
            </div>
            {/* Desktop hint */}
            <div className="hidden md:block rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5">
              <p className="text-xs font-semibold text-[#1d4ed8]">Annotation tools expanded</p>
              <p className="text-[11px] text-blue-500 mt-0.5">Use the toolbar above the chart to add annotations</p>
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

      case 'graph':
        return (
          <div className="space-y-5">
            {ready && !isMultiPanel && (
              <>
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
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${active ? 'bg-[#2563eb] text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
                            {sc === 'linear' ? 'Linear' : sc === 'log' ? 'Log₁₀' : 'Ln'}
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
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${active ? 'bg-[#2563eb] text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
                            {sc === 'linear' ? 'Linear' : sc === 'log' ? 'Log₁₀' : 'Ln'}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">Figure width</p>
                  <div className="flex items-center gap-2">
                    <input type="number" min={300} max={1600} step={50}
                      value={styleOverrides.figureWidth ?? 700}
                      onChange={e => { const v = Number(e.target.value); if (v >= 300 && v <= 1600) setStyleOverrides(prev => ({ ...prev, figureWidth: v })) }}
                      className="w-full min-w-0 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-[#2563eb]" />
                    <span className="text-[10px] text-slate-400 shrink-0">px</span>
                  </div>
                </div>
              </>
            )}
            {!ready && <p className="text-xs text-slate-400">Load data first.</p>}
          </div>
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

      <TopBar
        docName={docName}
        activeTool={activeTool}
        onToolChange={(t) => { setActiveTool(t); chartPreviewRef.current?.setActiveTool(t) }}
        drawInsetActive={drawInsetMode}
        onDrawInsetToggle={() => setDrawInsetMode(v => !v)}
        onInsertSymbol={sym => chartPreviewRef.current?.insertSymbol(sym)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportPNG={handleExportPNG}
        onExportSVG={handleExportSVG}
        onExportPDF={handleExportPDF}
        onShareLink={handleShareLink}
      />

      {showRestorePrompt && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs text-amber-800 font-medium">
              Your Pro access needs to be restored. Enter your subscription email to get a sign-in link.
            </span>
            <div className="shrink-0 w-48">
              <RestoreAccessForm compact onSent={() => setShowRestorePrompt(false)} />
            </div>
          </div>
          <button
            onClick={() => setShowRestorePrompt(false)}
            className="shrink-0 text-amber-500 hover:text-amber-700"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

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

      {showTemplateUndo && (
        <div className="bg-[#eff6ff] border-b border-[#bfdbfe] px-4 py-2 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="w-4 h-4 text-[#2563eb] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
            </svg>
            <span className="text-xs text-[#1d4ed8] font-medium truncate">
              Template applied: <strong>{appliedTemplateNameRef.current}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleUndoTemplate}
              className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] underline underline-offset-2"
            >
              Undo
            </button>
            <button
              onClick={() => setShowTemplateUndo(false)}
              className="text-[#2563eb] hover:text-[#1d4ed8]"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── 4-column AppShell ─────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        <LeftNav
          tabs={NAV_TABS}
          activeTab={activeSidePanel}
          onTabChange={setActiveSidePanel}
        />

        {activeSidePanel && activeSidePanel !== 'templates' && (
          <ContextPanel
            title={PANEL_LABELS_MAP[activeSidePanel] ?? activeSidePanel}
            onCollapse={() => setActiveSidePanel(null)}
          >
            {renderPanelContent()}
          </ContextPanel>
        )}

        <CanvasWorkspace>
          {/* ── Template Gallery (replaces canvas when templates tab is active) ── */}
          {activeSidePanel === 'templates' ? (
            <SmartTemplateGallery
              columns={columns}
              data={data}
              xCol={xCol}
              yCols={yCols}
              errorCols={errorCols}
              onApply={handleApplySmartWorkflow}
              onClose={() => setActiveSidePanel(null)}
              onLoadFTIRDemo={handleLoadFTIRData}
              onLoadDRDemo={handleLoadDRData}
            />
          ) : (
          <>
          {/* Sample loaded banner */}
          {sampleBanner && (
            <div className="mx-4 mt-2 shrink-0 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <svg className="shrink-0 w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Sample loaded · <strong>Click anything</strong> on the figure to edit it</span>
              <label className="ml-auto cursor-pointer font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors whitespace-nowrap shrink-0">
                Replace with my data
                <input type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={handleReplaceWithMyData} />
              </label>
              <button onClick={() => setSampleBanner(false)} className="ml-2 shrink-0 text-emerald-400 hover:text-emerald-700 transition-colors" aria-label="Dismiss">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Log scale warning banner */}
          {logScaleWarning && (
            <div className="mx-4 mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <svg className="shrink-0 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span>{logScaleWarning}</span>
              <button onClick={() => setLogScaleWarning(null)} className="ml-auto text-amber-600 hover:text-amber-900">✕</button>
            </div>
          )}
          {/* Figure zone */}
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
                  handleUserStylePatch(patch)
                  if (patch.insetDefined === false) setDrawInsetMode(false)
                }}
                onSaveTemplate={() => setSaveTemplateOpen(true)}
                drawInsetActive={drawInsetMode}
                onDrawInsetActiveChange={setDrawInsetMode}
                annotOpen={false}
                onSelectionChange={setSelectedAnnotationId}
                onElementSelect={(el) => {
                  setSelectedElement(el)
                  if (el) { setInspectorTab('style'); setRightInspectorOpen(true) }
                }}
                selectedElement={selectedElement}
                dataSource={dataSource ?? 'sample'}
                figureWorkflow={figureWorkflowRef.current}
              />
            ) : (
              <div className="flex-1 overflow-y-auto bg-[#f8fafc] flex flex-col items-center justify-center min-h-0 py-6">
                <EmptyState
                  onFile={handleFileFromEmptyState}
                  onSampleSelect={(id) => {
                    if (id === 'xrd') handleXRDSampleData()
                    else if (id === 'ftir') handleFTIRSampleData()
                    else if (id === 'doseresponse') handleDoseResponseSampleData()
                    else if (id === 'uvvis') handleUVVisSampleData()
                    else if (id === 'fluorescence') handlePLSampleData()
                  }}
                  onTemplatesClick={() => setActiveSidePanel('templates')}
                />
              </div>
            )}
          </div>

          {/* Mobile legend strip */}
          {ready && currentYCols.length > 0 && (
            <div className="md:hidden shrink-0 flex items-center gap-2 px-3 py-2 bg-[#F7F8FC] border-t border-[#E7EAF0] overflow-x-auto no-scrollbar">
              {currentYCols.map((col, i) => {
                const color = currentStyleOverrides.seriesColors?.[col] ?? chartStyles[styleName].colors[i % chartStyles[styleName].colors.length]
                const label = currentSeriesNames[col] ?? col
                return (
                  <div key={col} className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full bg-white border border-[#E7EAF0] shadow-sm" title={label}>
                    <span className="w-2 h-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                    <span className="text-[10px] font-medium text-slate-600 max-w-[72px] truncate leading-none">{label}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Mobile inline settings panel */}
          {mobilePanelOpen && activeSidePanel && (
            <div
              className="md:hidden shrink-0 flex flex-col bg-white rounded-t-2xl overflow-hidden border-t border-[#E7EAF0]"
              style={{ maxHeight: '40vh', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}
            >
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#F0F4FF] border-b border-[#E0E8FF] shrink-0">
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

          {/* Mobile spacer for fixed bottom nav */}
          <div
            className="md:hidden shrink-0"
            style={{ height: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}
            aria-hidden="true"
          />
          </>
          )}
        </CanvasWorkspace>

        <RightInspector
          activeTab={inspectorTab}
          onTabChange={setInspectorTab}
          isOpen={rightInspectorOpen && activeSidePanel !== 'templates'}
          onCollapse={() => setRightInspectorOpen(false)}
          onExpand={() => setRightInspectorOpen(true)}
          selectedAnnotation={selectedAnnotation}
          onUpdateAnnotation={handleUpdateAnnotation}
          onDeleteAnnotation={handleDeleteAnnotation}
          styleContent={
            !ready || isMultiPanel ? (
              <p className="text-xs text-slate-400">
                {columns.length === 0
                  ? 'Upload data to see style controls.'
                  : 'Choose a template to configure your figure style.'}
              </p>
            ) : (
              <RefinePanel
                yCols={yCols}
                seriesNames={seriesNames}
                seriesColors={styleOverrides.seriesColors ?? {}}
                seriesStrokeWidths={styleOverrides.seriesStrokeWidths ?? {}}
                seriesMarkerSizes={styleOverrides.seriesMarkerSizes ?? {}}
                seriesMarkerShapes={(styleOverrides.seriesMarkerShapes ?? {}) as Record<string, import('@/lib/markerShapes').MarkerShape>}
                chartType={chartType}
                defaultColors={chartStyles[styleName].colors}
                defaultStrokeWidth={chartStyles[styleName].strokeWidth}
                defaultMarkerSize={chartStyles[styleName].dotRadius}
                onSeriesColorsChange={(colors) => handleUserStyleChange({ ...styleOverrides, seriesColors: colors })}
                onSeriesStrokeWidthsChange={(widths) => handleUserStyleChange({ ...styleOverrides, seriesStrokeWidths: widths })}
                onSeriesMarkerSizesChange={(sizes) => handleUserStyleChange({ ...styleOverrides, seriesMarkerSizes: sizes })}
                onSeriesMarkerShapesChange={(shapes) => handleUserStyleChange({ ...styleOverrides, seriesMarkerShapes: shapes })}
                baseStyle={chartStyles[styleName]}
                overrides={styleOverrides}
                onChange={handleUserStyleChange}
                selectedElement={selectedElement}
                onElementSelect={(el) => { setSelectedElement(el); if (el) { setInspectorTab('style'); setRightInspectorOpen(true) } }}
                doseResponseFits={doseResponseFits}
              />
            )
          }
          settingsContent={
            <div className="space-y-5">
              <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5">
                <p className="text-xs font-semibold text-[#1d4ed8]">ACS style active</p>
                <p className="text-[11px] text-blue-500 mt-0.5">American Chemical Society format</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-600">Figure width</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={300} max={1600} step={50}
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
              {ready && !isMultiPanel && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-slate-600">Inset figure</p>
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
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
                    </svg>
                    {drawInsetMode ? 'Click & drag on chart…' : styleOverrides.insetDefined ? 'Redefine inset zone' : 'Add inset figure'}
                  </button>
                </div>
              )}
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <p className="text-[11px] text-slate-400">More journal presets coming soon — Nature, Cell, JACS</p>
              </div>
            </div>
          }
        />

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

