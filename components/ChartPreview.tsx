'use client'
import { useEffect, useRef, useState, type Key } from 'react'
import { trackExport } from '@/lib/analytics'
import { gtagEvent } from '@/lib/ga'
import { isProUser } from '@/lib/usageLimit'
import PaywallModal from '@/components/PaywallModal'
import {
  LineChart, Line,
  ScatterChart, Scatter,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea, ErrorBar,
  ResponsiveContainer, Customized,
} from 'recharts'
import { chartStyles } from '@/lib/chartStyles'
import type { StyleName, StyleOverrides } from '@/lib/chartStyles'
import type { ChartAnnotation, TextAnnotation, ArrowAnnotation, LineAnnotation, RectAnnotation, EllipseAnnotation } from '@/lib/annotations'
import AnnotationToolbar from '@/components/AnnotationToolbar'
import { formatAxisLabel } from '@/lib/formatLabel'
import { getNiceTicks, buildStepTicks } from '@/lib/niceTicks'
import { renderMarker, type MarkerShape } from '@/lib/markerShapes'

// ─── Icons ───────────────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 16.5V3" />
    </svg>
  )
}
// ─── Tooltip content components ───────────────────────────────────────────────

function ScatterTooltipContent({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload: Record<string, unknown>; color?: string; fill?: string }>
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const fmt = (v: unknown) => typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toPrecision(4)) : String(v)
  const color = payload[0].color ?? payload[0].fill ?? '#000'
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-1.5 text-xs whitespace-nowrap" style={{ color }}>
      <span className="text-slate-500">x = </span><span className="font-mono text-slate-800">{fmt(d.x)}</span>
      <span className="mx-2 text-slate-300">·</span>
      <span className="text-slate-500">y = </span><span className="font-mono">{fmt(d.y)}</span>
    </div>
  )
}

function BarTooltipContent({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name?: string; fill?: string }>
  label?: string | number
}) {
  if (!active || !payload?.length) return null
  const fmt = (v: number) => Number.isInteger(v) ? String(v) : v.toPrecision(4)
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-1.5 text-xs whitespace-nowrap space-y-0.5">
      <p className="text-slate-400 font-mono">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill }}>
          <span className="text-slate-500">{p.name} = </span>
          <span className="font-mono">{typeof p.value === 'number' ? fmt(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  )
}

// ─── Draggable axis label ────────────────────────────────────────────────────

interface DraggableLabelProps {
  viewBox?: { x: number; y: number; width: number; height: number }
  value?: string | number
  angle?: number
  dx?: number
  dy?: number
  style?: React.CSSProperties
  onDrag: (dx: number, dy: number) => void
}

function DraggableAxisLabel({ viewBox, value, angle = 0, dx = 0, dy = 0, style, onDrag }: DraggableLabelProps) {
  const lastClient = useRef({ x: 0, y: 0 })

  if (!value || !viewBox) return null
  const cx = viewBox.x + viewBox.width / 2 + dx
  const cy = viewBox.y + viewBox.height / 2 + dy

  const handleMouseDown = (e: React.MouseEvent<SVGTextElement>) => {
    e.preventDefault()
    e.stopPropagation()
    lastClient.current = { x: e.clientX, y: e.clientY }
    const onMove = (ev: MouseEvent) => {
      const ddx = ev.clientX - lastClient.current.x
      const ddy = ev.clientY - lastClient.current.y
      lastClient.current = { x: ev.clientX, y: ev.clientY }
      onDrag(ddx, ddy)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <text
      x={cx} y={cy}
      textAnchor="middle"
      dominantBaseline="middle"
      transform={angle ? `rotate(${angle}, ${cx}, ${cy})` : undefined}
      className="fr-axis-label"
      style={{ ...style, cursor: 'grab', userSelect: 'none' }}
      onMouseDown={handleMouseDown}
    >
      {String(value)}
    </text>
  )
}

// ─── Draggable legend ────────────────────────────────────────────────────────

interface DraggableLegendProps {
  yCols: string[]
  seriesNames: Record<string, string>
  colors: string[]
  strokeWidths: number[]
  chartType: string
  xPct: number
  yPct: number
  orientation: 'h' | 'v'
  bg: boolean
  fontFamily: string
  fontSize: number
  textColor: string
  containerRef: React.RefObject<HTMLDivElement>
  onUpdate: (patch: Partial<StyleOverrides>) => void
}

function DraggableLegend({
  yCols, seriesNames, colors, strokeWidths, chartType,
  xPct, yPct, orientation, bg, fontFamily, fontSize, textColor,
  containerRef, onUpdate,
}: DraggableLegendProps) {
  const lastClient = useRef({ x: 0, y: 0 })
  const xRef = useRef(xPct)
  const yRef = useRef(yPct)
  useEffect(() => { xRef.current = xPct }, [xPct])
  useEffect(() => { yRef.current = yPct }, [yPct])

  const isBar = chartType === 'bar'
  const isScatter = chartType === 'scatter'

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation()
    lastClient.current = { x: e.clientX, y: e.clientY }
    const onMove = (ev: MouseEvent) => {
      const r = containerRef.current?.getBoundingClientRect()
      if (!r) return
      xRef.current += (ev.clientX - lastClient.current.x) / r.width * 100
      yRef.current += (ev.clientY - lastClient.current.y) / r.height * 100
      lastClient.current = { x: ev.clientX, y: ev.clientY }
      onUpdate({ legendXPct: xRef.current, legendYPct: yRef.current })
    }
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      style={{
        position: 'absolute', left: `${xPct}%`, top: `${yPct}%`,
        transform: 'translate(-50%, 0)', zIndex: 12, userSelect: 'none',
        display: 'flex', flexDirection: orientation === 'h' ? 'row' : 'column',
        alignItems: orientation === 'h' ? 'center' : 'flex-start',
        gap: orientation === 'h' ? 14 : 5,
        background: bg ? 'rgba(255,255,255,0.92)' : 'transparent',
        border: bg ? '1px solid #e2e8f0' : 'none',
        borderRadius: 6, padding: '4px 10px', cursor: 'grab',
        boxShadow: bg ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
      }}
      onMouseDown={startDrag}
    >
      {yCols.map((col, i) => (
        <div key={col} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="26" height="14" style={{ flexShrink: 0 }}>
            {isBar
              ? <rect x="3" y="3" width="20" height="8" fill={colors[i]} rx="1" />
              : <>
                  {!isScatter && <line x1="1" y1="7" x2="25" y2="7" stroke={colors[i]} strokeWidth={Math.min(strokeWidths[i], 3)} />}
                  <circle cx="13" cy="7" r={isScatter ? 4 : 3.5} fill={colors[i]} />
                </>}
          </svg>
          <span style={{ fontFamily, fontSize, color: textColor, whiteSpace: 'nowrap' }}>
            {seriesNames[col] || col}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── PNG 300 DPI helpers ─────────────────────────────────────────────────────

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function injectPngDpi(dataUrl: string, dpi: number): string {
  const binary = atob(dataUrl.split(',')[1])
  const src = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) src[i] = binary.charCodeAt(i)
  const ppm = Math.round(dpi / 0.0254)
  // 21-byte pHYs chunk: 4 length + 4 type + 9 data + 4 CRC
  const chunk = new Uint8Array(21)
  chunk[3] = 9
  chunk[4] = 0x70; chunk[5] = 0x48; chunk[6] = 0x59; chunk[7] = 0x73 // "pHYs"
  chunk[8] = (ppm >>> 24) & 0xff; chunk[9] = (ppm >>> 16) & 0xff
  chunk[10] = (ppm >>> 8) & 0xff; chunk[11] = ppm & 0xff
  chunk[12] = chunk[8]; chunk[13] = chunk[9]; chunk[14] = chunk[10]; chunk[15] = chunk[11]
  chunk[16] = 1 // unit = metre
  const crc = crc32(chunk.slice(4, 17))
  chunk[17] = (crc >>> 24) & 0xff; chunk[18] = (crc >>> 16) & 0xff
  chunk[19] = (crc >>> 8) & 0xff; chunk[20] = crc & 0xff
  // Insert after 8-byte PNG signature + 25-byte IHDR = offset 33
  const out = new Uint8Array(src.length + 21)
  out.set(src.slice(0, 33)); out.set(chunk, 33); out.set(src.slice(33), 54)
  let str = ''
  out.forEach(b => { str += String.fromCharCode(b) })
  return 'data:image/png;base64,' + btoa(str)
}

// ─── Drag state ───────────────────────────────────────────────────────────────

type DragState =
  | { kind: 'text'; id: string; offsetXPct: number; offsetYPct: number }
  | { kind: 'arrow-body'; id: string; dx1: number; dy1: number; dx2: number; dy2: number }
  | { kind: 'arrow-end'; id: string; endpoint: 1 | 2 }
  | { kind: 'rect-body'; id: string; offsetXPct: number; offsetYPct: number }
  | { kind: 'rect-corner'; id: string; anchorXPct: number; anchorYPct: number }

// ─── Types ───────────────────────────────────────────────────────────────────

type ChartType = 'line' | 'lineOnly' | 'scatter' | 'bar'

interface ChartMouseEvent {
  activeLabel?: string | number
}

interface Props {
  data: Record<string, unknown>[]
  xCol: string
  yCols: string[]
  seriesNames: Record<string, string>
  errorCols: Record<string, string>
  xAxisLabel: string
  yAxisLabel: string
  chartType: ChartType
  styleName: StyleName
  styleOverrides: StyleOverrides
  annotations: ChartAnnotation[]
  onAnnotationsChange: (annotations: ChartAnnotation[]) => void
  onStyleChange?: (patch: Partial<StyleOverrides>) => void
  onSaveTemplate?: () => void
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChartPreview({
  data, xCol, yCols, seriesNames, errorCols,
  xAxisLabel, yAxisLabel, chartType, styleName, styleOverrides,
  annotations, onAnnotationsChange, onStyleChange, onSaveTemplate,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef<DragState | null>(null)
  const xLabelDxRef = useRef(styleOverrides.xLabelDx ?? 0)
  const xLabelDyRef = useRef(styleOverrides.xLabelDy ?? 0)
  const yLabelDxRef = useRef(styleOverrides.yLabelDx ?? 0)
  const yLabelDyRef = useRef(styleOverrides.yLabelDy ?? 0)
  useEffect(() => { xLabelDxRef.current = styleOverrides.xLabelDx ?? 0 }, [styleOverrides.xLabelDx])
  useEffect(() => { xLabelDyRef.current = styleOverrides.xLabelDy ?? 0 }, [styleOverrides.xLabelDy])
  useEffect(() => { yLabelDxRef.current = styleOverrides.yLabelDx ?? 0 }, [styleOverrides.yLabelDx])
  useEffect(() => { yLabelDyRef.current = styleOverrides.yLabelDy ?? 0 }, [styleOverrides.yLabelDy])

  // editingId: which text annotation is in text-edit mode
  const [editingId, _setEditingId] = useState<string | null>(null)
  const editingIdRef = useRef<string | null>(null)
  const setEditingId = (id: string | null) => { editingIdRef.current = id; _setEditingId(id) }

  // selectedId: which annotation is selected (shows handles)
  const [selectedId, _setSelectedId] = useState<string | null>(null)
  const selectedIdRef = useRef<string | null>(null)
  const setSelectedId = (id: string | null) => { selectedIdRef.current = id; _setSelectedId(id) }

  const [paywallOpen, setPaywallOpen] = useState(false)
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
  const [isDraggingAnnotation, setIsDraggingAnnotation] = useState(false)
  const [pointTooltip, setPointTooltip] = useState<{
    x: unknown; y: number; name: string; color: string; svgX: number; svgY: number
  } | null>(null)

  // Keep stable refs for the keydown handler (avoids re-registering on every render)
  const annotationsRef = useRef(annotations)
  const onAnnotationsChangeRef = useRef(onAnnotationsChange)
  useEffect(() => { annotationsRef.current = annotations }, [annotations])
  useEffect(() => { onAnnotationsChangeRef.current = onAnnotationsChange }, [onAnnotationsChange])

  // Delete / Escape keyboard shortcuts for selected annotation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const selId = selectedIdRef.current
      if ((e.key === 'Delete' || e.key === 'Backspace') && selId && !editingIdRef.current) {
        onAnnotationsChangeRef.current(annotationsRef.current.filter(a => a.id !== selId))
        selectedIdRef.current = null; _setSelectedId(null)
      }
      if (e.key === 'Escape') {
        selectedIdRef.current = null; _setSelectedId(null)
        editingIdRef.current = null; _setEditingId(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ─── Zoom state ─────────────────────────────────────────────────────────────

  const s = chartStyles[styleName]
  const axisColor = styleOverrides.axisColor ?? s.axisColor
  const axisWidth = styleOverrides.axisWidth ?? s.axisWidth
  const showGrid = styleOverrides.showGrid ?? s.showGrid
  const xTitleSize = styleOverrides.xTitleSize ?? s.fontSize
  const yTitleSize = styleOverrides.yTitleSize ?? s.fontSize
  const xTickSize = styleOverrides.xTickSize ?? s.tickFontSize
  const yTickSize = styleOverrides.yTickSize ?? s.tickFontSize
  const seriesLabel = (col: string) => seriesNames[col]?.trim() || formatAxisLabel(col)
  const seriesColor = (col: string, i: number) => styleOverrides.seriesColors?.[col] ?? s.colors[i % s.colors.length]
  const seriesStrokeWidth = (col: string) => styleOverrides.seriesStrokeWidths?.[col] ?? s.strokeWidth
  const seriesMarkerSize = (col: string) => styleOverrides.seriesMarkerSizes?.[col] ?? s.dotRadius
  const seriesMarkerShape = (col: string) => styleOverrides.seriesMarkerShapes?.[col] ?? 'circle'

  const isNumericX = data.length > 0 && typeof data[0][xCol] === 'number'
  const zoomEnabled = isNumericX && chartType !== 'bar'

  const [refLeft, setRefLeft] = useState<number | null>(null)
  const [refRight, setRefRight] = useState<number | null>(null)
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null)

  useEffect(() => {
    setZoomDomain(null); setRefLeft(null); setRefRight(null); setPointTooltip(null)
  }, [xCol, yCols.join(','), chartType, data.length])

  const handleMouseDown = (e: ChartMouseEvent) => {
    if (!zoomEnabled || e.activeLabel === undefined) return
    setRefLeft(Number(e.activeLabel)); setRefRight(null)
  }
  const handleMouseMove = (e: ChartMouseEvent) => {
    if (!zoomEnabled || refLeft === null || e.activeLabel === undefined) return
    setRefRight(Number(e.activeLabel))
  }
  const handleMouseUp = () => {
    if (refLeft !== null && refRight !== null && refLeft !== refRight)
      setZoomDomain([Math.min(refLeft, refRight), Math.max(refLeft, refRight)])
    setRefLeft(null); setRefRight(null)
  }
  const resetZoom = () => setZoomDomain(null)

  const inZoomRange = (x: unknown) =>
    zoomDomain === null || (typeof x === 'number' && x >= zoomDomain[0] && x <= zoomDomain[1])

  const hasError = (col: string) => !!errorCols[col]

  // ─── Scale / axis flags (must come before data processing) ──────────────────

  const xScale = styleOverrides.xScale ?? 'linear'
  const yScale = styleOverrides.yScale ?? 'linear'
  const isLogX = xScale === 'log'
  const isLogY = yScale === 'log'
  const yAxisAssignment = styleOverrides.yAxisAssignment ?? {}
  const hasRightAxis = yCols.some(col => yAxisAssignment[col] === 'right')
  const y2AxisLabel = styleOverrides.y2AxisLabel ?? ''

  // ─── Data processing ─────────────────────────────────────────────────────────

  const processedData = data
    .map(row => {
      const point: Record<string, unknown> = { x: row[xCol] }
      yCols.forEach(col => {
        const v = Number(row[col])
        // null out non-positive values so log scale doesn't break
        point[col] = isNaN(v) ? null : (isLogY && v <= 0 ? null : v)
        if (hasError(col)) {
          const e = Number(row[errorCols[col]])
          point[`error_${col}`] = isNaN(e) ? null : e
        }
      })
      return point
    })
    .filter(point => {
      if (!inZoomRange(point.x)) return false
      if (isLogX && isNumericX && typeof point.x === 'number' && point.x <= 0) return false
      return true
    })

  const scatterSeries = yCols.map((col, i) => ({
    key: col,
    color: seriesColor(col, i),
    data: data
      .map(row => {
        const point: Record<string, unknown> = { x: row[xCol], y: Number(row[col]) }
        if (hasError(col)) {
          const e = Number(row[errorCols[col]])
          point.error = isNaN(e) ? null : e
        }
        return point
      })
      .filter(d => {
        if (isNaN(d.y as number)) return false
        if (!inZoomRange(d.x)) return false
        if (isLogY && (d.y as number) <= 0) return false
        if (isLogX && isNumericX && typeof d.x === 'number' && d.x <= 0) return false
        return true
      }),
  }))

  const xValues = isNumericX
    ? data.map(row => Number(row[xCol])).filter(v => !isNaN(v) && inZoomRange(v) && (!isLogX || v > 0))
    : []
  const xRangeMin = styleOverrides.xMin ?? (xValues.length > 0 ? Math.min(...xValues) : undefined)
  const xRangeMax = styleOverrides.xMax ?? (xValues.length > 0 ? Math.max(...xValues) : undefined)
  const xStep = styleOverrides.xStep
  const xTicks = !isLogX && xRangeMin !== undefined && xRangeMax !== undefined
    ? (xStep ? buildStepTicks(xRangeMin, xRangeMax, xStep) : getNiceTicks(xRangeMin, xRangeMax))
    : undefined
  const xDomain = xTicks ? ([xTicks[0], xTicks[xTicks.length - 1]] as [number, number]) : undefined

  const yMin = styleOverrides.yMin
  const yMax = styleOverrides.yMax
  const yStep = styleOverrides.yStep
  // When dual axis: left domain uses only left-axis series
  const leftCols = hasRightAxis ? yCols.filter(col => yAxisAssignment[col] !== 'right') : yCols
  const allYValues = leftCols
    .flatMap(col => data.map(row => Number(row[col])))
    .filter(v => !isNaN(v) && (!isLogY || v > 0))
  const autoYMin = allYValues.length > 0 ? Math.min(...allYValues) : (isLogY ? 1 : 0)
  const autoYMax = allYValues.length > 0 ? Math.max(...allYValues) : (isLogY ? 10 : 1)
  const yTicks = !isLogY && yStep ? buildStepTicks(yMin ?? autoYMin, yMax ?? autoYMax, yStep) : undefined
  const yDomainProps: { domain?: [number | 'auto', number | 'auto']; allowDataOverflow?: boolean; ticks?: number[] } =
    isLogY
      ? { domain: [autoYMin / 2, autoYMax * 2] }
      : (yMin !== undefined || yMax !== undefined || yTicks)
        ? {
            domain: [yTicks ? yTicks[0] : (yMin ?? 'auto'), yTicks ? yTicks[yTicks.length - 1] : (yMax ?? 'auto')],
            allowDataOverflow: true,
            ...(yTicks ? { ticks: yTicks } : {}),
          }
        : {}

  // ─── Style derivation ────────────────────────────────────────────────────────

  const showFrame = s.showFrame
  const frameLines = showFrame
    ? <Customized component={({ offset }: { offset?: { top: number; left: number; width: number; height: number } }) => {
        if (!offset) return null
        const { top, left, width, height } = offset
        return (
          <g>
            <line x1={left} y1={top} x2={left + width} y2={top} stroke={axisColor} strokeWidth={axisWidth} />
            <line x1={left + width} y1={top} x2={left + width} y2={top + height} stroke={axisColor} strokeWidth={axisWidth} />
          </g>
        )
      }} />
    : null

  const annotationFontSize = styleOverrides.annotationFontSize ?? 12
  const fontFamily = styleOverrides.fontFamily ?? s.fontFamily
  const boldLabels = styleOverrides.boldLabels ?? false
  const tickFontWeight = boldLabels ? 'bold' : 'normal'
  const titleFontWeight = boldLabels ? 'bold' : s.labelFontWeight
  const xTickStyle = { fontSize: xTickSize, fontFamily, fill: axisColor, fontWeight: tickFontWeight }
  const yTickStyle = { fontSize: yTickSize, fontFamily, fill: axisColor, fontWeight: tickFontWeight }
  const axisLine = { stroke: axisColor, strokeWidth: axisWidth }
  const margin = s.margin
  const xLabelStyle = { fontFamily, fontSize: xTitleSize, fontWeight: titleFontWeight, fill: axisColor }
  const yLabelStyle = { fontFamily, fontSize: yTitleSize, fontWeight: titleFontWeight, fill: axisColor }
  const legendFontSize = styleOverrides.legendFontSize ?? s.tickFontSize
  const legendPosition = styleOverrides.legendPosition ?? 'top'
  const legendEnabled = (styleOverrides.showLegend ?? yCols.length > 1) && yCols.length > 1
  const legend = null  // replaced by DraggableLegend overlay
  const legendDefaultPos: Record<string, { x: number; y: number }> = {
    top: { x: 50, y: 3 }, bottom: { x: 50, y: 89 }, left: { x: 7, y: 45 }, right: { x: 88, y: 45 },
  }
  const legendPos = styleOverrides.legendXPct !== undefined
    ? { x: styleOverrides.legendXPct, y: styleOverrides.legendYPct ?? 3 }
    : (legendDefaultPos[legendPosition] ?? legendDefaultPos.top)
  const resolvedColors = yCols.map((col, i) =>
    (styleOverrides.seriesColors ?? {})[col] ?? s.colors[i % s.colors.length]
  )
  const resolvedStrokeWidths = yCols.map(col =>
    (styleOverrides.seriesStrokeWidths ?? {})[col] ?? s.strokeWidth
  )
  const figureWidth = styleOverrides.figureWidth
  const figureHeight = styleOverrides.figureHeight ?? s.chartHeight
  const xLabelText = xAxisLabel.trim() || formatAxisLabel(xCol)
  const xLabel = {
    content: (props: Record<string, unknown>) => (
      <DraggableAxisLabel
        viewBox={props.viewBox as DraggableLabelProps['viewBox']}
        value={xLabelText}
        dx={styleOverrides.xLabelDx ?? 0}
        dy={styleOverrides.xLabelDy ?? 14}
        style={xLabelStyle}
        onDrag={(ddx, ddy) => {
          xLabelDxRef.current += ddx; xLabelDyRef.current += ddy
          onStyleChange?.({ xLabelDx: xLabelDxRef.current, xLabelDy: xLabelDyRef.current })
        }}
      />
    ),
  }
  const yLabelText = yAxisLabel.trim() || (yCols.length === 1 ? formatAxisLabel(yCols[0]) : '')
  const yLabel = yLabelText ? {
    content: (props: Record<string, unknown>) => (
      <DraggableAxisLabel
        viewBox={props.viewBox as DraggableLabelProps['viewBox']}
        value={yLabelText}
        angle={-90}
        dx={styleOverrides.yLabelDx ?? -12}
        dy={styleOverrides.yLabelDy ?? 0}
        style={yLabelStyle}
        onDrag={(ddx, ddy) => {
          yLabelDxRef.current += ddx; yLabelDyRef.current += ddy
          onStyleChange?.({ yLabelDx: yLabelDxRef.current, yLabelDy: yLabelDyRef.current })
        }}
      />
    ),
  } : undefined
  const grid = showGrid ? <CartesianGrid strokeDasharray="3 3" stroke={s.gridColor} /> : null
  const zoomArea = refLeft !== null && refRight !== null
    ? <ReferenceArea x1={refLeft} x2={refRight} strokeOpacity={0.3} fill={s.colors[0]} fillOpacity={0.12} />
    : null

  // ─── Marker renderers ────────────────────────────────────────────────────────

  const markerRenderer = (shape: MarkerShape, size: number, color: string) => (props: unknown) => {
    const { cx, cy, key } = props as { cx?: number; cy?: number; key?: Key }
    if (cx === undefined || cy === undefined) return <g key={key} />
    return renderMarker(cx, cy, shape, size, color, key) ?? <g key={key} />
  }

  // Dot with transparent hit-area for point tooltip on line charts
  const makeLineDot = (col: string, color: string, shape: MarkerShape, size: number) =>
    (props: unknown) => {
      const { cx, cy, payload } = props as { cx?: number; cy?: number; payload?: Record<string, unknown> }
      if (cx === undefined || cy === undefined || !payload) return <g />
      const hitR = Math.max(size + 5, 9)
      return (
        <g key={`ldot-${col}-${cx}-${cy}`}>
          {renderMarker(cx, cy, shape, size, color) ?? <circle cx={cx} cy={cy} r={size} fill={color} />}
          <circle
            cx={cx} cy={cy} r={hitR} fill="transparent"
            onMouseEnter={() => {
              if (draggingRef.current) return
              setPointTooltip({ x: payload.x, y: payload[col] as number, name: seriesLabel(col), color, svgX: cx, svgY: cy })
            }}
            onMouseLeave={() => setPointTooltip(null)}
          />
        </g>
      )
    }

  // ─── Annotation helpers ──────────────────────────────────────────────────────

  const updateAnnotation = (id: string, changes: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onAnnotationsChange(annotations.map(a => a.id === id ? { ...(a as any), ...changes } as ChartAnnotation : a))
  }

  const removeAnnotation = (id: string) => {
    onAnnotationsChange(annotations.filter(a => a.id !== id))
    if (selectedIdRef.current === id) { selectedIdRef.current = null; _setSelectedId(null) }
    if (editingIdRef.current === id) { editingIdRef.current = null; _setEditingId(null) }
  }

  const addAnnotation = (type: string, options: Record<string, unknown> = {}) => {
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `ann-${Date.now()}`
    if (type === 'text') {
      onAnnotationsChange([...annotations, { id, type: 'text', text: 'Texte', xPct: 50, yPct: 50 }])
    } else if (type === 'line') {
      onAnnotationsChange([...annotations, {
        id, type: 'line',
        dash: options.dash ?? false,
        headStart: options.headStart ?? false,
        headEnd: options.headEnd ?? false,
        x1Pct: 28, y1Pct: 65, x2Pct: 58, y2Pct: 35,
      } as LineAnnotation])
    } else if (type === 'rect') {
      onAnnotationsChange([...annotations, { id, type: 'rect', xPct: 28, yPct: 28, widthPct: 30, heightPct: 20 }])
    } else if (type === 'ellipse') {
      onAnnotationsChange([...annotations, { id, type: 'ellipse', xPct: 28, yPct: 28, widthPct: 30, heightPct: 20 }])
    }
    setSelectedId(id)
  }

  const insertSymbol = (sym: string) => {
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `ann-${Date.now()}`
    onAnnotationsChange([...annotations, { id, type: 'text', text: sym, xPct: 50, yPct: 50 }])
    setSelectedId(id)
  }

  // ─── Drag start helpers ──────────────────────────────────────────────────────

  const getPct = (e: React.PointerEvent) => {
    const rect = chartRef.current?.getBoundingClientRect()
    if (!rect) return { xPct: 0, yPct: 0 }
    return {
      xPct: ((e.clientX - rect.left) / rect.width) * 100,
      yPct: ((e.clientY - rect.top) / rect.height) * 100,
    }
  }

  const startTextDrag = (e: React.PointerEvent, ann: TextAnnotation) => {
    if (editingIdRef.current === ann.id) return
    e.stopPropagation()
    setSelectedId(ann.id)
    setPointTooltip(null)
    if (!chartRef.current) return
    const { xPct, yPct } = getPct(e)
    draggingRef.current = { kind: 'text', id: ann.id, offsetXPct: xPct - ann.xPct, offsetYPct: yPct - ann.yPct }
    setIsDraggingAnnotation(true)
  }

  const startArrowBodyDrag = (e: React.PointerEvent, ann: { id: string; x1Pct: number; y1Pct: number; x2Pct: number; y2Pct: number }) => {
    e.stopPropagation()
    setSelectedId(ann.id)
    setPointTooltip(null)
    if (!chartRef.current) return
    const { xPct, yPct } = getPct(e)
    draggingRef.current = {
      kind: 'arrow-body', id: ann.id,
      dx1: xPct - ann.x1Pct, dy1: yPct - ann.y1Pct,
      dx2: xPct - ann.x2Pct, dy2: yPct - ann.y2Pct,
    }
    setIsDraggingAnnotation(true)
  }

  const startArrowEndDrag = (e: React.PointerEvent, id: string, endpoint: 1 | 2) => {
    e.stopPropagation()
    setPointTooltip(null)
    draggingRef.current = { kind: 'arrow-end', id, endpoint }
    setIsDraggingAnnotation(true)
  }

  const startRectBodyDrag = (e: React.PointerEvent, ann: { id: string; xPct: number; yPct: number; widthPct: number; heightPct: number }) => {
    e.stopPropagation()
    setSelectedId(ann.id)
    setPointTooltip(null)
    if (!chartRef.current) return
    const { xPct, yPct } = getPct(e)
    draggingRef.current = {
      kind: 'rect-body', id: ann.id,
      offsetXPct: xPct - ann.xPct, offsetYPct: yPct - ann.yPct,
    }
    setIsDraggingAnnotation(true)
  }

  const startRectCornerDrag = (e: React.PointerEvent, ann: { id: string; xPct: number; yPct: number; widthPct: number; heightPct: number }, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    e.stopPropagation()
    const anchor = {
      nw: { xPct: ann.xPct + ann.widthPct, yPct: ann.yPct + ann.heightPct },
      ne: { xPct: ann.xPct,                yPct: ann.yPct + ann.heightPct },
      sw: { xPct: ann.xPct + ann.widthPct, yPct: ann.yPct },
      se: { xPct: ann.xPct,                yPct: ann.yPct },
    }[corner]
    draggingRef.current = { kind: 'rect-corner', id: ann.id, anchorXPct: anchor.xPct, anchorYPct: anchor.yPct }
    setIsDraggingAnnotation(true)
  }

  // ─── Container pointer handlers ──────────────────────────────────────────────

  const handleContainerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = draggingRef.current
    const container = chartRef.current
    if (!drag || !container) return
    e.preventDefault()
    const rect = container.getBoundingClientRect()
    const xPct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    const yPct = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
    if (drag.kind === 'text') {
      updateAnnotation(drag.id, { xPct: xPct - drag.offsetXPct, yPct: yPct - drag.offsetYPct })
    } else if (drag.kind === 'arrow-body') {
      updateAnnotation(drag.id, {
        x1Pct: xPct - drag.dx1, y1Pct: yPct - drag.dy1,
        x2Pct: xPct - drag.dx2, y2Pct: yPct - drag.dy2,
      })
    } else if (drag.kind === 'arrow-end') {
      if (drag.endpoint === 1) updateAnnotation(drag.id, { x1Pct: xPct, y1Pct: yPct })
      else updateAnnotation(drag.id, { x2Pct: xPct, y2Pct: yPct })
    } else if (drag.kind === 'rect-body') {
      updateAnnotation(drag.id, { xPct: xPct - drag.offsetXPct, yPct: yPct - drag.offsetYPct })
    } else if (drag.kind === 'rect-corner') {
      const newXPct = Math.min(xPct, drag.anchorXPct)
      const newYPct = Math.min(yPct, drag.anchorYPct)
      updateAnnotation(drag.id, {
        xPct: newXPct, yPct: newYPct,
        widthPct: Math.abs(xPct - drag.anchorXPct),
        heightPct: Math.abs(yPct - drag.anchorYPct),
      })
    }
  }

  const handleContainerPointerUp = () => {
    draggingRef.current = null
    setIsDraggingAnnotation(false)
  }

  // Deselect when clicking the chart background (not on an annotation)
  const handleContainerClick = () => {
    setSelectedId(null)
    if (editingIdRef.current) setEditingId(null)
  }

  // ─── Chart rendering ─────────────────────────────────────────────────────────

  const renderChart = () => {
    if (chartType === 'scatter') {
      return (
        <ScatterChart margin={margin} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onDoubleClick={resetZoom}>
          {grid}
          <XAxis dataKey="x" type={isNumericX ? 'number' : 'category'} domain={xDomain} ticks={xTicks} scale={isNumericX ? xScale : undefined} tick={xTickStyle} axisLine={axisLine} tickLine={axisLine} label={xLabel} allowDataOverflow height={65} />
          <YAxis dataKey="y" type="number" scale={yScale} {...yDomainProps} tick={yTickStyle} axisLine={axisLine} tickLine={axisLine} label={yLabel} width={80} />
          <Tooltip content={<ScatterTooltipContent />} cursor={false} />
          {legend}
          {scatterSeries.map(series => {
            const markerSize = seriesMarkerSize(series.key)
            const markerShape = seriesMarkerShape(series.key)
            return (
              <Scatter key={series.key} data={series.data} name={seriesLabel(series.key)} fill={series.color} shape={markerRenderer(markerShape, markerSize, series.color)}>
                {hasError(series.key) && <ErrorBar dataKey="error" width={4} strokeWidth={1} stroke={axisColor} direction="y" />}
              </Scatter>
            )
          })}
          {zoomArea}
          {frameLines}
        </ScatterChart>
      )
    }

    if (chartType === 'bar') {
      return (
        <BarChart data={processedData} margin={margin}>
          {grid}
          <XAxis dataKey="x" tick={xTickStyle} axisLine={axisLine} tickLine={axisLine} label={xLabel} height={65} />
          <YAxis yAxisId="left" scale={yScale} {...yDomainProps} tick={yTickStyle} axisLine={axisLine} tickLine={axisLine} label={yLabel} width={80} />
          {hasRightAxis && (
            <YAxis yAxisId="right" orientation="right" scale={yScale} tick={yTickStyle} axisLine={axisLine} tickLine={axisLine}
              label={y2AxisLabel ? { value: y2AxisLabel, angle: 90, position: 'insideRight', style: yLabelStyle } : undefined}
              width={80} />
          )}
          <Tooltip content={<BarTooltipContent />} cursor={false} />
          {legend}
          {yCols.map((col, i) => {
            const axisId = hasRightAxis ? (yAxisAssignment[col] === 'right' ? 'right' : 'left') : 'left'
            return (
              <Bar key={col} dataKey={col} yAxisId={axisId} name={seriesLabel(col)} fill={seriesColor(col, i)} radius={[s.barRadius, s.barRadius, 0, 0]}>
                {hasError(col) && <ErrorBar dataKey={`error_${col}`} width={4} strokeWidth={1} stroke={axisColor} direction="y" />}
              </Bar>
            )
          })}
          {frameLines}
        </BarChart>
      )
    }

    // Build right-axis label config
    const y2Label = y2AxisLabel ? {
      content: (props: Record<string, unknown>) => (
        <DraggableAxisLabel
          viewBox={props.viewBox as DraggableLabelProps['viewBox']}
          value={y2AxisLabel}
          angle={90}
          dx={styleOverrides.yLabelDx ?? 12}
          dy={styleOverrides.yLabelDy ?? 0}
          style={yLabelStyle}
          onDrag={(ddx, ddy) => {
            yLabelDxRef.current += ddx; yLabelDyRef.current += ddy
            onStyleChange?.({ yLabelDx: yLabelDxRef.current, yLabelDy: yLabelDyRef.current })
          }}
        />
      ),
    } : undefined

    return (
      <LineChart data={processedData} margin={hasRightAxis ? { ...margin, right: 90 } : margin} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onDoubleClick={resetZoom}>
        {grid}
        <XAxis dataKey="x" type={isNumericX ? 'number' : 'category'} domain={xDomain} ticks={xTicks} scale={isNumericX ? xScale : undefined} tick={xTickStyle} axisLine={axisLine} tickLine={axisLine} label={xLabel} allowDataOverflow height={65} />
        <YAxis yAxisId="left" scale={yScale} {...yDomainProps} tick={yTickStyle} axisLine={axisLine} tickLine={axisLine} label={yLabel} width={80} />
        {hasRightAxis && (
          <YAxis yAxisId="right" orientation="right" scale={yScale} tick={yTickStyle} axisLine={axisLine} tickLine={axisLine} label={y2Label} width={80} />
        )}
        <Tooltip content={() => null} cursor={false} />
        {legend}
        {yCols.map((col, i) => {
          const color = seriesColor(col, i)
          const showDots = chartType !== 'lineOnly'
          const markerSize = seriesMarkerSize(col)
          const markerShape = seriesMarkerShape(col)
          const axisId = hasRightAxis ? (yAxisAssignment[col] === 'right' ? 'right' : 'left') : 'left'
          return (
            <Line key={col} type="monotone" dataKey={col} yAxisId={axisId} name={seriesLabel(col)} stroke={color} strokeWidth={seriesStrokeWidth(col)}
              dot={showDots ? makeLineDot(col, color, markerShape, markerSize) : false}
              activeDot={false} connectNulls>
              {hasError(col) && <ErrorBar dataKey={`error_${col}`} width={4} strokeWidth={1} stroke={axisColor} direction="y" />}
            </Line>
          )
        })}
        {zoomArea}
        {frameLines}
      </LineChart>
    )
  }

  // ─── Export ──────────────────────────────────────────────────────────────────

  const triggerExport = async (type: 'png' | 'svg') => {
    gtagEvent('download_click', { file_type: type })
    if (isProUser()) {
      if (type === 'png') doExportPNG()
      else doExportSVG()
      return
    }
    // Capture low-res preview for paywall background
    let preview: string | null = null
    if (chartRef.current) {
      try {
        const { toPng } = await import('html-to-image')
        preview = await toPng(chartRef.current, { backgroundColor: 'white', pixelRatio: 0.4 })
      } catch { /* ignore */ }
    }
    setPreviewDataUrl(preview)
    gtagEvent('paywall_shown', { file_type: type })
    setPaywallOpen(true)
  }

  const doExportPNG = async () => {
    if (!chartRef.current) return
    trackExport()
    const { toPng } = await import('html-to-image')
    try {
      const raw = await toPng(chartRef.current, { backgroundColor: 'white', pixelRatio: 300 / 96 })
      const dataUrl = injectPngDpi(raw, 300)
      const a = document.createElement('a')
      a.href = dataUrl; a.download = 'figureready.png'; a.click()
    } catch (err) { console.error('PNG export failed:', err) }
  }

  const doExportSVG = () => {
    if (!chartRef.current) return
    trackExport()
    const svg = chartRef.current.querySelector('svg')
    if (!svg) return
    const containerRect = chartRef.current.getBoundingClientRect()
    const svgRect = svg.getBoundingClientRect()

    const ns = 'http://www.w3.org/2000/svg'
    const INKNS = 'http://www.inkscape.org/namespaces/inkscape'

    // Clone source SVG for element extraction
    const source = svg.cloneNode(true) as SVGSVGElement

    // Build new layered output SVG
    const out = document.createElementNS(ns, 'svg')
    out.setAttribute('xmlns', ns)
    out.setAttribute('xmlns:inkscape', INKNS)
    out.setAttribute('width', source.getAttribute('width') || String(Math.round(svgRect.width)))
    out.setAttribute('height', source.getAttribute('height') || String(Math.round(svgRect.height)))
    if (source.getAttribute('viewBox')) out.setAttribute('viewBox', source.getAttribute('viewBox')!)

    // defs (arrowheads for annotations)
    const defs = document.createElementNS(ns, 'defs')
    const hasArrows = annotations.some(a => a.type === 'arrow' || (a.type === 'line' && (a.headEnd || a.headStart)))
    if (hasArrows) {
      const mkMarker = (id: string, points: string, refX: string) => {
        const m = document.createElementNS(ns, 'marker')
        m.setAttribute('id', id); m.setAttribute('markerWidth', '8'); m.setAttribute('markerHeight', '6')
        m.setAttribute('refX', refX); m.setAttribute('refY', '3'); m.setAttribute('orient', 'auto')
        const p = document.createElementNS(ns, 'polygon')
        p.setAttribute('points', points); p.setAttribute('fill', axisColor)
        m.appendChild(p); return m
      }
      defs.appendChild(mkMarker('fr-exp-arrow', '0 0, 8 3, 0 6', '7'))
      defs.appendChild(mkMarker('fr-exp-arrow-rev', '8 0, 0 3, 8 6', '1'))
    }
    out.appendChild(defs)

    // White background
    const bg = document.createElementNS(ns, 'rect')
    bg.setAttribute('width', '100%'); bg.setAttribute('height', '100%'); bg.setAttribute('fill', 'white')
    out.appendChild(bg)

    // Layer helper (Inkscape-compatible)
    const mkLayer = (id: string, label: string) => {
      const g = document.createElementNS(ns, 'g')
      g.setAttribute('id', id)
      g.setAttributeNS(INKNS, 'inkscape:label', label)
      g.setAttributeNS(INKNS, 'inkscape:groupmode', 'layer')
      return g
    }

    const gridLayer  = mkLayer('layer-grid',        'Grid')
    const axesLayer  = mkLayer('layer-axes',        'Axes')
    const dataLayer  = mkLayer('layer-data',        'Data')
    const textLayer  = mkLayer('layer-text',        'Text')
    const annotLayer = mkLayer('layer-annotations', 'Annotations')

    // Move axis title labels into text layer (remove from source before cloning axes)
    source.querySelectorAll('.fr-axis-label').forEach(el => {
      textLayer.appendChild(el.cloneNode(true))
      el.remove()
    })

    // Grid
    source.querySelectorAll('.recharts-cartesian-grid').forEach(el => gridLayer.appendChild(el.cloneNode(true)))

    // Axes (lines, tick marks, tick labels — minus the title labels extracted above)
    source.querySelectorAll('.recharts-cartesian-axis').forEach(el => axesLayer.appendChild(el.cloneNode(true)))

    // Data series (lines + dots, scatter, bars)
    source.querySelectorAll('.recharts-line, .recharts-scatter, .recharts-bar').forEach(el => dataLayer.appendChild(el.cloneNode(true)))

    out.appendChild(gridLayer)
    out.appendChild(axesLayer)
    out.appendChild(dataLayer)
    out.appendChild(textLayer)
    out.appendChild(annotLayer)

    // Coordinate conversion: annotation % positions → SVG px
    const toSVGX = (pct: number) => (pct / 100) * containerRect.width - (svgRect.left - containerRect.left)
    const toSVGY = (pct: number) => (pct / 100) * containerRect.height - (svgRect.top - containerRect.top)

    annotations.forEach(ann => {
      if (ann.type === 'text') {
        const text = document.createElementNS(ns, 'text')
        text.setAttribute('x', String(toSVGX(ann.xPct))); text.setAttribute('y', String(toSVGY(ann.yPct)))
        text.setAttribute('text-anchor', 'middle'); text.setAttribute('dominant-baseline', 'middle')
        text.setAttribute('font-family', fontFamily); text.setAttribute('font-size', String(annotationFontSize))
        text.setAttribute('fill', axisColor)
        if (boldLabels) text.setAttribute('font-weight', 'bold')
        text.textContent = ann.text
        annotLayer.appendChild(text)
      } else if (ann.type === 'arrow') {
        const line = document.createElementNS(ns, 'line')
        line.setAttribute('x1', String(toSVGX(ann.x1Pct))); line.setAttribute('y1', String(toSVGY(ann.y1Pct)))
        line.setAttribute('x2', String(toSVGX(ann.x2Pct))); line.setAttribute('y2', String(toSVGY(ann.y2Pct)))
        line.setAttribute('stroke', axisColor); line.setAttribute('stroke-width', '1.5')
        line.setAttribute('marker-end', 'url(#fr-exp-arrow)')
        annotLayer.appendChild(line)
      } else if (ann.type === 'line') {
        const line = document.createElementNS(ns, 'line')
        line.setAttribute('x1', String(toSVGX(ann.x1Pct))); line.setAttribute('y1', String(toSVGY(ann.y1Pct)))
        line.setAttribute('x2', String(toSVGX(ann.x2Pct))); line.setAttribute('y2', String(toSVGY(ann.y2Pct)))
        line.setAttribute('stroke', axisColor); line.setAttribute('stroke-width', '1.5')
        if (ann.dash) line.setAttribute('stroke-dasharray', '6 4')
        if (ann.headEnd) line.setAttribute('marker-end', 'url(#fr-exp-arrow)')
        if (ann.headStart) line.setAttribute('marker-start', 'url(#fr-exp-arrow-rev)')
        annotLayer.appendChild(line)
      } else if (ann.type === 'rect') {
        const r = document.createElementNS(ns, 'rect')
        r.setAttribute('x', String(toSVGX(ann.xPct))); r.setAttribute('y', String(toSVGY(ann.yPct)))
        r.setAttribute('width', String((ann.widthPct / 100) * containerRect.width))
        r.setAttribute('height', String((ann.heightPct / 100) * containerRect.height))
        r.setAttribute('fill', 'none'); r.setAttribute('stroke', axisColor); r.setAttribute('stroke-width', '1.5')
        annotLayer.appendChild(r)
      } else if (ann.type === 'ellipse') {
        const el = document.createElementNS(ns, 'ellipse')
        const rx = (ann.widthPct / 100) * containerRect.width / 2
        const ry = (ann.heightPct / 100) * containerRect.height / 2
        el.setAttribute('cx', String(toSVGX(ann.xPct) + rx)); el.setAttribute('cy', String(toSVGY(ann.yPct) + ry))
        el.setAttribute('rx', String(rx)); el.setAttribute('ry', String(ry))
        el.setAttribute('fill', 'none'); el.setAttribute('stroke', axisColor); el.setAttribute('stroke-width', '1.5')
        annotLayer.appendChild(el)
      }
    })

    const svgStr = new XMLSerializer().serializeToString(out)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'figureready.svg'; a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Handle panel ────────────────────────────────────────────────────────────

  const HANDLE_SIZE = 10
  const cornerHandleStyle = (cursor: string): React.CSSProperties => ({
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    background: 'white',
    border: '1.5px solid #3b82f6',
    borderRadius: 2,
    cursor,
    zIndex: 20,
    transform: 'translate(-50%, -50%)',
    touchAction: 'none',
  })

  const DeleteBtn = ({ onDelete }: { onDelete: () => void }) => (
    <button
      onClick={e => { e.stopPropagation(); onDelete() }}
      style={{
        position: 'absolute', top: -8, right: -8,
        width: 16, height: 16, background: '#ef4444', color: 'white',
        border: 'none', borderRadius: '50%', fontSize: 11, lineHeight: '1',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 25,
      }}
    >×</button>
  )

  // ─── Fill helpers ────────────────────────────────────────────────────────────

  const FILL_COLORS = ['#1e293b', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']

  const toRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${opacity})`
  }

  // ─── Partition annotations by type ───────────────────────────────────────────

  const textAnnotations = annotations.filter((a): a is TextAnnotation => a.type === 'text')
  const arrowAnnotations = annotations.filter((a): a is ArrowAnnotation => a.type === 'arrow')
  const lineAnnotations = annotations.filter((a): a is LineAnnotation => a.type === 'line')
  const rectAnnotations = annotations.filter((a): a is RectAnnotation => a.type === 'rect')
  const ellipseAnnotations = annotations.filter((a): a is EllipseAnnotation => a.type === 'ellipse')

  // ─── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <>
      {paywallOpen && <PaywallModal previewDataUrl={previewDataUrl} onClose={() => setPaywallOpen(false)} />}
      {/* ── Full-height editor layout ──────────────────────────────────────── */}
      <div className="flex flex-col" style={{ height: '100%' }}>

        {/* Chrome bar: annotation tools + export */}
        <div className="flex items-center justify-between gap-4 px-4 py-1.5 bg-white border-b border-slate-200 shrink-0 z-20">
          <AnnotationToolbar onAdd={addAnnotation} onInsertSymbol={insertSymbol} />
          <div className="flex items-center gap-2 shrink-0">
            {zoomDomain && (
              <button
                onClick={resetZoom}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Reset zoom
              </button>
            )}
            {onSaveTemplate && (
              <button
                onClick={onSaveTemplate}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save as Template
              </button>
            )}
            <button
              onClick={() => triggerExport('svg')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <DownloadIcon />
              SVG
            </button>
            <button
              onClick={() => triggerExport('png')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1D6F42] text-white text-xs font-semibold hover:bg-[#155d35] transition-colors shadow-sm"
            >
              <DownloadIcon />
              PNG · 300 DPI
            </button>
          </div>
        </div>

        {/* Light workspace */}
        <div className="flex-1 overflow-auto bg-slate-50">
          <div className="min-h-full flex items-center justify-center p-6 lg:p-10">
            <div className="overflow-x-auto">
              <div
                ref={chartRef}
                className="relative bg-white p-6 rounded-xl"
                style={{
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.08)',
                  fontFamily,
                  cursor: isDraggingAnnotation ? 'grabbing' : (zoomEnabled ? 'crosshair' : 'default'),
                  width: figureWidth ? `${figureWidth}px` : '700px',
                  userSelect: 'none',
                }}
                onContextMenu={e => e.preventDefault()}
                onPointerMove={handleContainerPointerMove}
                onPointerUp={handleContainerPointerUp}
                onClick={handleContainerClick}
              >
            {/* Chart */}
            <ResponsiveContainer width="100%" height={figureHeight}>
              {renderChart() as React.ReactElement}
            </ResponsiveContainer>

            {/* Draggable legend overlay */}
            {legendEnabled && (
              <DraggableLegend
                yCols={yCols}
                seriesNames={seriesNames}
                colors={resolvedColors}
                strokeWidths={resolvedStrokeWidths}
                chartType={chartType}
                xPct={legendPos.x}
                yPct={legendPos.y}
                orientation={styleOverrides.legendOrientation ?? 'h'}
                bg={styleOverrides.legendBg ?? true}
                fontFamily={fontFamily}
                fontSize={legendFontSize}
                textColor={axisColor}
                containerRef={chartRef}
                onUpdate={(patch) => onStyleChange?.(patch)}
              />
            )}

            {/* SVG overlay for arrows */}
            <svg
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                pointerEvents: 'none', overflow: 'visible',
              }}
            >
              <defs>
                <marker id="fr-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill={axisColor} />
                </marker>
                <marker id="fr-arrow-sel" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
                </marker>
                <marker id="fr-arrow-rev" markerWidth="8" markerHeight="6" refX="1" refY="3" orient="auto">
                  <polygon points="8 0, 0 3, 8 6" fill={axisColor} />
                </marker>
                <marker id="fr-arrow-rev-sel" markerWidth="8" markerHeight="6" refX="1" refY="3" orient="auto">
                  <polygon points="8 0, 0 3, 8 6" fill="#3b82f6" />
                </marker>
              </defs>
              {/* Legacy arrow annotations */}
              {arrowAnnotations.map(ann => {
                const isSel = selectedId === ann.id
                return (
                  <g key={ann.id}>
                    <line
                      x1={`${ann.x1Pct}%`} y1={`${ann.y1Pct}%`}
                      x2={`${ann.x2Pct}%`} y2={`${ann.y2Pct}%`}
                      stroke="transparent" strokeWidth={14}
                      style={{ pointerEvents: 'all', cursor: 'move' }}
                      onClick={e => { e.stopPropagation(); setSelectedId(ann.id) }}
                      onPointerDown={e => startArrowBodyDrag(e, ann)}
                    />
                    <line
                      x1={`${ann.x1Pct}%`} y1={`${ann.y1Pct}%`}
                      x2={`${ann.x2Pct}%`} y2={`${ann.y2Pct}%`}
                      stroke={isSel ? '#3b82f6' : axisColor}
                      strokeWidth={1.5}
                      markerEnd={isSel ? 'url(#fr-arrow-sel)' : 'url(#fr-arrow)'}
                      style={{ pointerEvents: 'none' }}
                    />
                    {isSel && (
                      <>
                        <circle cx={`${ann.x1Pct}%`} cy={`${ann.y1Pct}%`} r={5}
                          fill="white" stroke="#3b82f6" strokeWidth={1.5}
                          style={{ pointerEvents: 'all', cursor: 'crosshair' }}
                          onClick={e => e.stopPropagation()}
                          onPointerDown={e => startArrowEndDrag(e, ann.id, 1)}
                        />
                        <circle cx={`${ann.x2Pct}%`} cy={`${ann.y2Pct}%`} r={5}
                          fill="white" stroke="#3b82f6" strokeWidth={1.5}
                          style={{ pointerEvents: 'all', cursor: 'crosshair' }}
                          onClick={e => e.stopPropagation()}
                          onPointerDown={e => startArrowEndDrag(e, ann.id, 2)}
                        />
                      </>
                    )}
                  </g>
                )
              })}
              {/* New line annotations (solid/dashed, optional arrowheads) */}
              {lineAnnotations.map(ann => {
                const isSel = selectedId === ann.id
                const strokeColor = isSel ? '#3b82f6' : axisColor
                const mEnd = ann.headEnd ? (isSel ? 'url(#fr-arrow-sel)' : 'url(#fr-arrow)') : undefined
                const mStart = ann.headStart ? (isSel ? 'url(#fr-arrow-rev-sel)' : 'url(#fr-arrow-rev)') : undefined
                return (
                  <g key={ann.id}>
                    <line
                      x1={`${ann.x1Pct}%`} y1={`${ann.y1Pct}%`}
                      x2={`${ann.x2Pct}%`} y2={`${ann.y2Pct}%`}
                      stroke="transparent" strokeWidth={14}
                      style={{ pointerEvents: 'all', cursor: 'move' }}
                      onClick={e => { e.stopPropagation(); setSelectedId(ann.id) }}
                      onPointerDown={e => startArrowBodyDrag(e, ann)}
                    />
                    <line
                      x1={`${ann.x1Pct}%`} y1={`${ann.y1Pct}%`}
                      x2={`${ann.x2Pct}%`} y2={`${ann.y2Pct}%`}
                      stroke={strokeColor} strokeWidth={1.5}
                      strokeDasharray={ann.dash ? '6 4' : undefined}
                      markerEnd={mEnd}
                      markerStart={mStart}
                      style={{ pointerEvents: 'none' }}
                    />
                    {isSel && (
                      <>
                        <circle cx={`${ann.x1Pct}%`} cy={`${ann.y1Pct}%`} r={5}
                          fill="white" stroke="#3b82f6" strokeWidth={1.5}
                          style={{ pointerEvents: 'all', cursor: 'crosshair' }}
                          onClick={e => e.stopPropagation()}
                          onPointerDown={e => startArrowEndDrag(e, ann.id, 1)}
                        />
                        <circle cx={`${ann.x2Pct}%`} cy={`${ann.y2Pct}%`} r={5}
                          fill="white" stroke="#3b82f6" strokeWidth={1.5}
                          style={{ pointerEvents: 'all', cursor: 'crosshair' }}
                          onClick={e => e.stopPropagation()}
                          onPointerDown={e => startArrowEndDrag(e, ann.id, 2)}
                        />
                      </>
                    )}
                  </g>
                )
              })}
            </svg>

            {/* Delete buttons for selected arrow/line (midpoint overlay) */}
            {[...arrowAnnotations, ...lineAnnotations].filter(a => a.id === selectedId).map(ann => (
              <div
                key={`del-arrow-${ann.id}`}
                style={{
                  position: 'absolute',
                  left: `${(ann.x1Pct + ann.x2Pct) / 2}%`,
                  top: `${(ann.y1Pct + ann.y2Pct) / 2}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 25, pointerEvents: 'none',
                }}
              >
                <button
                  onClick={e => { e.stopPropagation(); removeAnnotation(ann.id) }}
                  style={{
                    width: 16, height: 16, background: '#ef4444', color: 'white',
                    border: 'none', borderRadius: '50%', fontSize: 11,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'all',
                  }}
                >×</button>
              </div>
            ))}

            {/* Ellipse annotations */}
            {ellipseAnnotations.map(ann => {
              const isSel = selectedId === ann.id
              return (
                <div
                  key={ann.id}
                  style={{
                    position: 'absolute',
                    left: `${ann.xPct}%`, top: `${ann.yPct}%`,
                    width: `${ann.widthPct}%`, height: `${ann.heightPct}%`,
                    border: `1.5px solid ${isSel ? '#3b82f6' : axisColor}`,
                    borderRadius: '50%',
                    background: ann.fillColor ? toRgba(ann.fillColor, ann.fillOpacity ?? 0.3) : 'transparent',
                    boxSizing: 'border-box',
                    cursor: 'move',
                    touchAction: 'none',
                    zIndex: 5,
                  }}
                  onClick={e => { e.stopPropagation(); setSelectedId(ann.id) }}
                  onPointerDown={e => startRectBodyDrag(e, ann)}
                >
                  {isSel && (
                    <>
                      {(['nw', 'ne', 'sw', 'se'] as const).map(corner => (
                        <div
                          key={corner}
                          style={{
                            ...cornerHandleStyle(corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize'),
                            left: corner.includes('e') ? '100%' : '0%',
                            top: corner.includes('s') ? '100%' : '0%',
                          }}
                          onClick={e => e.stopPropagation()}
                          onPointerDown={e => startRectCornerDrag(e, ann, corner)}
                        />
                      ))}
                      <DeleteBtn onDelete={() => removeAnnotation(ann.id)} />
                    </>
                  )}
                </div>
              )
            })}

            {/* Rectangle annotations */}
            {rectAnnotations.map(ann => {
              const isSel = selectedId === ann.id
              return (
                <div
                  key={ann.id}
                  style={{
                    position: 'absolute',
                    left: `${ann.xPct}%`, top: `${ann.yPct}%`,
                    width: `${ann.widthPct}%`, height: `${ann.heightPct}%`,
                    border: `1.5px solid ${isSel ? '#3b82f6' : axisColor}`,
                    background: ann.fillColor ? toRgba(ann.fillColor, ann.fillOpacity ?? 0.3) : 'transparent',
                    boxSizing: 'border-box',
                    cursor: 'move',
                    touchAction: 'none',
                    zIndex: 5,
                  }}
                  onClick={e => { e.stopPropagation(); setSelectedId(ann.id) }}
                  onPointerDown={e => startRectBodyDrag(e, ann)}
                >
                  {isSel && (
                    <>
                      {/* Corner resize handles */}
                      {(['nw', 'ne', 'sw', 'se'] as const).map(corner => (
                        <div
                          key={corner}
                          style={{
                            ...cornerHandleStyle(corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize'),
                            left: corner.includes('e') ? '100%' : '0%',
                            top: corner.includes('s') ? '100%' : '0%',
                          }}
                          onClick={e => e.stopPropagation()}
                          onPointerDown={e => startRectCornerDrag(e, ann, corner)}
                        />
                      ))}
                      <DeleteBtn onDelete={() => removeAnnotation(ann.id)} />
                    </>
                  )}
                </div>
              )
            })}

            {/* Text annotations */}
            {textAnnotations.map(ann => {
              const isSel = selectedId === ann.id
              const isEdit = editingId === ann.id
              return (
                <div
                  key={ann.id}
                  className="absolute group select-none"
                  style={{
                    left: `${ann.xPct}%`, top: `${ann.yPct}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: isEdit ? 'text' : 'grab',
                    touchAction: 'none',
                    zIndex: 6,
                  }}
                  onClick={e => { e.stopPropagation(); setSelectedId(ann.id) }}
                  onPointerDown={e => startTextDrag(e, ann)}
                  onDoubleClick={e => { e.stopPropagation(); setEditingId(ann.id) }}
                >
                  <div
                    contentEditable={isEdit}
                    suppressContentEditableWarning
                    onBlur={e => {
                      const text = e.currentTarget.textContent?.trim() || 'Texte'
                      updateAnnotation(ann.id, { text })
                      setEditingId(null)
                    }}
                    className="px-1 whitespace-nowrap outline-none"
                    style={{
                      fontFamily,
                      fontSize: annotationFontSize,
                      color: axisColor,
                      fontWeight: boldLabels ? 'bold' : 'normal',
                      borderRadius: 3,
                      outline: isSel ? '1.5px solid #3b82f6' : isEdit ? '1px solid #93c5fd' : 'none',
                      outlineOffset: 3,
                    }}
                  >
                    {ann.text}
                  </div>
                  {isSel && !isEdit && <DeleteBtn onDelete={() => removeAnnotation(ann.id)} />}
                </div>
              )
            })}

            {/* Point tooltip (line chart hover) */}
            {pointTooltip && (
              <div
                style={{
                  position: 'absolute',
                  left: 24 + pointTooltip.svgX,
                  top: Math.max(4, 24 + pointTooltip.svgY - 48),
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                  zIndex: 10,
                  fontFamily,
                }}
                className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-1.5 text-xs whitespace-nowrap"
              >
                <span className="text-slate-500">x = </span>
                <span className="font-mono text-slate-800">
                  {typeof pointTooltip.x === 'number'
                    ? (Number.isInteger(pointTooltip.x) ? String(pointTooltip.x) : (pointTooltip.x as number).toPrecision(4))
                    : String(pointTooltip.x)}
                </span>
                <span className="mx-2 text-slate-300">·</span>
                <span className="text-slate-500">{pointTooltip.name} = </span>
                <span className="font-mono" style={{ color: pointTooltip.color }}>
                  {Number.isInteger(pointTooltip.y) ? String(pointTooltip.y) : pointTooltip.y.toPrecision(4)}
                </span>
              </div>
            )}
          </div>
        </div>

          </div>{/* /centering wrapper */}
        </div>{/* /dark workspace */}

        {/* Context bar: fill controls when shape selected, otherwise hints */}
        {(() => {
          const selShape = selectedId
            ? (rectAnnotations.find(a => a.id === selectedId) ?? ellipseAnnotations.find(a => a.id === selectedId) ?? null)
            : null
          return (
            <div className="flex items-center justify-between gap-4 px-4 py-1.5 bg-white border-t border-slate-100 shrink-0 min-h-[36px]">
              {selShape ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-medium text-slate-500">Fill</span>
                  <div className="flex items-center gap-1">
                    {/* No fill */}
                    <button
                      title="No fill"
                      onClick={() => updateAnnotation(selShape.id, { fillColor: undefined })}
                      className={`w-5 h-5 rounded border-2 transition-all ${!selShape.fillColor ? 'border-[#1D6F42] ring-1 ring-[#8fcdb0]' : 'border-slate-200'}`}
                      style={{
                        background: 'repeating-conic-gradient(#e2e8f0 0% 25%, white 0% 50%) 0 0 / 6px 6px',
                      }}
                    />
                    {FILL_COLORS.map(c => (
                      <button
                        key={c}
                        title={c}
                        onClick={() => updateAnnotation(selShape.id, { fillColor: c, fillOpacity: selShape.fillOpacity ?? 0.3 })}
                        className={`w-5 h-5 rounded transition-all ${selShape.fillColor === c ? 'ring-2 ring-[#1D6F42] ring-offset-1' : 'ring-1 ring-slate-200'}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  {selShape.fillColor && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Opacity</span>
                      <input
                        type="range" min={0} max={100}
                        value={Math.round((selShape.fillOpacity ?? 0.3) * 100)}
                        onChange={e => updateAnnotation(selShape.id, { fillOpacity: Number(e.target.value) / 100 })}
                        className="w-24 accent-[#1D6F42] h-1.5 cursor-pointer"
                      />
                      <span className="text-xs text-slate-600 tabular-nums w-8">
                        {Math.round((selShape.fillOpacity ?? 0.3) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  {selectedId ? (
                    <span>
                      Selected ·{' '}
                      <kbd className="font-mono bg-slate-100 px-1 rounded text-slate-500">Delete</kbd>
                      {' '}to remove · click elsewhere to deselect
                    </span>
                  ) : zoomEnabled ? (
                    <span>Drag on the chart to zoom · double-click to reset</span>
                  ) : null}
                </p>
              )}
              {zoomDomain && (
                <button onClick={resetZoom} className="text-xs text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                  Reset zoom
                </button>
              )}
            </div>
          )
        })()}

      </div>{/* /flex-col editor */}
    </>
  )
}
