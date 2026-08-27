'use client'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type Key } from 'react'
import { flushSync } from 'react-dom'
import { trackExport, trackFirstFreeExport, trackExportCompleted, trackExportPaywallShown } from '@/lib/analytics'
import { isProUser, hasUsedFreeExport, recordFreeExport } from '@/lib/usageLimit'
import PaywallModal from '@/components/PaywallModal'
import {
  LineChart, Line,
  ScatterChart, Scatter,
  BarChart, Bar,
  ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea, ErrorBar,
  ResponsiveContainer, Customized,
} from 'recharts'
import { chartStyles } from '@/lib/chartStyles'
import type { StyleName, StyleOverrides } from '@/lib/chartStyles'
import { getPaletteById, resolveSeriesColors } from '@/lib/colorPalettes'
import type { ChartAnnotation, TextAnnotation, ArrowAnnotation, LineAnnotation, RectAnnotation, EllipseAnnotation, PeakLabelAnnotation } from '@/lib/annotations'
import AnnotationToolbar from '@/components/AnnotationToolbar'
import AnnotationContextBar from '@/components/AnnotationContextBar'
import { useAnnotationInteraction, type AnnotationTool } from '@/hooks/useAnnotationInteraction'
import { formatAxisLabel } from '@/lib/formatLabel'
import { getNiceTicks, buildStepTicks } from '@/lib/niceTicks'
import { fit4PL, sample4PLCurve, buildLogTicks, logFmt, type Fit4PLResult } from '@/lib/curveFit4PL'

function lnFmt(v: number): string {
  const val = Math.exp(v)
  if (val >= 1000) return String(Math.round(val))
  if (val >= 10) return val.toFixed(1)
  if (val >= 0.01) return val.toFixed(2)
  return val.toExponential(1)
}

function fmtInsetTick(v: number): string {
  if (!isFinite(v)) return ''
  if (Number.isInteger(v)) return String(v)
  return String(Math.round(v * 100) / 100)
}
function buildLnTicks(lo: number, hi: number): number[] {
  const ticks: number[] = []
  for (let i = Math.floor(lo); i <= Math.ceil(hi); i++) ticks.push(i)
  return ticks.length >= 2 ? ticks : [Math.floor(lo), Math.ceil(hi)]
}
import { renderMarker, type MarkerShape } from '@/lib/markerShapes'

const PEAK_SNAP_WINDOW_PTS = 5

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
  onSelect?: () => void
}

function DraggableAxisLabel({ viewBox, value, angle = 0, dx = 0, dy = 0, style, onDrag, onSelect }: DraggableLabelProps) {
  const lastClient = useRef({ x: 0, y: 0 })

  if (!value || !viewBox) return null
  const cx = viewBox.x + viewBox.width / 2 + dx
  const cy = viewBox.y + viewBox.height / 2 + dy

  const handleMouseDown = (e: React.MouseEvent<SVGTextElement>) => {
    e.preventDefault()
    e.stopPropagation()
    lastClient.current = { x: e.clientX, y: e.clientY }
    let moved = false
    const onMove = (ev: MouseEvent) => {
      const ddx = ev.clientX - lastClient.current.x
      const ddy = ev.clientY - lastClient.current.y
      if (Math.abs(ddx) > 2 || Math.abs(ddy) > 2) moved = true
      lastClient.current = { x: ev.clientX, y: ev.clientY }
      onDrag(ddx, ddy)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      if (!moved) onSelect?.()
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
      style={{ ...style, cursor: 'pointer', userSelect: 'none' }}
      onMouseDown={handleMouseDown}
    >
      {String(value)}
    </text>
  )
}

// ─── Draggable legend ────────────────────────────────────────────────────────

// Snap anchors match the preset positions; any drag released within SNAP_R% snaps to the nearest.
const LEGEND_SNAP_ANCHORS = [
  { x: 10, y: 3 }, { x: 50, y: 3 }, { x: 88, y: 3 },
  { x: 10, y: 88 }, { x: 50, y: 88 }, { x: 88, y: 88 },
  { x: 7, y: 45 }, { x: 93, y: 45 }, { x: 50, y: 1 },
]
const SNAP_R = 7

function snapLegend(x: number, y: number) {
  for (const a of LEGEND_SNAP_ANCHORS) {
    if (Math.abs(x - a.x) < SNAP_R && Math.abs(y - a.y) < SNAP_R) return a
  }
  return { x, y }
}

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
  onElementSelect?: (el: import('@/lib/chartSelection').SelectedChartElement) => void
}

function DraggableLegend({
  yCols, seriesNames, colors, strokeWidths, chartType,
  xPct, yPct, orientation, bg, fontFamily, fontSize, textColor,
  containerRef, onUpdate, onElementSelect,
}: DraggableLegendProps) {
  const selfRef = useRef<HTMLDivElement>(null)
  const cur = useRef({ x: xPct, y: yPct })
  const lastClient = useRef({ x: 0, y: 0 })
  const hasDragged = useRef(false)

  // Sync position from prop (e.g. when user picks a preset)
  useEffect(() => {
    cur.current = { x: xPct, y: yPct }
    if (selfRef.current) {
      selfRef.current.style.left = `${xPct}%`
      selfRef.current.style.top = `${yPct}%`
    }
  }, [xPct, yPct])

  const isBar = chartType === 'bar'
  const isScatter = chartType === 'scatter' || chartType === 'doseResponse'

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation()
    hasDragged.current = false
    lastClient.current = { x: e.clientX, y: e.clientY }
    if (selfRef.current) selfRef.current.style.cursor = 'grabbing'

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - lastClient.current.x
      const dy = ev.clientY - lastClient.current.y
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true
      const r = containerRef.current?.getBoundingClientRect()
      if (!r) return
      cur.current.x = Math.max(0, Math.min(100, cur.current.x + dx / r.width * 100))
      cur.current.y = Math.max(0, Math.min(100, cur.current.y + dy / r.height * 100))
      lastClient.current = { x: ev.clientX, y: ev.clientY }
      // Direct DOM update — avoids React re-renders during drag for smooth movement
      if (selfRef.current) {
        selfRef.current.style.left = `${cur.current.x}%`
        selfRef.current.style.top = `${cur.current.y}%`
      }
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      if (selfRef.current) selfRef.current.style.cursor = 'grab'
      const snapped = snapLegend(cur.current.x, cur.current.y)
      cur.current = snapped
      if (selfRef.current) {
        selfRef.current.style.left = `${snapped.x}%`
        selfRef.current.style.top = `${snapped.y}%`
      }
      onUpdate({ legendXPct: snapped.x, legendYPct: snapped.y })
      if (!hasDragged.current) onElementSelect?.({ type: 'legend' })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      ref={selfRef}
      className="legend-overlay"
      style={{
        position: 'absolute', left: `${xPct}%`, top: `${yPct}%`,
        transform: 'translate(-50%, 0)', zIndex: 12, userSelect: 'none',
        display: 'flex', flexDirection: orientation === 'h' ? 'row' : 'column',
        alignItems: orientation === 'h' ? 'center' : 'flex-start',
        gap: orientation === 'h' ? 14 : 5,
        background: bg ? 'rgba(255,255,255,0.92)' : 'transparent',
        border: bg ? '1px solid #e2e8f0' : 'none',
        borderRadius: 6, padding: '7px 13px', cursor: 'grab',
        boxShadow: bg ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
      }}
      onMouseDown={startDrag}
      onClick={(e) => e.stopPropagation()}
    >
      {yCols.map((col, i) => (
        <div
          key={col}
          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', borderRadius: 4, padding: '1px 3px' }}
        >
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

// ─── Draggable inline series label ───────────────────────────────────────────

interface DraggableInlineLabelProps {
  label: string
  color: string
  fontFamily: string
  fontSize: number
  xPct: number
  yPct: number
  containerRef: React.RefObject<HTMLDivElement>
  onUpdate: (patch: { xPct: number; yPct: number; text?: string }) => void
  onDelete: () => void
}

function DraggableInlineLabel({ label, color, fontFamily, fontSize, xPct, yPct, containerRef, onUpdate, onDelete }: DraggableInlineLabelProps) {
  const selfRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const cur = useRef({ x: xPct, y: yPct })
  const [selected, setSelected] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(label)

  // Keep edit buffer in sync when label changes externally (e.g. column rename)
  useEffect(() => { if (!editing) setEditValue(label) }, [label, editing])

  // Sync position from props (e.g. template reapply)
  useEffect(() => {
    cur.current = { x: xPct, y: yPct }
    if (selfRef.current) {
      selfRef.current.style.left = `${xPct}%`
      selfRef.current.style.top = `${yPct}%`
    }
  }, [xPct, yPct])

  // Click outside → deselect / commit edit
  useEffect(() => {
    if (!selected && !editing) return
    const handler = (e: MouseEvent) => {
      if (selfRef.current?.contains(e.target as Node)) return
      if (editing) {
        setEditing(false)
        onUpdate({ xPct: cur.current.x, yPct: cur.current.y, text: editValue.trim() || undefined })
      }
      setSelected(false)
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [selected, editing, editValue, onUpdate])

  // Delete/Backspace when selected but not editing
  useEffect(() => {
    if (!selected || editing) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); onDelete() }
      if (e.key === 'Escape') setSelected(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selected, editing, onDelete])

  const commitEdit = () => {
    setEditing(false)
    onUpdate({ xPct: cur.current.x, yPct: cur.current.y, text: editValue.trim() || undefined })
  }

  // Pointer-based drag with click vs drag discrimination
  const startInteraction = (e: React.PointerEvent<HTMLDivElement>) => {
    if (editing) return
    e.preventDefault(); e.stopPropagation()
    const origin = { x: e.clientX, y: e.clientY }
    const last = { x: e.clientX, y: e.clientY }
    let dragging = false

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - origin.x, dy = ev.clientY - origin.y
      if (!dragging && Math.sqrt(dx * dx + dy * dy) > 4) dragging = true
      if (!dragging) return
      const r = containerRef.current?.getBoundingClientRect()
      if (!r) return
      cur.current.x = Math.max(0, Math.min(100, cur.current.x + (ev.clientX - last.x) / r.width * 100))
      cur.current.y = Math.max(0, Math.min(100, cur.current.y + (ev.clientY - last.y) / r.height * 100))
      last.x = ev.clientX; last.y = ev.clientY
      if (selfRef.current) {
        selfRef.current.style.cursor = 'grabbing'
        selfRef.current.style.left = `${cur.current.x}%`
        selfRef.current.style.top = `${cur.current.y}%`
      }
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      if (selfRef.current) selfRef.current.style.cursor = editing ? 'text' : 'grab'
      if (dragging) {
        onUpdate({ xPct: cur.current.x, yPct: cur.current.y })
      } else {
        setSelected(s => !s)
      }
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div
      ref={selfRef}
      style={{
        position: 'absolute',
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: 'translateY(-50%)',
        zIndex: 12,
        userSelect: 'none',
        cursor: editing ? 'text' : 'grab',
        outline: selected && !editing ? `1.5px solid ${color}` : 'none',
        borderRadius: 3,
        padding: '1px 3px',
        pointerEvents: 'all',
        boxSizing: 'border-box',
      }}
      onPointerDown={startInteraction}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setSelected(false)
        setEditing(true)
        setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 0)
      }}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') commitEdit()
            if (e.key === 'Escape') { setEditing(false); setEditValue(label) }
            e.stopPropagation()
          }}
          onPointerDown={e => e.stopPropagation()}
          style={{
            fontFamily,
            fontSize,
            color,
            background: 'rgba(255,255,255,0.95)',
            border: `1.5px solid ${color}`,
            borderRadius: 2,
            padding: '0 3px',
            outline: 'none',
            minWidth: 40,
            width: `${Math.max(40, editValue.length * fontSize * 0.62 + 12)}px`,
            lineHeight: 1.4,
            boxSizing: 'border-box',
          }}
        />
      ) : (
        <span style={{ fontFamily, fontSize, color, whiteSpace: 'nowrap', lineHeight: 1 }}>
          {label}
        </span>
      )}
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

function addWatermark(dataUrl: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const fontSize = Math.max(11, Math.round(img.width * 0.022))
      ctx.font = `${fontSize}px Arial, sans-serif`
      ctx.fillStyle = 'rgba(120, 120, 120, 0.55)'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      const pad = Math.round(fontSize * 0.8)
      ctx.fillText('Generated with FigureReady', img.width - pad, img.height - pad)
      resolve(canvas.toDataURL('image/png'))
    }
    img.src = dataUrl
  })
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

// ─── Types ───────────────────────────────────────────────────────────────────

type ChartType = 'line' | 'lineOnly' | 'scatter' | 'bar' | 'doseResponse'

interface ChartMouseEvent {
  activeLabel?: string | number
}

export interface ChartPreviewHandle {
  triggerExport: (type: 'png' | 'svg' | 'pdf') => void
  addAnnotation: (type: string, options?: Record<string, unknown>) => void
  insertSymbol: (sym: string) => void
  setActiveTool: (tool: AnnotationTool) => void
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
  compact?: boolean
  panelWidth?: number
  panelHeight?: number
  drawInsetActive?: boolean
  onDrawInsetActiveChange?: (active: boolean) => void
  annotOpen?: boolean
  onSelectionChange?: (id: string | null) => void
  onElementSelect?: (el: import('@/lib/chartSelection').SelectedChartElement | null) => void
  selectedElement?: import('@/lib/chartSelection').SelectedChartElement | null
  dataSource?: 'user_upload' | 'sample'
  figureWorkflow?: string
}

// ─── Main component ───────────────────────────────────────────────────────────

const ChartPreview = forwardRef<ChartPreviewHandle, Props>(function ChartPreview({
  data, xCol, yCols, seriesNames, errorCols,
  xAxisLabel, yAxisLabel, chartType, styleName, styleOverrides,
  annotations, onAnnotationsChange, onStyleChange, onSaveTemplate,
  compact = false, panelWidth, panelHeight, drawInsetActive, onDrawInsetActiveChange, annotOpen,
  onSelectionChange, onElementSelect, selectedElement,
  dataSource = 'sample',
  figureWorkflow = 'user_upload',
}: Props, ref) {
  const selectedSeriesKey = selectedElement?.type === 'series' ? (selectedElement.seriesKey ?? null) : null
  const chartRef = useRef<HTMLDivElement>(null)
  const seriesClickedRef = useRef(false)
  const xLabelDxRef = useRef(styleOverrides.xLabelDx ?? 0)
  const xLabelDyRef = useRef(styleOverrides.xLabelDy ?? 0)
  const yLabelDxRef = useRef(styleOverrides.yLabelDx ?? 0)
  const yLabelDyRef = useRef(styleOverrides.yLabelDy ?? 0)
  useEffect(() => { xLabelDxRef.current = styleOverrides.xLabelDx ?? 0 }, [styleOverrides.xLabelDx])
  useEffect(() => { xLabelDyRef.current = styleOverrides.xLabelDy ?? 0 }, [styleOverrides.xLabelDy])
  useEffect(() => { yLabelDxRef.current = styleOverrides.yLabelDx ?? 0 }, [styleOverrides.yLabelDx])
  useEffect(() => { yLabelDyRef.current = styleOverrides.yLabelDy ?? 0 }, [styleOverrides.yLabelDy])

  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallMode, setPaywallMode] = useState<'after_free' | 'blocked'>('blocked')
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
  const [isTouch] = useState(() => typeof window !== 'undefined' && navigator.maxTouchPoints > 0)

  // ─── Inset draw state ────────────────────────────────────────────────────────
  const [drawInsetMode, _setDrawInsetMode] = useState(false)
  const setDrawInsetMode = (v: boolean) => { _setDrawInsetMode(v); onDrawInsetActiveChange?.(v) }
  const [drawPt1, setDrawPt1] = useState<{ x: number; y: number } | null>(null)
  const [drawPt2, setDrawPt2] = useState<{ x: number; y: number } | null>(null)
  const [insetSelected, setInsetSelected] = useState(false)
  const [annotExpanded, setAnnotExpanded] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  // exportCaptureWidth: when non-null, overrides the card width/maxWidth via React during PNG capture
  // so that React reconciliation cannot reset our manually-set inline styles mid-export.
  const [exportCaptureWidth, setExportCaptureWidth] = useState<number | null>(null)

  // Sync external drawInsetActive prop → local state
  useEffect(() => {
    if (drawInsetActive !== undefined) _setDrawInsetMode(drawInsetActive)
  }, [drawInsetActive])

  // Sync external annotOpen prop → local state
  useEffect(() => {
    if (annotOpen !== undefined) setAnnotExpanded(annotOpen)
  }, [annotOpen])

  const plotAreaRef = useRef({ left: 0, top: 0, width: 1, height: 1 })

  // In compact mode, plotAreaRef is populated by Recharts DURING the first render,
  // but the inline-label IIFE reads it BEFORE Recharts has a chance to update it.
  // One extra render (triggered by useEffect) ensures the IIFE sees the real values.
  const [compactMeasured, setCompactMeasured] = useState(!compact)
  useEffect(() => { if (compact && !compactMeasured) setCompactMeasured(true) }, [compact]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cache computed default inline-label positions for compact mode.
  // Without this, defaultXPct is re-derived from plotAreaRef on every re-render;
  // any Zustand update (e.g. panel 2 autosave) can cause a render where plotAreaRef
  // reports stale/zero dimensions, pushing labels to −15 % (off-screen).
  const compactLabelDefaultsRef = useRef<Record<string, { xPct: number; yPct: number }>>({})
  const yColsKey = yCols.join('\0')
  useEffect(() => { compactLabelDefaultsRef.current = {} }, [yColsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Track card width to detect mobile (card narrower than design width)
  const [cardWidth, setCardWidth] = useState(0)
  useEffect(() => {
    const el = chartRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const w = Math.round(entries[0]?.contentRect.width ?? 0)
      if (w > 0) setCardWidth(prev => (prev === w ? prev : w))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Track dynamic viewport height to approximate clamp(220px, 30dvh, 300px) on mobile.
  // Uses visualViewport when available — it tracks Safari's dynamic chrome correctly.
  // Debounced: visualViewport.resize fires on every scroll pixel on iOS, causing a
  // rapid re-render cascade (viewportH → height change → ResizeObserver → cardWidth → …)
  // that exhausts mobile memory. 150 ms debounce + equality guard breaks the loop.
  const [viewportH, setViewportH] = useState(0)
  const [viewportW, setViewportW] = useState(0)
  useEffect(() => {
    const getH = () => Math.round(window.visualViewport?.height ?? window.innerHeight)
    const getW = () => Math.round(window.innerWidth)
    setViewportH(getH())
    setViewportW(getW())
    let timer: ReturnType<typeof setTimeout>
    const update = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        setViewportH(prev => { const h = getH(); return prev === h ? prev : h })
        setViewportW(getW())
      }, 150)
    }
    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', update)
      return () => { vv.removeEventListener('resize', update); clearTimeout(timer) }
    }
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('resize', update); clearTimeout(timer) }
  }, [])

  const [pointTooltip, setPointTooltip] = useState<{
    x: unknown; y: number; name: string; color: string; svgX: number; svgY: number
  } | null>(null)

  // Stable refs for inset-delete keyboard handler
  const onStyleChangeRef = useRef(onStyleChange)
  const styleOverridesRef = useRef(styleOverrides)
  useEffect(() => { onStyleChangeRef.current = onStyleChange }, [onStyleChange])
  useEffect(() => { styleOverridesRef.current = styleOverrides }, [styleOverrides])

  // Interaction hook — owns all annotation drag/tool/keyboard state
  const interaction = useAnnotationInteraction({
    annotations, onAnnotationsChange, chartRef, plotAreaRef, isTouch,
  })

  // Notify parent when selected annotation changes
  useEffect(() => { onSelectionChange?.(interaction.selectedId) }, [interaction.selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Inset-only keyboard handler (annotation shortcuts live in the hook)
  const interactionSelectedIdRef = useRef<string | null>(null)
  useEffect(() => { interactionSelectedIdRef.current = interaction.selectedId }, [interaction.selectedId])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if ((e.key === 'Delete' || e.key === 'Backspace') && !interactionSelectedIdRef.current) {
        if (styleOverridesRef.current.insetDefined) {
          onStyleChangeRef.current?.({ insetDefined: false, insetXMin: undefined, insetXMax: undefined, insetYMin: undefined, insetYMax: undefined })
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Backward-compat addAnnotation: maps old type strings to tool activation
  const addAnnotation = (type: string, opts: Record<string, unknown> = {}) => {
    if (type === 'text') return interaction.setActiveTool('text')
    if (type === 'peak-label') return interaction.setActiveTool('peak')
    if (type === 'rect') return interaction.setActiveTool('rect')
    if (type === 'ellipse') return interaction.setActiveTool('ellipse')
    if (type === 'line') {
      if (opts.dash) return interaction.setActiveTool('dashed')
      if (opts.headEnd || opts.headStart) return interaction.setActiveTool('arrow')
      return interaction.setActiveTool('line')
    }
    return interaction.setActiveTool('line')
  }

  useImperativeHandle(ref, () => ({
    triggerExport,
    addAnnotation,
    insertSymbol: interaction.insertSymbol,
    setActiveTool: interaction.setActiveTool,
  }))

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
  const _paletteColors = styleOverrides.paletteId
    ? resolveSeriesColors(getPaletteById(styleOverrides.paletteId)!, yCols.length)
    : null
  const seriesColor = (col: string, i: number) => {
    if (styleOverrides.seriesColors?.[col]) return styleOverrides.seriesColors[col]
    if (_paletteColors) return _paletteColors[i] ?? s.colors[i % s.colors.length]
    return s.colors[i % s.colors.length]
  }
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
    if (!zoomEnabled || interaction.activeTool !== 'zoom' || e.activeLabel === undefined) return
    setRefLeft(Number(e.activeLabel)); setRefRight(null)
  }
  const handleMouseMove = (e: ChartMouseEvent) => {
    if (!zoomEnabled || interaction.activeTool !== 'zoom' || refLeft === null || e.activeLabel === undefined) return
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

  const isDoseResponse = chartType === 'doseResponse'

  const xScale = styleOverrides.xScale ?? (isDoseResponse ? 'log' : 'linear')
  const yScale = styleOverrides.yScale ?? 'linear'
  const isLogX = xScale === 'log'
  const isLogY = yScale === 'log'
  const isLnX = xScale === 'ln'
  const isLnY = yScale === 'ln'
  const isXReversed = styleOverrides.xReversed ?? false
  const rechartsXScale = (isLnX ? 'linear' : xScale) as 'linear' | 'log'
  const rechartsYScale = (isLnY ? 'linear' : yScale) as 'linear' | 'log'
  const yAxisAssignment = styleOverrides.yAxisAssignment ?? {}
  const hasRightAxis = yCols.some(col => yAxisAssignment[col] === 'right')
  const y2AxisLabel = styleOverrides.y2AxisLabel ?? ''

  // ─── Auto stacking: resolve effective Y offsets ──────────────────────────────

  const stackingMode = styleOverrides.stackingMode ?? 'manual'
  const effectiveSeriesYOffsets: Record<string, number> = (() => {
    if (stackingMode !== 'auto' || yCols.length === 0) {
      return styleOverrides.seriesYOffsets ?? {}
    }
    const amplitudes = yCols.map(col => {
      const vals = data.map(row => Number(row[col])).filter(v => isFinite(v))
      if (vals.length === 0) return 0
      return Math.max(...vals) - Math.min(...vals)
    })
    const maxAmp = Math.max(...amplitudes, 1)
    const gap = styleOverrides.stackGap ?? 0.25
    const slotHeight = maxAmp * (1 + gap)
    return Object.fromEntries(yCols.map((col, i) => [col, i * slotHeight]))
  })()

  // ─── Data processing ─────────────────────────────────────────────────────────

  const processedData = data
    .map(row => {
      const rawX = row[xCol]
      const x = (isLnX && isNumericX && typeof rawX === 'number')
        ? (rawX > 0 ? Math.log(rawX) : null)
        : rawX
      const point: Record<string, unknown> = { x }
      yCols.forEach(col => {
        const v = Number(row[col])
        const yOffset = effectiveSeriesYOffsets[col] ?? 0
        point[col] = isNaN(v) ? null : ((isLogY || isLnY) && v <= 0 ? null : (isLnY ? Math.log(v) : v + yOffset))
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
      if (isLnX && point.x === null) return false
      return true
    })

  const scatterSeries = yCols.map((col, i) => ({
    key: col,
    color: seriesColor(col, i),
    data: data
      .map(row => {
        const rawX = row[xCol]
        const numX = typeof rawX === 'number' ? rawX : Number(rawX)
        const x = (isLnX && isNumericX) ? (numX > 0 ? Math.log(numX) : null) : rawX
        const yRaw = Number(row[col])
        const yOffset = effectiveSeriesYOffsets[col] ?? 0
        const y = isLnY ? (yRaw > 0 ? Math.log(yRaw) : null) : yRaw + yOffset
        const point: Record<string, unknown> = { x, y }
        if (hasError(col)) {
          const e = Number(row[errorCols[col]])
          point.error = isNaN(e) ? null : e
        }
        return point
      })
      .filter(d => {
        if (d.y === null || isNaN(d.y as number)) return false
        if (!inZoomRange(d.x)) return false
        if (isLogY && (d.y as number) <= 0) return false
        if (isLogX && isNumericX && typeof d.x === 'number' && d.x <= 0) return false
        if (isLnX && d.x === null) return false
        return true
      }),
  }))

  const xValues = isNumericX
    ? data.map(row => Number(row[xCol])).filter(v => !isNaN(v) && inZoomRange(v) && (!(isLogX || isLnX) || v > 0))
    : []
  const xValuesScaled = isLnX ? xValues.map(Math.log) : xValues
  const manualXMin = Number.isFinite(styleOverrides.xMin) ? styleOverrides.xMin : undefined
  const manualXMax = Number.isFinite(styleOverrides.xMax) ? styleOverrides.xMax : undefined
  const xRangeMin = manualXMin ?? (xValuesScaled.length > 0 ? Math.min(...xValuesScaled) : undefined)
  const xRangeMax = manualXMax ?? (xValuesScaled.length > 0 ? Math.max(...xValuesScaled) : undefined)
  const xStep = Number.isFinite(styleOverrides.xStep) && (styleOverrides.xStep as number) > 0 ? styleOverrides.xStep : undefined
  const xTicksRaw = isLnX && xRangeMin !== undefined && xRangeMax !== undefined
    ? buildLnTicks(xRangeMin, xRangeMax)
    : (!isLogX && xRangeMin !== undefined && xRangeMax !== undefined
      ? (xStep ? buildStepTicks(xRangeMin, xRangeMax, xStep) : getNiceTicks(xRangeMin, xRangeMax))
      : undefined)
  // When user has set explicit bounds, filter ticks to stay strictly within them
  const hasManualX = manualXMin !== undefined || manualXMax !== undefined
  const xTicks = xTicksRaw && hasManualX
    ? xTicksRaw.filter(t =>
        (manualXMin === undefined || t >= manualXMin) &&
        (manualXMax === undefined || t <= manualXMax)
      )
    : xTicksRaw
  // Domain: explicit manual values take strict priority over tick-derived bounds
  const xDomain: [number | 'auto', number | 'auto'] | undefined =
    hasManualX
      ? [
          manualXMin !== undefined ? manualXMin : (xTicks?.length ? xTicks[0] : 'auto'),
          manualXMax !== undefined ? manualXMax : (xTicks?.length ? xTicks[xTicks.length - 1] : 'auto'),
        ]
      : xTicks?.length
        ? [xTicks[0], xTicks[xTicks.length - 1]]
        : undefined

  const yMin = Number.isFinite(styleOverrides.yMin) ? styleOverrides.yMin : undefined
  const yMax = Number.isFinite(styleOverrides.yMax) ? styleOverrides.yMax : undefined
  const yStep = Number.isFinite(styleOverrides.yStep) && (styleOverrides.yStep as number) > 0 ? styleOverrides.yStep : undefined
  // When dual axis: left domain uses only left-axis series
  const leftCols = hasRightAxis ? yCols.filter(col => yAxisAssignment[col] !== 'right') : yCols
  const allYValues = leftCols
    .flatMap(col => {
      const yOffset = effectiveSeriesYOffsets[col] ?? 0
      return data.map(row => Number(row[col]) + yOffset)
    })
    .filter(v => !isNaN(v) && (!(isLogY || isLnY) || v > 0))
  const allYValuesScaled = isLnY ? allYValues.map(Math.log) : allYValues
  const autoYMin = allYValuesScaled.length > 0 ? Math.min(...allYValuesScaled) : ((isLogY || isLnY) ? 0 : 0)
  const autoYMax = allYValuesScaled.length > 0 ? Math.max(...allYValuesScaled) : ((isLogY || isLnY) ? 2 : 1)

  // Stacking padding: expand the auto domain without touching user-set yMin/yMax
  const stackYRange = autoYMax - autoYMin
  const paddedAutoYMin = (stackingMode === 'auto' && yMin === undefined && !isLogY && !isLnY)
    ? autoYMin - stackYRange * (styleOverrides.stackBottomPaddingRatio ?? 0.05)
    : autoYMin
  const paddedAutoYMax = (stackingMode === 'auto' && yMax === undefined && !isLogY && !isLnY)
    ? autoYMax + stackYRange * (styleOverrides.stackTopPaddingRatio ?? 0.15)
    : autoYMax

  const yLnTicks = isLnY ? buildLnTicks(autoYMin, autoYMax) : undefined
  const yTicks = isLnY
    ? yLnTicks
    : (!isLogY && yStep ? buildStepTicks(yMin ?? paddedAutoYMin, yMax ?? paddedAutoYMax, yStep) : undefined)
  const yDomainProps: { domain?: [number | 'auto', number | 'auto']; allowDataOverflow?: boolean; ticks?: number[] } =
    isLnY
      ? { domain: [autoYMin - 0.5, autoYMax + 0.5], ...(yLnTicks ? { ticks: yLnTicks } : {}) }
      : isLogY
        ? { domain: [autoYMin / 2, autoYMax * 2] }
        : (yMin !== undefined || yMax !== undefined || yTicks)
          ? {
              domain: [yTicks ? yTicks[0] : (yMin ?? 'auto'), yTicks ? yTicks[yTicks.length - 1] : (yMax ?? 'auto')],
              allowDataOverflow: true,
              ...(yTicks ? { ticks: yTicks } : {}),
            }
          : stackingMode === 'auto'
            ? { domain: [paddedAutoYMin, paddedAutoYMax] as [number, number], allowDataOverflow: true }
            : {}

  // ─── Dose–response 4PL fitting (only active when chartType === 'doseResponse') ──

  const doseResponseFits = useMemo((): Record<string, Fit4PLResult> => {
    if (!isDoseResponse) return {}
    const rawX = data.map(row => Number(row[xCol]))
    return Object.fromEntries(
      yCols.map(col => [col, fit4PL(rawX, data.map(row => Number(row[col])))])
    )
  }, [isDoseResponse, data, xCol, yCols.join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  const fitCurveData = useMemo((): Record<string, Array<{ x: number; y: number }>> => {
    if (!isDoseResponse) return {}
    const domLo = manualXMin ?? xRangeMin
    const domHi = manualXMax ?? xRangeMax
    if (domLo === undefined || domHi === undefined || domLo <= 0 || domHi <= 0) return {}
    return Object.fromEntries(
      yCols.flatMap(col => {
        const fit = doseResponseFits[col]
        if (!fit?.converged) return []
        return [[col, sample4PLCurve(fit, domLo, domHi)]]
      })
    )
  }, [isDoseResponse, doseResponseFits, manualXMin, manualXMax, xRangeMin, xRangeMax, yCols.join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Style derivation ────────────────────────────────────────────────────────

  const plotBackground = (
    <Customized component={({ offset }: { offset?: { top: number; left: number; width: number; height: number } }) => {
      if (!offset) return null
      const { top, left, width, height } = offset
      plotAreaRef.current = { left, top, width: width || 1, height: height || 1 }
      return <rect x={left} y={top} width={width} height={height} fill="#ffffff" />
    }} />
  )

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
  const legendFontSize = styleOverrides.legendFontSize ?? s.tickFontSize
  const legendPosition = styleOverrides.legendPosition ?? 'top-right'
  const legendMode = styleOverrides.legendMode ?? 'box'
  const legendEnabled = (styleOverrides.showLegend ?? yCols.length > 1) && yCols.length > 1
  const legend = null  // replaced by DraggableLegend overlay
  const legendDefaultPos: Record<string, { x: number; y: number }> = {
    // legacy values — preserved for backward compat
    top: { x: 50, y: 3 }, bottom: { x: 50, y: 89 }, left: { x: 7, y: 45 }, right: { x: 88, y: 45 },
    // new presets
    'top-left': { x: 10, y: 3 }, 'top-center': { x: 50, y: 3 }, 'top-right': { x: 88, y: 3 },
    'bottom-left': { x: 10, y: 88 }, 'bottom-center': { x: 50, y: 88 }, 'bottom-right': { x: 88, y: 88 },
    'outside-right': { x: 93, y: 45 }, 'outside-top': { x: 50, y: 1 },
  }
  const legendPos = styleOverrides.legendXPct !== undefined
    ? { x: styleOverrides.legendXPct, y: styleOverrides.legendYPct ?? 3 }
    : (legendDefaultPos[legendPosition] ?? legendDefaultPos['top-right'])
  const resolvedColors = yCols.map((col, i) =>
    (styleOverrides.seriesColors ?? {})[col]
      ?? (_paletteColors?.[i] ?? null)
      ?? s.colors[i % s.colors.length]
  )
  const resolvedStrokeWidths = yCols.map(col =>
    (styleOverrides.seriesStrokeWidths ?? {})[col] ?? s.strokeWidth
  )
  const figureWidth = styleOverrides.figureWidth
  const figureHeight = styleOverrides.figureHeight ?? s.chartHeight
  // Mobile: use clamp(220px, 30dvh, 300px) approximated via visualViewport.
  // Desktop (card >= design width): use the full configured figureHeight for the export-quality preview.
  // contentRect.width excludes padding (sm:p-8 = 32px × 2 = 64px less than outer width),
  // so we account for it to avoid falsely flagging a full-size desktop card as "mobile".
  const CARD_PADDING = 64
  const isMobileCard = cardWidth > 0 && (cardWidth + CARD_PADDING) < (figureWidth ?? 700)
  // isPhone: true only on handheld devices (narrow viewport width < 768px).
  // Laptops/desktops with a narrow panel are NOT phones — they keep full chart height.
  const isPhone = viewportW > 0 && viewportW < 768
  const mobileChartHeight = viewportH > 0
    ? Math.max(220, Math.min(300, Math.round(viewportH * 0.30)))
    : 260
  // previewOnly: compact mode for actual phones only — never for desktops.
  // isExporting = true always restores full size during DOM capture.
  const previewOnly = isPhone && !isExporting
  const effectiveChartHeight = previewOnly ? mobileChartHeight : figureHeight
  const effectiveXTitleSize = previewOnly ? Math.min(xTitleSize, 13) : xTitleSize
  const effectiveYTitleSize = previewOnly ? Math.min(yTitleSize, 13) : yTitleSize
  const effectiveXTickSize  = previewOnly ? Math.min(xTickSize,  11) : xTickSize
  const effectiveYTickSize  = previewOnly ? Math.min(yTickSize,  11) : yTickSize
  const xTickStyle  = { fontSize: effectiveXTickSize,  fontFamily, fill: axisColor, fontWeight: tickFontWeight }
  const yTickStyle  = { fontSize: effectiveYTickSize,  fontFamily, fill: axisColor, fontWeight: tickFontWeight }
  const showYTickLabels = styleOverrides.showYTickLabels !== false
  const yAxisTickProp = showYTickLabels ? yTickStyle : (false as const)
  // Compact: fixed 56 px so every panel reserves the same space for Y-axis ticks/title,
  // making all panel plot areas identical regardless of per-figure showYTickLabels.
  const yAxisWidth = compact ? 56 : (showYTickLabels ? 80 : 24)
  const axisLine    = { stroke: axisColor, strokeWidth: axisWidth }
  const margin      = s.margin
  // Compact: left=50 ensures the rotated Y-axis title (dx≈−12, fontSize≈14) clears the
  // SVG left edge (centre at 50/2−12=13 px > fontSize/2≈7 px → 6 px clearance).
  // isExporting restores the original margin so exports use full desktop margins.
  const effectiveMargin = isExporting
    ? margin
    : compact
      ? { ...margin, left: Math.max(margin.left, 50), right: Math.max(margin.right, 16) }
      : previewOnly
        ? { ...margin, bottom: Math.max(margin.bottom, 30) }
        : margin

  // Inline series labels: measure each label's pixel width for default right-edge placement.
  const inlineLabelWidths = useMemo(() => {
    const widths: Record<string, number> = {}
    if (legendMode !== 'inline' || !legendEnabled || typeof document === 'undefined') return widths
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return widths
    ctx.font = `${legendFontSize}px ${fontFamily}`
    for (const col of yCols) {
      const label = seriesNames[col] || col
      widths[col] = Math.ceil(ctx.measureText(label).width)
    }
    return widths
  }, [legendMode, legendEnabled, yCols, seriesNames, legendFontSize, fontFamily])

  // Persist computed default inline-label positions to the store the first time they render
  // in compact mode. Without this, the IIFE re-derives defaultXPct from plotAreaRef on every
  // re-render; any store update from another panel triggers a re-render where plotAreaRef may
  // Save initial inline-label positions to the store the first time they're needed.
  // Uses the SAME cached values that the IIFE renders with (compactLabelDefaultsRef),
  // so stored?.xPct always equals the IIFE's computedXPct — preventing any jump when
  // the store's copy is temporarily absent (e.g. after an autosave overwrites it).
  useEffect(() => {
    if (!compact || !compactMeasured || !onStyleChange) return
    if (!legendEnabled || legendMode !== 'inline') return
    const positions = styleOverrides.seriesLabelPositions ?? {}
    const missing = yCols.filter(col => positions[col] === undefined)
    if (missing.length === 0) return
    // Use the cache built by the IIFE; if cache is empty the IIFE hasn't run yet → wait.
    const newPositions: Record<string, { xPct: number; yPct: number }> = { ...positions }
    for (const col of missing) {
      const cached = compactLabelDefaultsRef.current[col]
      if (!cached) return // cache not ready yet — effect will re-fire on next re-render
      newPositions[col] = cached
    }
    onStyleChange({ seriesLabelPositions: newPositions })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact, compactMeasured, legendEnabled, legendMode, yColsKey, panelWidth, panelHeight, onStyleChange])

  const xLabelStyle = { fontFamily, fontSize: effectiveXTitleSize, fontWeight: titleFontWeight, fill: axisColor }
  const yLabelStyle = { fontFamily, fontSize: effectiveYTitleSize, fontWeight: titleFontWeight, fill: axisColor }
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
        onSelect={() => onElementSelect?.({ type: 'xAxisLabel' })}
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
        onSelect={() => onElementSelect?.({ type: 'yAxisLabel' })}
      />
    ),
  } : undefined
  const grid = showGrid ? <CartesianGrid strokeDasharray="3 3" stroke={s.gridColor} /> : null
  const zoomArea = refLeft !== null && refRight !== null
    ? <ReferenceArea x1={refLeft} x2={refRight} strokeOpacity={0.3} fill={s.colors[0]} fillOpacity={0.12} />
    : null

  const insetZoomRectProps = styleOverrides.insetDefined && styleOverrides.insetShowZoomRect &&
    isNumericX && styleOverrides.insetXMin !== undefined && styleOverrides.insetXMax !== undefined
    ? {
        x1: styleOverrides.insetXMin, x2: styleOverrides.insetXMax,
        y1: styleOverrides.insetYMin, y2: styleOverrides.insetYMax,
        stroke: styleOverrides.insetBorderColor ?? axisColor,
        strokeWidth: styleOverrides.insetBorderWidth ?? 1.5,
        strokeDasharray: '5 3',
        fill: 'transparent', fillOpacity: 0,
      }
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
              if (interaction.isDragging) return
              setPointTooltip({ x: payload.x, y: payload[col] as number, name: seriesLabel(col), color, svgX: cx, svgY: cy })
            }}
            onMouseLeave={() => setPointTooltip(null)}
          />
        </g>
      )
    }

  // Peak pick: keep inline — uses computed axis/data values not available to hook
  const handlePeakPickClick = (clientX: number, clientY: number) => {
    const container = chartRef.current
    if (!container) return
    const { left: pL, top: pT, width: pW, height: pH } = plotAreaRef.current
    const containerRect = container.getBoundingClientRect()
    const clickPxX = clientX - containerRect.left - pL
    const clickPxY = clientY - containerRect.top - pT
    const plotFracX = Math.max(0, Math.min(1, clickPxX / pW))
    const plotFracY = Math.max(0, Math.min(1, clickPxY / pH))
    const xDomainMin = xRangeMin ?? 0
    const xDomainMax = xRangeMax ?? 1
    const yDomainMin = yMin ?? paddedAutoYMin
    const yDomainMax = yMax ?? paddedAutoYMax
    const clickedDataX = isLnX
      ? Math.exp(xDomainMin + plotFracX * (xDomainMax - xDomainMin))
      : isXReversed
        ? xDomainMax - plotFracX * (xDomainMax - xDomainMin)
        : xDomainMin + plotFracX * (xDomainMax - xDomainMin)
    const clickedDisplayY = yDomainMax - plotFracY * (yDomainMax - yDomainMin)
    const normW = (xDomainMax - xDomainMin) || 1
    const normH = (yDomainMax - yDomainMin) || 1
    let bestCol = yCols[0] ?? ''
    let bestDist = Infinity
    let bestOrigIdx = 0
    for (const col of yCols) {
      const seriesOff = effectiveSeriesYOffsets[col] ?? 0
      for (let i = 0; i < data.length; i++) {
        const rawX = Number(data[i][xCol])
        const rawY = Number(data[i][col])
        if (isNaN(rawX) || isNaN(rawY)) continue
        const scaledX = isLnX ? Math.log(Math.max(rawX, 1e-10)) : rawX
        const displayY = rawY + seriesOff
        const dx = (scaledX - (isLnX ? Math.log(Math.max(clickedDataX, 1e-10)) : clickedDataX)) / normW
        const dy = (displayY - clickedDisplayY) / normH
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < bestDist) { bestDist = dist; bestCol = col; bestOrigIdx = i }
      }
    }
    const colData = data
      .map((row, i) => ({ rawX: Number(row[xCol]), rawY: Number(row[bestCol]), origIdx: i }))
      .filter(d => !isNaN(d.rawX) && !isNaN(d.rawY))
      .sort((a, b) => a.rawX - b.rawX)
    const nearestSortedIdx = colData.findIndex(d => d.origIdx === bestOrigIdx)
    const searchIdx = nearestSortedIdx >= 0 ? nearestSortedIdx : 0
    const winStart = Math.max(0, searchIdx - PEAK_SNAP_WINDOW_PTS)
    const winEnd = Math.min(colData.length - 1, searchIdx + PEAK_SNAP_WINDOW_PTS)
    let peakRawX = colData[searchIdx]?.rawX ?? 0
    let peakRawY = colData[searchIdx]?.rawY ?? 0
    let maxRawY = -Infinity
    for (let i = winStart; i <= winEnd; i++) {
      if (colData[i].rawY > maxRawY) { maxRawY = colData[i].rawY; peakRawX = colData[i].rawX; peakRawY = colData[i].rawY }
    }
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ann-${Date.now()}`
    onAnnotationsChange([...annotations, {
      id, type: 'peak-label', text: 'Peak',
      dataX: peakRawX, dataY: peakRawY,
      seriesKey: bestCol,
      offsetXPct: 0, offsetYPct: -12,
      leaderLine: true,
    } as PeakLabelAnnotation])
    interaction.setSelectedId(id)
    interaction.setActiveTool('select')
  }

  // ─── Series click via chart-level proximity (replaces per-Line thin-path click) ─
  const handleChartSeriesClick = (data: {
    chartY?: number
    activePayload?: Array<{ dataKey: string; value: number }> | null
  } | null) => {
    if (interaction.activeTool !== 'select') return
    if (!data?.activePayload?.length) return  // empty area — container onClick handles 'figure'
    // Map click pixel-Y to data-Y, then pick the nearest series
    const svgEl = chartRef.current?.querySelector('svg')
    const svgH = svgEl?.clientHeight ?? 400
    const mTop = effectiveMargin.top ?? 16
    const mBot = effectiveMargin.bottom ?? 10
    const plotH = Math.max(svgH - mTop - mBot, 1)
    const allY = yCols.flatMap(col =>
      processedData.map(r => Number((r as Record<string, unknown>)[col])).filter(v => isFinite(v))
    )
    const yLo = yMin ?? (allY.length ? Math.min(...allY) : 0)
    const yHi = yMax ?? (allY.length ? Math.max(...allY) : 1)
    const ySpan = (yHi - yLo) || 1
    const clickY = yHi - ((data.chartY ?? 0) - mTop) / plotH * ySpan
    let best = data.activePayload[0].dataKey as string
    let bestDist = Infinity
    for (const item of data.activePayload) {
      const d = Math.abs(Number(item.value) - clickY)
      if (d < bestDist) { bestDist = d; best = item.dataKey as string }
    }
    seriesClickedRef.current = true
    onElementSelect?.({ type: 'series', seriesKey: best })
    setTimeout(() => { seriesClickedRef.current = false }, 0)
  }

  // ─── Chart rendering ─────────────────────────────────────────────────────────

  const renderChart = () => {
    if (chartType === 'scatter') {
      return (
        <ScatterChart margin={effectiveMargin} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onDoubleClick={interaction.activeTool !== 'select' ? resetZoom : undefined}>
          {plotBackground}
          {grid}
          <XAxis dataKey="x" type={isNumericX ? 'number' : 'category'} domain={xDomain} ticks={xTicks} scale={isNumericX ? rechartsXScale : undefined} tickFormatter={isLnX && isNumericX ? lnFmt : undefined} tick={xTickStyle} axisLine={axisLine} tickLine={axisLine} label={xLabel} allowDataOverflow height={65} reversed={isXReversed} />
          <YAxis dataKey="y" type="number" scale={rechartsYScale} tickFormatter={isLnY ? lnFmt : undefined} {...yDomainProps} tick={yAxisTickProp} axisLine={axisLine} tickLine={axisLine} label={yLabel} width={yAxisWidth} />
          <Tooltip content={<ScatterTooltipContent />} cursor={false} />
          {legend}
          {scatterSeries.map(series => {
            const markerSize = seriesMarkerSize(series.key)
            const markerShape = seriesMarkerShape(series.key)
            return (
              <Scatter key={series.key} data={series.data} name={seriesLabel(series.key)} fill={series.color}
                opacity={selectedSeriesKey && selectedSeriesKey !== series.key ? 0.2 : 1}
                shape={markerRenderer(markerShape, markerSize, series.color)}
                onClick={() => { seriesClickedRef.current = true; onElementSelect?.({ type: 'series', seriesKey: series.key }); setTimeout(() => { seriesClickedRef.current = false }, 0) }}
              >
                {hasError(series.key) && <ErrorBar dataKey="error" width={4} strokeWidth={1} stroke={axisColor} direction="y" />}
              </Scatter>
            )
          })}
          {zoomArea}
          {insetZoomRectProps && <ReferenceArea {...insetZoomRectProps} />}
          {frameLines}
        </ScatterChart>
      )
    }

    if (chartType === 'bar') {
      return (
        <BarChart data={processedData} margin={effectiveMargin} onClick={handleChartSeriesClick}>
          {plotBackground}
          {grid}
          <XAxis dataKey="x" tick={xTickStyle} axisLine={axisLine} tickLine={axisLine} label={xLabel} height={65} />
          <YAxis yAxisId="left" scale={rechartsYScale} tickFormatter={isLnY ? lnFmt : undefined} {...yDomainProps} tick={yAxisTickProp} axisLine={axisLine} tickLine={axisLine} label={yLabel} width={yAxisWidth} />
          {hasRightAxis && (
            <YAxis yAxisId="right" orientation="right" scale={rechartsYScale} tickFormatter={isLnY ? lnFmt : undefined} tick={yAxisTickProp} axisLine={axisLine} tickLine={axisLine}
              label={y2AxisLabel ? { value: y2AxisLabel, angle: 90, position: 'insideRight', style: yLabelStyle } : undefined}
              width={yAxisWidth} />
          )}
          <Tooltip content={<BarTooltipContent />} cursor={false} />
          {legend}
          {yCols.map((col, i) => {
            const axisId = hasRightAxis ? (yAxisAssignment[col] === 'right' ? 'right' : 'left') : 'left'
            return (
              <Bar key={col} dataKey={col} yAxisId={axisId} name={seriesLabel(col)} fill={seriesColor(col, i)} radius={[s.barRadius, s.barRadius, 0, 0]}
                fillOpacity={selectedSeriesKey && selectedSeriesKey !== col ? 0.2 : 1}
              >
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

    // ─── Dose–response ───────────────────────────────────────────────────────────
    if (chartType === 'doseResponse') {
      const drDomLo = manualXMin ?? xRangeMin
      const drDomHi = manualXMax ?? xRangeMax
      const drDomain: [number | 'auto', number | 'auto'] = [drDomLo ?? 'auto', drDomHi ?? 'auto']
      const drTicks = (drDomLo !== undefined && drDomLo > 0 && drDomHi !== undefined && drDomHi > 0)
        ? buildLogTicks(drDomLo, drDomHi)
        : undefined

      return (
        <ComposedChart
          data={[]}
          margin={effectiveMargin}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={interaction.activeTool !== 'select' ? resetZoom : undefined}
        >
          {plotBackground}
          {grid}
          <XAxis
            dataKey="x"
            type="number"
            scale="log"
            domain={drDomain}
            {...(drTicks ? { ticks: drTicks } : {})}
            tickFormatter={logFmt}
            tick={xTickStyle}
            axisLine={axisLine}
            tickLine={axisLine}
            label={xLabel}
            allowDataOverflow
            height={65}
          />
          <YAxis
            dataKey="y"
            type="number"
            scale={rechartsYScale}
            tickFormatter={isLnY ? lnFmt : undefined}
            {...yDomainProps}
            tick={yAxisTickProp}
            axisLine={axisLine}
            tickLine={axisLine}
            label={yLabel}
            width={yAxisWidth}
          />
          <Tooltip content={<ScatterTooltipContent />} cursor={false} />
          {legend}
          {/* Fit curves rendered first so experimental points appear on top */}
          {yCols.map((col, i) => {
            if (styleOverrides.seriesHideFit?.[col]) return null
            const pts = fitCurveData[col]
            if (!pts?.length) return null
            return (
              <Line
                key={`fit-${col}`}
                data={pts}
                dataKey="y"
                stroke={seriesColor(col, i)}
                strokeWidth={seriesStrokeWidth(col)}
                dot={false}
                activeDot={false}
                legendType="none"
                isAnimationActive={false}
                strokeOpacity={selectedSeriesKey && selectedSeriesKey !== col ? 0.2 : 1}
              />
            )
          })}
          {/* Experimental scatter points rendered on top of fit lines */}
          {scatterSeries.map(series => {
            if (styleOverrides.seriesHidePoints?.[series.key]) return null
            const markerSize = seriesMarkerSize(series.key)
            const markerShape = seriesMarkerShape(series.key)
            return (
              <Scatter
                key={`exp-${series.key}`}
                data={series.data}
                name={seriesLabel(series.key)}
                fill={series.color}
                opacity={selectedSeriesKey && selectedSeriesKey !== series.key ? 0.2 : 1}
                shape={markerRenderer(markerShape, markerSize, series.color)}
                onClick={() => {
                  seriesClickedRef.current = true
                  onElementSelect?.({ type: 'series', seriesKey: series.key })
                  setTimeout(() => { seriesClickedRef.current = false }, 0)
                }}
              >
                {hasError(series.key) && !styleOverrides.seriesHideErrorBars?.[series.key] && (
                  <ErrorBar dataKey="error" width={4} strokeWidth={1} stroke={axisColor} direction="y" />
                )}
              </Scatter>
            )
          })}
          {zoomArea}
          {insetZoomRectProps && <ReferenceArea {...insetZoomRectProps} />}
          {frameLines}
        </ComposedChart>
      )
    }

    return (
      <LineChart data={processedData} margin={hasRightAxis ? { ...effectiveMargin, right: 90 } : effectiveMargin} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onDoubleClick={interaction.activeTool !== 'select' ? resetZoom : undefined} onClick={handleChartSeriesClick}>
        {plotBackground}
        {grid}
        <XAxis dataKey="x" type={isNumericX ? 'number' : 'category'} domain={xDomain} ticks={xTicks} scale={isNumericX ? rechartsXScale : undefined} tickFormatter={isLnX && isNumericX ? lnFmt : undefined} tick={xTickStyle} axisLine={axisLine} tickLine={axisLine} label={xLabel} allowDataOverflow height={65} reversed={isXReversed} />
        <YAxis yAxisId="left" scale={rechartsYScale} tickFormatter={isLnY ? lnFmt : undefined} {...yDomainProps} tick={yAxisTickProp} axisLine={axisLine} tickLine={axisLine} label={yLabel} width={yAxisWidth} />
        {hasRightAxis && (
          <YAxis yAxisId="right" orientation="right" scale={rechartsYScale} tickFormatter={isLnY ? lnFmt : undefined} tick={yAxisTickProp} axisLine={axisLine} tickLine={axisLine} label={y2Label} width={yAxisWidth} />
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
              strokeOpacity={selectedSeriesKey && selectedSeriesKey !== col ? 0.2 : 1}
              dot={showDots ? makeLineDot(col, color, markerShape, markerSize) : false}
              activeDot={false} connectNulls
            >
              {hasError(col) && <ErrorBar dataKey={`error_${col}`} width={4} strokeWidth={1} stroke={axisColor} direction="y" />}
            </Line>
          )
        })}
        {zoomArea}
        {insetZoomRectProps && <ReferenceArea {...insetZoomRectProps} yAxisId="left" />}
        {frameLines}
      </LineChart>
    )
  }

  // ─── Export ──────────────────────────────────────────────────────────────────

  async function captureChartPng(pixelRatio: number): Promise<string> {
    const el = chartRef.current!
    const targetWidth = figureWidth || 700
    const parent = el.parentElement
    const prevParentOverflow = parent ? parent.style.overflow : ''

    // Force the card to targetWidth via React state (flushSync = synchronous re-render).
    // This prevents React reconciliation from resetting maxWidth/'100%' during the async
    // polling loop, which was the root cause of the right-side clipping bug on narrow viewports.
    flushSync(() => setExportCaptureWidth(targetWidth))
    if (parent) parent.style.overflow = 'visible'

    // Compute the inner content width the Recharts SVG should reach after re-render.
    const cs = window.getComputedStyle(el)
    const horizInset = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0)
                     + (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0)
    const expectedSvgWidth = targetWidth - horizInset

    // Poll until Recharts has re-rendered at targetWidth (max 800ms).
    // On desktop where the card is already targetWidth, exits after one 50ms tick.
    // On narrow viewports Recharts ResizeObserver fires after ~200ms debounce.
    const svgEl = el.querySelector('.recharts-surface') ?? el.querySelector('svg')
    let waited = 0
    while (waited < 800) {
      await new Promise(r => setTimeout(r, 50))
      waited += 50
      if (!svgEl) break
      const svgW = svgEl.getBoundingClientRect().width
      if (svgW > 0 && Math.abs(svgW - expectedSvgWidth) < 5) break
    }

    // Measure the actual rendered right edge of the legend via getBoundingClientRect().
    let captureWidth = targetWidth
    const legendEl = el.querySelector('.legend-overlay') as HTMLElement | null
    if (legendEl) {
      const cardRect   = el.getBoundingClientRect()
      const legendRect = legendEl.getBoundingClientRect()
      const legendRight = legendRect.right - cardRect.left
      if (legendRight > targetWidth) {
        captureWidth = Math.ceil(legendRight) + 8
      }
    }

    const { toPng } = await import('html-to-image')
    try {
      return await toPng(el, {
        backgroundColor: 'white',
        pixelRatio,
        width: captureWidth,
        style: { boxShadow: 'none', borderRadius: '0', border: 'none', marginLeft: '0', marginRight: '0' },
      })
    } finally {
      if (parent) parent.style.overflow = prevParentOverflow
      flushSync(() => setExportCaptureWidth(null))
    }
  }

  async function capturePreview(): Promise<string | null> {
    if (!chartRef.current) return null
    try {
      const { toPng } = await import('html-to-image')
      return await toPng(chartRef.current, { backgroundColor: 'white', pixelRatio: 0.4 })
    } catch { return null }
  }

  async function openPaywall(mode: 'after_free' | 'blocked') {
    const preview = await capturePreview()
    setPreviewDataUrl(preview)
    setPaywallMode(mode)
    setPaywallOpen(true)
  }

  const triggerExport = async (type: 'png' | 'svg' | 'pdf') => {
    // export_clicked fires once per user action, regardless of outcome
    trackExport(type)

    if (isProUser()) {
      if (type === 'png') await doExportPNG()
      else if (type === 'svg') await doExportSVG()
      else if (type === 'pdf') await doExportPDF()
      return
    }

    // Free user: one free PNG export
    if (type === 'png' && !hasUsedFreeExport()) {
      await doExportFreePNG()
      recordFreeExport()
      trackFirstFreeExport()
      trackExportCompleted({ format: 'png', data_source: dataSource, workflow: figureWorkflow, is_pro: false })
      trackExportPaywallShown({ format: type, mode: 'after_free' })
      await openPaywall('after_free')
      return
    }

    // Quota exhausted or non-PNG format attempted
    trackExportPaywallShown({ format: type, mode: 'blocked' })
    await openPaywall('blocked')
  }

  const doExportPNG = async () => {
    if (!chartRef.current) return
    setIsExporting(true)
    try {
      const raw = await captureChartPng(300 / 96)
      const dataUrl = injectPngDpi(raw, 300)
      const a = document.createElement('a')
      a.href = dataUrl; a.download = 'figureready.png'; a.click()
      trackExportCompleted({ format: 'png', data_source: dataSource, workflow: figureWorkflow, is_pro: true })
    } catch (err) { console.error('PNG export failed:', err) }
    finally { setIsExporting(false) }
  }

  const doExportFreePNG = async () => {
    if (!chartRef.current) return
    setIsExporting(true)
    try {
      const raw = await captureChartPng(150 / 96)
      const withDpi = injectPngDpi(raw, 150)
      const watermarked = await addWatermark(withDpi)
      const a = document.createElement('a')
      a.href = watermarked; a.download = 'figureready-free.png'; a.click()
    } catch (err) { console.error('Free PNG export failed:', err) }
    finally { setIsExporting(false) }
  }

  const doExportPDF = async () => {
    if (!chartRef.current) return
    setIsExporting(true)
    try {
      const raw = await captureChartPng(300 / 96)
      const { jsPDF } = await import('jspdf')
      const img = new Image()
      img.src = raw
      await new Promise<void>(r => { img.onload = () => r() })
      const pxW = img.naturalWidth
      const pxH = img.naturalHeight
      const mmW = (pxW / 300) * 25.4
      const mmH = (pxH / 300) * 25.4
      const orientation: 'portrait' | 'landscape' = mmW > mmH ? 'landscape' : 'portrait'
      const pdf = new jsPDF({ orientation, unit: 'mm', format: [mmW, mmH] })
      pdf.addImage(raw, 'PNG', 0, 0, mmW, mmH)
      pdf.save('figureready.pdf')
      trackExportCompleted({ format: 'pdf', data_source: dataSource, workflow: figureWorkflow, is_pro: true })
    } catch (err) { console.error('PDF export failed:', err) }
    finally { setIsExporting(false) }
  }

  const doExportSVG = async () => {
    if (!chartRef.current) return
    setIsExporting(true)
    await new Promise(r => setTimeout(r, 80))
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
    trackExportCompleted({ format: 'svg', data_source: dataSource, workflow: figureWorkflow, is_pro: true })
    setIsExporting(false)
  }

  // ─── Handle panel ────────────────────────────────────────────────────────────

  const HANDLE_SIZE = isTouch ? 28 : 10
  const cornerHandleStyle = (cursor: string): React.CSSProperties => ({
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    background: 'white',
    border: '1.5px solid #3b82f6',
    borderRadius: isTouch ? 6 : 2,
    cursor,
    zIndex: 20,
    transform: 'translate(-50%, -50%)',
    touchAction: 'none',
  })

  // ─── Fill helpers ────────────────────────────────────────────────────────────

  const FILL_COLORS = ['#1e293b', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#3b82f6']

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
  const peakLabelAnnotations = annotations.filter((a): a is PeakLabelAnnotation => a.type === 'peak-label')

  // ─── JSX ─────────────────────────────────────────────────────────────────────

  // Compact mode: just the chart canvas — no toolbar, no workspace chrome.
  // panelWidth/panelHeight are the artboard-derived pixel dimensions from MultiPanelPreview.
  // Using explicit px values (not "100%") avoids ResponsiveContainer measuring a stale parent.
  if (compact) {
    const compactW = panelWidth ? `${panelWidth}px` : '100%'
    const compactH = panelHeight ?? figureHeight
    return (
      <div
        ref={chartRef}
        style={{ fontFamily, width: compactW, position: 'relative', userSelect: 'none', overflow: 'hidden' }}
      >
        <ResponsiveContainer width="100%" height={compactH}>
          {renderChart() as React.ReactElement}
        </ResponsiveContainer>
        {legendEnabled && legendMode === 'box' && (
          <DraggableLegend
            yCols={yCols}
            seriesNames={seriesNames}
            colors={resolvedColors}
            strokeWidths={resolvedStrokeWidths}
            chartType={chartType}
            xPct={legendPos.x}
            yPct={legendPos.y}
            orientation={styleOverrides.legendOrientation ?? 'v'}
            bg={styleOverrides.legendBg ?? true}
            fontFamily={fontFamily}
            fontSize={legendFontSize}
            textColor={axisColor}
            containerRef={chartRef}
            onUpdate={(patch) => onStyleChange?.(patch)}
          />
        )}
        {legendEnabled && legendMode === 'inline' && compactMeasured && (() => {
          const containerW = panelWidth ?? chartRef.current?.offsetWidth ?? (figureWidth ?? 700)
          const containerH = (panelHeight ?? figureHeight) ?? 520
          const { left, top, width, height } = plotAreaRef.current
          const yRange = paddedAutoYMax - paddedAutoYMin
          return yCols.map((col, i) => {
            const stored = styleOverrides.seriesLabelPositions?.[col]
            if (stored?.hidden) return null

            // Resolve default position: use cached value for stability across re-renders.
            // If plotAreaRef has valid dimensions (width > 1) and no cache yet, compute
            // and cache so subsequent store-triggered re-renders don't shift the label.
            let computedXPct: number, computedYPct: number
            const cached = compactLabelDefaultsRef.current[col]
            if (cached) {
              computedXPct = cached.xPct
              computedYPct = cached.yPct
            } else if (width > 1) {
              const labelW = inlineLabelWidths[col] ?? 60
              if (stackingMode === 'auto' && yRange > 0 && height > 0) {
                const yOffset = effectiveSeriesYOffsets[col] ?? 0
                const yFrac = Math.max(0.02, Math.min(0.97, 1 - (yOffset - paddedAutoYMin) / yRange))
                computedYPct = ((top + yFrac * height) / containerH) * 100
              } else {
                computedYPct = ((i + 0.5) / yCols.length) * 100
              }
              computedXPct = Math.max(0, Math.min(95, ((left + width - labelW - 14) / containerW) * 100))
              compactLabelDefaultsRef.current[col] = { xPct: computedXPct, yPct: computedYPct }
            } else {
              const labelW = inlineLabelWidths[col] ?? 60
              computedXPct = Math.max(0, 80 - (labelW / containerW) * 100)
              computedYPct = ((i + 0.5) / yCols.length) * 100
            }

            const displayLabel = stored?.text || seriesNames[col] || col
            return (
              <DraggableInlineLabel
                key={col}
                label={displayLabel}
                color={resolvedColors[i]}
                fontFamily={fontFamily}
                fontSize={legendFontSize}
                xPct={stored?.xPct ?? computedXPct}
                yPct={stored?.yPct ?? computedYPct}
                containerRef={chartRef}
                onUpdate={(patch) => onStyleChange?.({
                  seriesLabelPositions: {
                    ...styleOverrides.seriesLabelPositions,
                    [col]: { xPct: patch.xPct, yPct: patch.yPct, text: patch.text ?? stored?.text },
                  },
                })}
                onDelete={() => onStyleChange?.({
                  seriesLabelPositions: {
                    ...styleOverrides.seriesLabelPositions,
                    [col]: { ...(stored ?? { xPct: computedXPct, yPct: computedYPct }), hidden: true },
                  },
                })}
              />
            )
          })
        })()}
      </div>
    )
  }

  return (
    <>
      {paywallOpen && <PaywallModal mode={paywallMode} previewDataUrl={previewDataUrl} onClose={() => setPaywallOpen(false)} />}
      {/* ── Full-height editor layout ──────────────────────────────────────── */}
      <div className="flex flex-col" style={{ height: '100%' }}>

        {/* Annotation toolbar — desktop only; mobile sees it inside the Annotate panel */}
        {annotExpanded && (
          <div className="hidden md:block px-4 py-2 bg-[#f8fafc] border-b border-slate-200 shrink-0">
            <AnnotationToolbar
              activeTool={interaction.activeTool}
              onToolChange={interaction.setActiveTool}
              onInsertSymbol={interaction.insertSymbol}
            />
          </div>
        )}

        {/* Light workspace */}
        <div className="flex-1 overflow-auto bg-[#F7F8FC] md:bg-[#eff6ff]">
          <div className="min-h-full flex items-center justify-center p-3 sm:p-5">
            <div className="w-full overflow-hidden md:overflow-x-auto">
              <div
                ref={chartRef}
                className="relative bg-white p-3 sm:p-8 rounded-[18px] md:rounded-3xl mx-auto border border-[#E7EAF0] md:border-0"
                style={{
                  boxShadow: isMobileCard
                    ? '0 1px 4px rgba(0,0,0,0.06), 0 2px 16px rgba(0,0,0,0.08)'
                    : '0 4px 24px rgba(0,0,0,0.10), 0 20px 80px rgba(0,0,0,0.16)',
                  fontFamily,
                  cursor: interaction.activeTool === 'text' ? 'text' : (interaction.activeTool !== 'select') ? 'crosshair' : drawInsetMode ? 'crosshair' : interaction.isDragging ? 'grabbing' : 'default',
                  width: exportCaptureWidth != null ? `${exportCaptureWidth}px` : figureWidth ? `${figureWidth}px` : '700px',
                  maxWidth: exportCaptureWidth != null ? 'none' : '100%',
                  userSelect: 'none',
                }}
                onContextMenu={e => e.preventDefault()}
                onPointerMove={interaction.handleContainerPointerMove}
                onPointerUp={interaction.handleContainerPointerUp}
                onClick={() => {
                  interaction.handleContainerClick()
                  setInsetSelected(false)
                  if (!seriesClickedRef.current && interaction.activeTool === 'select') {
                    onElementSelect?.({ type: 'figure' })
                  }
                }}
              >
            {/* Chart + axis click zones */}
            <div style={{ position: 'relative' }}>
              <ResponsiveContainer width="100%" height={effectiveChartHeight}>
                {renderChart() as React.ReactElement}
              </ResponsiveContainer>

              {/* Transparent hit zones for Y-axis and X-axis ticks — only in select mode */}
              {interaction.activeTool === 'select' && !compact && (
                <>
                  <div
                    title="Y axis ticks"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: (effectiveMargin.left ?? 16) + yAxisWidth,
                      bottom: (effectiveMargin.bottom ?? 10) + 65,
                      cursor: 'pointer',
                      zIndex: 5,
                    }}
                    className={`transition-colors ${selectedElement?.type === 'yAxisTicks' ? 'bg-blue-400/10' : 'hover:bg-blue-400/5'}`}
                    onClick={(e) => { e.stopPropagation(); onElementSelect?.({ type: 'yAxisTicks' }) }}
                  />
                  <div
                    title="X axis ticks"
                    style={{
                      position: 'absolute',
                      left: (effectiveMargin.left ?? 16) + yAxisWidth,
                      right: 0,
                      bottom: 0,
                      height: (effectiveMargin.bottom ?? 10) + 65,
                      cursor: 'pointer',
                      zIndex: 5,
                    }}
                    className={`transition-colors ${selectedElement?.type === 'xAxisTicks' ? 'bg-blue-400/10' : 'hover:bg-blue-400/5'}`}
                    onClick={(e) => { e.stopPropagation(); onElementSelect?.({ type: 'xAxisTicks' }) }}
                  />
                </>
              )}
            </div>

            {/* ── Annotation draw overlay (line/rect/ellipse/text tools) ─── */}
            {interaction.activeTool !== 'select' && interaction.activeTool !== 'peak' && !drawInsetMode && (
              <div
                style={{ position: 'absolute', inset: 0, zIndex: 25, cursor: interaction.activeTool === 'text' ? 'text' : 'crosshair' }}
                onPointerDown={interaction.handleDrawPointerDown}
                onPointerMove={interaction.handleContainerPointerMove}
                onPointerUp={interaction.handleContainerPointerUp}
                onClick={e => e.stopPropagation()}
              />
            )}

            {/* ── Draw-inset overlay (capture mouse during draw mode) ────── */}
            {drawInsetMode && (
              <div
                style={{ position: 'absolute', inset: 0, zIndex: 28, cursor: 'crosshair' }}
                onMouseDown={e => {
                  const r = e.currentTarget.getBoundingClientRect()
                  const pt = { x: e.clientX - r.left, y: e.clientY - r.top }
                  setDrawPt1(pt); setDrawPt2(pt)
                }}
                onMouseMove={e => {
                  if (!drawPt1) return
                  const r = e.currentTarget.getBoundingClientRect()
                  setDrawPt2({ x: e.clientX - r.left, y: e.clientY - r.top })
                }}
                onMouseUp={e => {
                  if (!drawPt1 || !drawPt2) { setDrawInsetMode(false); setDrawPt1(null); setDrawPt2(null); return }
                  const CARD_PAD = 32
                  const { left: pL, top: pT, width: pW, height: pH } = plotAreaRef.current
                  const toData = (px: number, py: number) => {
                    const pctX = Math.max(0, Math.min(1, (px - CARD_PAD - pL) / pW))
                    const pctY = Math.max(0, Math.min(1, (py - CARD_PAD - pT) / pH))
                    // Use the chart's actual displayed domain — matches Recharts axis exactly
                    const xDomLo = xDomain
                      ? (typeof xDomain[0] === 'number' ? xDomain[0] : (xRangeMin ?? 0))
                      : (xRangeMin ?? 0)
                    const xDomHi = xDomain
                      ? (typeof xDomain[1] === 'number' ? xDomain[1] : (xRangeMax ?? 1))
                      : (xRangeMax ?? 1)
                    const yDomLo = yMin ?? (isLogY ? autoYMin / 2 : isLnY ? autoYMin - 0.5 : paddedAutoYMin)
                    const yDomHi = yMax ?? (isLogY ? autoYMax * 2 : isLnY ? autoYMax + 0.5 : paddedAutoYMax)
                    // Log scale: geometric interpolation; reversed axis: invert pctX mapping
                    const x = (isLogX && xDomLo > 0 && xDomHi > 0)
                      ? xDomLo * Math.pow(xDomHi / xDomLo, pctX)
                      : isXReversed
                        ? xDomHi - pctX * (xDomHi - xDomLo)
                        : xDomLo + pctX * (xDomHi - xDomLo)
                    const y = (isLogY && yDomLo > 0 && yDomHi > 0)
                      ? yDomHi * Math.pow(yDomLo / yDomHi, pctY)
                      : yDomHi - pctY * (yDomHi - yDomLo)
                    return { x, y }
                  }
                  const p1 = toData(drawPt1.x, drawPt1.y)
                  const p2 = toData(drawPt2.x, drawPt2.y)
                  if (Math.abs(p2.x - p1.x) > 0 && Math.abs(p2.y - p1.y) > 0) {
                    const r = e.currentTarget.getBoundingClientRect()
                    const cx = (drawPt1.x + drawPt2.x) / 2
                    const cy = (drawPt1.y + drawPt2.y) / 2
                    const defLeft = cx < r.width * 0.5 ? r.width * 0.52 : 32
                    const defTop  = cy < r.height * 0.5 ? r.height * 0.55 : 32
                    onStyleChange?.({
                      insetDefined: true,
                      insetXMin: Math.min(p1.x, p2.x), insetXMax: Math.max(p1.x, p2.x),
                      insetYMin: Math.min(p1.y, p2.y), insetYMax: Math.max(p1.y, p2.y),
                      insetLeft: styleOverrides.insetLeft ?? defLeft,
                      insetTop:  styleOverrides.insetTop  ?? defTop,
                      insetSizePct:    styleOverrides.insetSizePct    ?? 35,
                      insetFontSize:   styleOverrides.insetFontSize   ?? 8,
                      insetLineWidth:  styleOverrides.insetLineWidth  ?? 1.2,
                      insetBorder:     styleOverrides.insetBorder     ?? false,
                      insetBorderColor: styleOverrides.insetBorderColor ?? axisColor,
                      insetBorderWidth: styleOverrides.insetBorderWidth ?? 1.5,
                    })
                  }
                  setDrawInsetMode(false); setDrawPt1(null); setDrawPt2(null)
                }}
                onMouseLeave={() => { setDrawInsetMode(false); setDrawPt1(null); setDrawPt2(null) }}
              >
                {drawPt1 && drawPt2 && (
                  <div style={{
                    position: 'absolute',
                    left: Math.min(drawPt1.x, drawPt2.x), top: Math.min(drawPt1.y, drawPt2.y),
                    width: Math.abs(drawPt2.x - drawPt1.x), height: Math.abs(drawPt2.y - drawPt1.y),
                    border: '2px dashed #2563eb', background: 'rgba(37,99,235,0.08)', pointerEvents: 'none',
                  }} />
                )}
              </div>
            )}

            {/* ── Peak-pick overlay ────────────────────────────────────────── */}
            {interaction.activeTool === 'peak' && !drawInsetMode && (
              <div
                style={{ position: 'absolute', inset: 0, zIndex: 30, cursor: 'crosshair' }}
                onClick={e => { e.stopPropagation(); handlePeakPickClick(e.clientX, e.clientY) }}
              >
                <div style={{
                  position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(37,99,235,0.92)', color: 'white',
                  fontSize: 12, fontFamily: 'system-ui, sans-serif',
                  padding: '4px 12px', borderRadius: 20, pointerEvents: 'none',
                  whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                }}>
                  Click on a peak · Esc to cancel
                </div>
              </div>
            )}

            {/* ── Inset chart ───────────────────────────────────────────────── */}
            {styleOverrides.insetDefined && isNumericX &&
             styleOverrides.insetXMin !== undefined && styleOverrides.insetXMax !== undefined &&
             styleOverrides.insetYMin !== undefined && styleOverrides.insetYMax !== undefined && (() => {
              const iXMin   = styleOverrides.insetXMin!
              const iXMax   = styleOverrides.insetXMax!
              const iYMin   = styleOverrides.insetYMin!
              const iYMax   = styleOverrides.insetYMax!
              const sizePct = styleOverrides.insetSizePct   ?? 35
              const iTickSz = styleOverrides.insetTickFontSize ?? 7
              const iLineW  = styleOverrides.insetLineWidth  ?? 1.2
              const iBorder = styleOverrides.insetBorder     ?? false
              const iBdrCol = styleOverrides.insetBorderColor ?? axisColor
              const iBdrW   = styleOverrides.insetBorderWidth ?? 1.5
              const figW    = figureWidth  ?? 700
              const figH    = figureHeight ?? s.chartHeight
              const baseW   = Math.round(figW * sizePct / 100)
              const baseH   = Math.round(figH * sizePct / 100)
              const rW      = styleOverrides.insetWidth  ?? baseW
              const rH      = styleOverrides.insetHeight ?? baseH
              const insetL  = styleOverrides.insetLeft   ?? figW * 0.55
              const insetT  = styleOverrides.insetTop    ?? 32

              // Nice round ticks — subsampled to fit available space
              const rawXTicks = getNiceTicks(iXMin, iXMax)
              const rawYTicks = getNiceTicks(iYMin, iYMax)
              const subsample = (tks: number[], maxCount: number) => {
                if (tks.length <= maxCount) return tks
                const step = Math.ceil(tks.length / maxCount)
                return tks.filter((_, i) => i % step === 0 || i === tks.length - 1)
              }
              const maxXTicks = Math.max(2, Math.floor(rW / (iTickSz * 4)))
              const maxYTicks = Math.max(2, Math.floor(rH / (iTickSz * 2.2)))
              const xTicks = subsample(rawXTicks.length >= 2 ? rawXTicks : [iXMin, iXMax], maxXTicks)
              const yTicks = subsample(rawYTicks.length >= 2 ? rawYTicks : [iYMin, iYMax], maxYTicks)

              const yAxisW = Math.max(18, Math.ceil(iTickSz * 3.2))
              const chartMargin = { top: 4, right: 6, bottom: 14, left: 2 }

              const HS: React.CSSProperties = {
                position: 'absolute', width: 8, height: 8,
                background: 'white', border: '1.5px solid #3b82f6',
                borderRadius: 2, zIndex: 22, touchAction: 'none',
              }

              const startResize = (e: React.PointerEvent<HTMLDivElement>, h: string) => {
                e.stopPropagation(); e.preventDefault()
                const sx = e.clientX, sy = e.clientY
                const sL = insetL, sT = insetT, sW = rW, sH = rH
                const move = (ev: PointerEvent) => {
                  const dx = ev.clientX - sx, dy = ev.clientY - sy
                  const cr = chartRef.current?.getBoundingClientRect()
                  if (!cr) return
                  let nL = sL, nT = sT, nW = sW, nH = sH
                  if (h.includes('e')) nW = Math.max(80, sW + dx)
                  if (h.includes('w')) { nW = Math.max(80, sW - dx); nL = sL + sW - nW }
                  if (h.includes('s')) nH = Math.max(60, sH + dy)
                  if (h.includes('n')) { nH = Math.max(60, sH - dy); nT = sT + sH - nH }
                  nL = Math.max(0, Math.min(cr.width - nW, nL))
                  nT = Math.max(0, Math.min(cr.height - nH, nT))
                  onStyleChange?.({ insetLeft: nL, insetTop: nT, insetWidth: nW, insetHeight: nH })
                }
                const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
                window.addEventListener('pointermove', move)
                window.addEventListener('pointerup', up)
              }

              return (
                <>
                  {/* Inset wrapper — overflow visible so handles extend outside bounds */}
                  <div
                    style={{ position: 'absolute', left: insetL, top: insetT, width: rW, height: rH, zIndex: 20 }}
                    onClick={e => { e.stopPropagation(); setInsetSelected(true) }}
                  >
                    {/* Chart box — clipped, draggable */}
                    <div
                      style={{
                        position: 'absolute', inset: 0, background: '#fff',
                        border: iBorder ? `${iBdrW}px solid ${iBdrCol}` : 'none',
                        outline: insetSelected ? '2px solid #3b82f6' : 'none',
                        outlineOffset: 1,
                        boxSizing: 'border-box', overflow: 'hidden', cursor: 'move',
                      }}
                      onPointerDown={e => {
                        e.stopPropagation()
                        const startX = e.clientX - insetL
                        const startY = e.clientY - insetT
                        const move = (ev: PointerEvent) => {
                          const cr = chartRef.current?.getBoundingClientRect()
                          if (!cr) return
                          onStyleChange?.({
                            insetLeft: Math.max(0, Math.min(cr.width  - rW, ev.clientX - startX)),
                            insetTop:  Math.max(0, Math.min(cr.height - rH, ev.clientY - startY)),
                          })
                        }
                        const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
                        window.addEventListener('pointermove', move)
                        window.addEventListener('pointerup', up)
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'bar' ? (() => {
                          const insetBarData = processedData.filter(d => {
                            const x = Number(d.x)
                            return !isNaN(x) && x >= iXMin && x <= iXMax
                          })
                          const frameComponent = (styleOverrides.insetShowFrame ?? false)
                            ? <Customized component={({ offset }: { offset?: { top: number; left: number; width: number; height: number } }) => {
                                if (!offset) return null
                                const { top, left, width, height } = offset
                                return (
                                  <g>
                                    <line x1={left} y1={top} x2={left + width} y2={top} stroke={axisColor} strokeWidth={0.8} />
                                    <line x1={left + width} y1={top} x2={left + width} y2={top + height} stroke={axisColor} strokeWidth={0.8} />
                                  </g>
                                )
                              }} />
                            : null
                          return (
                            <BarChart key={`inset-bar-${iTickSz}-${yAxisW}`} data={insetBarData.length ? insetBarData : processedData} margin={chartMargin}>
                              {frameComponent}
                              <XAxis dataKey="x"
                                tick={{ fontSize: iTickSz, fill: axisColor, fontFamily }}
                                axisLine={{ stroke: axisColor, strokeWidth: 0.8 }}
                                tickLine={{ stroke: axisColor, strokeWidth: 0.8 }}
                                height={16}
                              />
                              <YAxis
                                domain={[yTicks[0], yTicks[yTicks.length - 1]]}
                                ticks={yTicks} allowDataOverflow minTickGap={0}
                                tickFormatter={fmtInsetTick}
                                tick={{ fontSize: iTickSz, fill: axisColor, fontFamily }}
                                axisLine={{ stroke: axisColor, strokeWidth: 0.8 }}
                                tickLine={{ stroke: axisColor, strokeWidth: 0.8 }}
                                width={yAxisW}
                              />
                              {yCols.map((col, i) => (
                                <Bar key={col} dataKey={col}
                                  fill={seriesColor(col, i)}
                                  radius={[s.barRadius, s.barRadius, 0, 0]}
                                  isAnimationActive={false} />
                              ))}
                            </BarChart>
                          )
                        })() : (
                          <LineChart key={`inset-line-${iTickSz}-${yAxisW}`} data={processedData} margin={chartMargin}>
                            {(styleOverrides.insetShowFrame ?? false) && (
                              <Customized component={({ offset }: { offset?: { top: number; left: number; width: number; height: number } }) => {
                                if (!offset) return null
                                const { top, left, width, height } = offset
                                return (
                                  <g>
                                    <line x1={left} y1={top} x2={left + width} y2={top} stroke={axisColor} strokeWidth={0.8} />
                                    <line x1={left + width} y1={top} x2={left + width} y2={top + height} stroke={axisColor} strokeWidth={0.8} />
                                  </g>
                                )
                              }} />
                            )}
                            <XAxis dataKey="x" type="number"
                              domain={[xTicks[0], xTicks[xTicks.length - 1]]}
                              ticks={xTicks} allowDataOverflow minTickGap={0}
                              reversed={isXReversed}
                              tickFormatter={fmtInsetTick}
                              tick={{ fontSize: iTickSz, fill: axisColor, fontFamily }}
                              axisLine={{ stroke: axisColor, strokeWidth: 0.8 }}
                              tickLine={{ stroke: axisColor, strokeWidth: 0.8 }}
                              height={16}
                            />
                            <YAxis
                              domain={[yTicks[0], yTicks[yTicks.length - 1]]}
                              ticks={yTicks} allowDataOverflow minTickGap={0}
                              tickFormatter={fmtInsetTick}
                              tick={{ fontSize: iTickSz, fill: axisColor, fontFamily }}
                              axisLine={{ stroke: axisColor, strokeWidth: 0.8 }}
                              tickLine={{ stroke: axisColor, strokeWidth: 0.8 }}
                              width={yAxisW}
                            />
                            {yCols.map((col, i) => (
                              <Line key={col} type="monotone" dataKey={col}
                                stroke={seriesColor(col, i)} strokeWidth={iLineW}
                                dot={false} isAnimationActive={false} />
                            ))}
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>

                    {/* 8 resize handles — shown when inset is selected */}
                    {insetSelected && (
                      <>
                        <div style={{ ...HS, top: -4, left: -4, cursor: 'nw-resize' }} onPointerDown={e => startResize(e, 'nw')} />
                        <div style={{ ...HS, top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' }} onPointerDown={e => startResize(e, 'n')} />
                        <div style={{ ...HS, top: -4, right: -4, cursor: 'ne-resize' }} onPointerDown={e => startResize(e, 'ne')} />
                        <div style={{ ...HS, top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'w-resize' }} onPointerDown={e => startResize(e, 'w')} />
                        <div style={{ ...HS, top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'e-resize' }} onPointerDown={e => startResize(e, 'e')} />
                        <div style={{ ...HS, bottom: -4, left: -4, cursor: 'sw-resize' }} onPointerDown={e => startResize(e, 'sw')} />
                        <div style={{ ...HS, bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' }} onPointerDown={e => startResize(e, 's')} />
                        <div style={{ ...HS, bottom: -4, right: -4, cursor: 'se-resize' }} onPointerDown={e => startResize(e, 'se')} />
                      </>
                    )}
                  </div>
                </>
              )
            })()}

            {/* Draggable legend overlay — hidden on mobile preview and when inline labels mode is active */}
            {legendEnabled && !previewOnly && legendMode === 'box' && (
              <DraggableLegend
                yCols={yCols}
                seriesNames={seriesNames}
                colors={resolvedColors}
                strokeWidths={resolvedStrokeWidths}
                chartType={chartType}
                xPct={legendPos.x}
                yPct={legendPos.y}
                orientation={styleOverrides.legendOrientation ?? 'v'}
                bg={styleOverrides.legendBg ?? true}
                fontFamily={fontFamily}
                fontSize={legendFontSize}
                textColor={axisColor}
                containerRef={chartRef}
                onUpdate={(patch) => onStyleChange?.(patch)}
                onElementSelect={onElementSelect ?? undefined}
              />
            )}

            {/* Draggable inline series labels — rendered as HTML divs so they are draggable
                and always inside the chart frame. Default position: right side of the plot,
                vertically aligned to each series' stacking offset. */}
            {legendEnabled && legendMode === 'inline' && !previewOnly && (() => {
              const containerW = chartRef.current?.offsetWidth || (figureWidth ?? 700)
              const containerH = chartRef.current?.offsetHeight || (figureHeight ?? 520)
              const { left, top, width, height } = plotAreaRef.current
              const yRange = paddedAutoYMax - paddedAutoYMin
              return yCols.map((col, i) => {
                const stored = styleOverrides.seriesLabelPositions?.[col]
                if (stored?.hidden) return null

                let defaultYPct: number
                if (stackingMode === 'auto' && yRange > 0 && height > 0) {
                  const yOffset = effectiveSeriesYOffsets[col] ?? 0
                  const yFrac = Math.max(0.02, Math.min(0.97, 1 - (yOffset - paddedAutoYMin) / yRange))
                  defaultYPct = ((top + yFrac * height) / containerH) * 100
                } else {
                  defaultYPct = ((i + 0.5) / yCols.length) * 100
                }
                const labelW = inlineLabelWidths[col] ?? 60
                const defaultXPct = width > 0
                  ? ((left + width - labelW - 14) / containerW) * 100
                  : Math.max(0, 85 - (labelW / (figureWidth ?? 700)) * 100)

                // Use custom text if the user renamed the label, otherwise fall back to seriesNames
                const displayLabel = stored?.text || seriesNames[col] || col

                return (
                  <DraggableInlineLabel
                    key={col}
                    label={displayLabel}
                    color={resolvedColors[i]}
                    fontFamily={fontFamily}
                    fontSize={legendFontSize}
                    xPct={stored?.xPct ?? defaultXPct}
                    yPct={stored?.yPct ?? defaultYPct}
                    containerRef={chartRef}
                    onUpdate={(patch) => onStyleChange?.({
                      seriesLabelPositions: {
                        ...styleOverrides.seriesLabelPositions,
                        [col]: { xPct: patch.xPct, yPct: patch.yPct, text: patch.text ?? stored?.text },
                      },
                    })}
                    onDelete={() => onStyleChange?.({
                      seriesLabelPositions: {
                        ...styleOverrides.seriesLabelPositions,
                        [col]: { ...(stored ?? { xPct: defaultXPct, yPct: defaultYPct }), hidden: true },
                      },
                    })}
                  />
                )
              })
            })()}

            {/* SVG overlay — arrows/annotations */}
            <svg
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                pointerEvents: 'none', overflow: 'visible',
              }}
            >
              {/* Snap guide lines (shown while dragging any annotation near a snap target) */}
              {interaction.activeSnapGuides.x !== null && (
                <line x1={`${interaction.activeSnapGuides.x}%`} y1="0" x2={`${interaction.activeSnapGuides.x}%`} y2="100%"
                  stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 4" opacity={0.6} style={{ pointerEvents: 'none' }} />
              )}
              {interaction.activeSnapGuides.y !== null && (
                <line x1="0" y1={`${interaction.activeSnapGuides.y}%`} x2="100%" y2={`${interaction.activeSnapGuides.y}%`}
                  stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 4" opacity={0.6} style={{ pointerEvents: 'none' }} />
              )}
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
                const isSel = interaction.selectedId === ann.id
                return (
                  <g key={ann.id}>
                    <line
                      ref={el => interaction.registerLineHitbox(ann.id, el)}
                      x1={`${ann.x1Pct}%`} y1={`${ann.y1Pct}%`}
                      x2={`${ann.x2Pct}%`} y2={`${ann.y2Pct}%`}
                      stroke="transparent" strokeWidth={isTouch ? 28 : 14}
                      style={{ pointerEvents: 'all', cursor: 'move' }}
                      onClick={e => { e.stopPropagation(); interaction.setSelectedId(ann.id) }}
                      onPointerDown={e => interaction.startMoveLine(e, ann)}
                    />
                    <line
                      ref={el => interaction.registerLineVisual(ann.id, el)}
                      x1={`${ann.x1Pct}%`} y1={`${ann.y1Pct}%`}
                      x2={`${ann.x2Pct}%`} y2={`${ann.y2Pct}%`}
                      stroke={isSel ? '#3b82f6' : axisColor}
                      strokeWidth={1.5}
                      markerEnd={isSel ? 'url(#fr-arrow-sel)' : 'url(#fr-arrow)'}
                      style={{ pointerEvents: 'none' }}
                    />
                    {isSel && (
                      <>
                        {isTouch && <circle cx={`${ann.x1Pct}%`} cy={`${ann.y1Pct}%`} r={16} fill="transparent" style={{ pointerEvents: 'all' }} onClick={e => e.stopPropagation()} onPointerDown={e => interaction.startResizeLineEndpoint(e, ann, 1)} />}
                        <circle
                          ref={el => interaction.registerLineEp(ann.id, 1, el)}
                          cx={`${ann.x1Pct}%`} cy={`${ann.y1Pct}%`} r={5}
                          fill="white" stroke="#3b82f6" strokeWidth={1.5}
                          style={{ pointerEvents: isTouch ? 'none' : 'all', cursor: 'crosshair' }}
                          onClick={e => e.stopPropagation()}
                          onPointerDown={e => interaction.startResizeLineEndpoint(e, ann, 1)}
                        />
                        {isTouch && <circle cx={`${ann.x2Pct}%`} cy={`${ann.y2Pct}%`} r={16} fill="transparent" style={{ pointerEvents: 'all' }} onClick={e => e.stopPropagation()} onPointerDown={e => interaction.startResizeLineEndpoint(e, ann, 2)} />}
                        <circle
                          ref={el => interaction.registerLineEp(ann.id, 2, el)}
                          cx={`${ann.x2Pct}%`} cy={`${ann.y2Pct}%`} r={5}
                          fill="white" stroke="#3b82f6" strokeWidth={1.5}
                          style={{ pointerEvents: isTouch ? 'none' : 'all', cursor: 'crosshair' }}
                          onClick={e => e.stopPropagation()}
                          onPointerDown={e => interaction.startResizeLineEndpoint(e, ann, 2)}
                        />
                      </>
                    )}
                  </g>
                )
              })}
              {/* New line annotations (solid/dashed, optional arrowheads) */}
              {lineAnnotations.map(ann => {
                const isSel = interaction.selectedId === ann.id
                const strokeColor = isSel ? '#3b82f6' : axisColor
                const mEnd = ann.headEnd ? (isSel ? 'url(#fr-arrow-sel)' : 'url(#fr-arrow)') : undefined
                const mStart = ann.headStart ? (isSel ? 'url(#fr-arrow-rev-sel)' : 'url(#fr-arrow-rev)') : undefined
                return (
                  <g key={ann.id}>
                    <line
                      ref={el => interaction.registerLineHitbox(ann.id, el)}
                      x1={`${ann.x1Pct}%`} y1={`${ann.y1Pct}%`}
                      x2={`${ann.x2Pct}%`} y2={`${ann.y2Pct}%`}
                      stroke="transparent" strokeWidth={isTouch ? 28 : 14}
                      style={{ pointerEvents: 'all', cursor: 'move' }}
                      onClick={e => { e.stopPropagation(); interaction.setSelectedId(ann.id) }}
                      onPointerDown={e => interaction.startMoveLine(e, ann)}
                    />
                    <line
                      ref={el => interaction.registerLineVisual(ann.id, el)}
                      x1={`${ann.x1Pct}%`} y1={`${ann.y1Pct}%`}
                      x2={`${ann.x2Pct}%`} y2={`${ann.y2Pct}%`}
                      stroke={strokeColor} strokeWidth={ann.strokeWidth ?? 1.5}
                      strokeDasharray={ann.dash ? '6 4' : undefined}
                      markerEnd={mEnd}
                      markerStart={mStart}
                      style={{ pointerEvents: 'none' }}
                    />
                    {isSel && (
                      <>
                        {isTouch && <circle cx={`${ann.x1Pct}%`} cy={`${ann.y1Pct}%`} r={16} fill="transparent" style={{ pointerEvents: 'all' }} onClick={e => e.stopPropagation()} onPointerDown={e => interaction.startResizeLineEndpoint(e, ann, 1)} />}
                        <circle
                          ref={el => interaction.registerLineEp(ann.id, 1, el)}
                          cx={`${ann.x1Pct}%`} cy={`${ann.y1Pct}%`} r={5}
                          fill="white" stroke="#3b82f6" strokeWidth={1.5}
                          style={{ pointerEvents: isTouch ? 'none' : 'all', cursor: 'crosshair' }}
                          onClick={e => e.stopPropagation()}
                          onPointerDown={e => interaction.startResizeLineEndpoint(e, ann, 1)}
                        />
                        {isTouch && <circle cx={`${ann.x2Pct}%`} cy={`${ann.y2Pct}%`} r={16} fill="transparent" style={{ pointerEvents: 'all' }} onClick={e => e.stopPropagation()} onPointerDown={e => interaction.startResizeLineEndpoint(e, ann, 2)} />}
                        <circle
                          ref={el => interaction.registerLineEp(ann.id, 2, el)}
                          cx={`${ann.x2Pct}%`} cy={`${ann.y2Pct}%`} r={5}
                          fill="white" stroke="#3b82f6" strokeWidth={1.5}
                          style={{ pointerEvents: isTouch ? 'none' : 'all', cursor: 'crosshair' }}
                          onClick={e => e.stopPropagation()}
                          onPointerDown={e => interaction.startResizeLineEndpoint(e, ann, 2)}
                        />
                      </>
                    )}
                  </g>
                )
              })}
              {/* Peak label annotations — label offset is draggable, anchor tied to data coordinates */}
              {peakLabelAnnotations.map(ann => {
                const isSel = interaction.selectedId === ann.id
                const container = chartRef.current
                if (!container) return null
                // Convert data coordinates to SVG pixel coordinates using plotAreaRef + axis domain
                const { left, top, width, height } = plotAreaRef.current
                const cW = container.offsetWidth, cH = container.offsetHeight
                const dataXScaled = isLnX ? Math.log(Math.max(ann.dataX, 1e-10)) : ann.dataX
                const seriesYOff = isLnY ? 0 : (effectiveSeriesYOffsets[ann.seriesKey ?? ''] ?? 0)
                const dataYScaled = isLnY ? Math.log(Math.max(ann.dataY, 1e-10)) : ann.dataY + seriesYOff
                const xDomainMin = xRangeMin ?? 0
                const xDomainMax = xRangeMax ?? 1
                const yDomainMin = yMin ?? paddedAutoYMin
                const yDomainMax = yMax ?? paddedAutoYMax
                const xFrac = xDomainMax !== xDomainMin
                  ? Math.max(0, Math.min(1, isXReversed
                      ? 1 - (dataXScaled - xDomainMin) / (xDomainMax - xDomainMin)
                      : (dataXScaled - xDomainMin) / (xDomainMax - xDomainMin)))
                  : 0.5
                const yFrac = yDomainMax !== yDomainMin
                  ? Math.max(0, Math.min(1, 1 - (dataYScaled - yDomainMin) / (yDomainMax - yDomainMin)))
                  : 0.5
                const anchorSvgX = left + xFrac * width
                const anchorSvgY = top + yFrac * height
                const anchorXPct = anchorSvgX / cW * 100
                const anchorYPct = anchorSvgY / cH * 100
                const labelXPct = anchorXPct + ann.offsetXPct
                const labelYPct = anchorYPct + ann.offsetYPct
                const labelSvgX = labelXPct / 100 * cW
                const labelSvgY = labelYPct / 100 * cH
                const strokeColor = isSel ? '#3b82f6' : axisColor
                return (
                  <g key={ann.id}>
                    {/* Leader line from label to anchor */}
                    {ann.leaderLine && (
                      <line
                        ref={el => interaction.registerPeakLeader(ann.id, el)}
                        x1={labelSvgX} y1={labelSvgY}
                        x2={anchorSvgX} y2={anchorSvgY}
                        stroke={strokeColor} strokeWidth={1}
                        style={{ pointerEvents: 'none' }}
                      />
                    )}
                    {/* Anchor dot at data point */}
                    <circle cx={anchorSvgX} cy={anchorSvgY} r={isSel ? 4 : 3}
                      fill={strokeColor} style={{ pointerEvents: 'none' }} />
                    {/* Transparent wide hitbox for dragging the label */}
                    <rect
                      ref={el => interaction.registerPeakHitbox(ann.id, el)}
                      x={labelSvgX - 50} y={labelSvgY - 14}
                      width={100} height={28}
                      fill="transparent"
                      style={{ pointerEvents: 'all', cursor: 'grab' }}
                      onClick={e => { e.stopPropagation(); interaction.setSelectedId(ann.id) }}
                      onPointerDown={e => interaction.startMovePeak(e, ann, anchorXPct, anchorYPct)}
                    />
                    {/* Label text */}
                    <text
                      ref={el => interaction.registerPeakLabel(ann.id, el)}
                      x={labelSvgX} y={labelSvgY}
                      textAnchor="middle" dominantBaseline="middle"
                      fill={ann.color ?? strokeColor}
                      fontFamily={fontFamily} fontSize={ann.fontSize ?? annotationFontSize}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {ann.text}
                    </text>
                    {/* Selection outline */}
                    {isSel && (
                      <rect x={labelSvgX - 52} y={labelSvgY - 16} width={104} height={32}
                        fill="none" stroke="#3b82f6" strokeWidth={1} rx={3}
                        style={{ pointerEvents: 'none' }} />
                    )}
                  </g>
                )
              })}
            </svg>

            {/* Ellipse annotations */}
            {ellipseAnnotations.map(ann => {
              const isSel = interaction.selectedId === ann.id
              return (
                <div
                  key={ann.id}
                  ref={el => interaction.registerBoxEl(ann.id, el)}
                  style={{
                    position: 'absolute',
                    left: `${ann.xPct}%`, top: `${ann.yPct}%`,
                    width: `${ann.widthPct}%`, height: `${ann.heightPct}%`,
                    border: `${ann.borderWidth ?? 1.5}px solid ${isSel ? '#3b82f6' : (ann.borderColor ?? axisColor)}`,
                    borderRadius: '50%',
                    background: ann.fillColor ? toRgba(ann.fillColor, ann.fillOpacity ?? 0.3) : 'transparent',
                    boxSizing: 'border-box',
                    cursor: 'move',
                    touchAction: isTouch && !isSel ? 'pan-y' : 'none',
                    zIndex: 5,
                  }}
                  onClick={e => { e.stopPropagation(); interaction.setSelectedId(ann.id) }}
                  onPointerDown={e => interaction.startMoveBox(e, ann)}
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
                          onPointerDown={e => interaction.startResizeBoxCorner(e, ann, corner)}
                        />
                      ))}
                    </>
                  )}
                </div>
              )
            })}

            {/* Rectangle annotations */}
            {rectAnnotations.map(ann => {
              const isSel = interaction.selectedId === ann.id
              return (
                <div
                  key={ann.id}
                  ref={el => interaction.registerBoxEl(ann.id, el)}
                  style={{
                    position: 'absolute',
                    left: `${ann.xPct}%`, top: `${ann.yPct}%`,
                    width: `${ann.widthPct}%`, height: `${ann.heightPct}%`,
                    border: `${ann.borderWidth ?? 1.5}px solid ${isSel ? '#3b82f6' : (ann.borderColor ?? axisColor)}`,
                    background: ann.fillColor ? toRgba(ann.fillColor, ann.fillOpacity ?? 0.3) : 'transparent',
                    boxSizing: 'border-box',
                    cursor: 'move',
                    touchAction: isTouch && !isSel ? 'pan-y' : 'none',
                    zIndex: 5,
                  }}
                  onClick={e => { e.stopPropagation(); interaction.setSelectedId(ann.id) }}
                  onPointerDown={e => interaction.startMoveBox(e, ann)}
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
                          onPointerDown={e => interaction.startResizeBoxCorner(e, ann, corner)}
                        />
                      ))}
                    </>
                  )}
                </div>
              )
            })}

            {/* Text annotations */}
            {textAnnotations.map(ann => {
              const isSel = interaction.selectedId === ann.id
              const isEdit = interaction.editingId === ann.id
              return (
                <div
                  key={ann.id}
                  ref={el => interaction.registerTextEl(ann.id, el)}
                  className="absolute group select-none"
                  style={{
                    left: `${ann.xPct}%`, top: `${ann.yPct}%`,
                    transform: 'translate(-50%, -50%)',
                    padding: 10,
                    cursor: isEdit ? 'text' : 'grab',
                    touchAction: isTouch && !isSel ? 'pan-y' : 'none',
                    zIndex: 6,
                  }}
                  onClick={e => { e.stopPropagation(); interaction.setSelectedId(ann.id) }}
                  onPointerDown={e => interaction.startMoveText(e, ann)}
                  onDoubleClick={e => { e.stopPropagation(); interaction.setEditingId(ann.id) }}
                >
                  <div
                    contentEditable={isEdit}
                    suppressContentEditableWarning
                    onKeyDown={isEdit ? e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        e.currentTarget.blur()
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault()
                        e.currentTarget.textContent = ann.text
                        e.currentTarget.blur()
                      }
                    } : undefined}
                    onBlur={e => {
                      const text = e.currentTarget.textContent?.trim() || 'Text'
                      interaction.updateAnnotation(ann.id, { text })
                      interaction.setEditingId(null)
                    }}
                    className="px-1 whitespace-nowrap outline-none"
                    style={{
                      fontFamily,
                      fontSize: ann.fontSize ?? annotationFontSize,
                      color: ann.color ?? axisColor,
                      fontWeight: ann.fontWeight ?? (boldLabels ? 'bold' : 'normal'),
                      fontStyle: ann.fontStyle ?? 'normal',
                      borderRadius: 3,
                      outline: isSel ? '1.5px solid #3b82f6' : isEdit ? '1px solid #93c5fd' : 'none',
                      outlineOffset: 3,
                    }}
                  >
                    {ann.text}
                  </div>
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

        <AnnotationContextBar
          selected={interaction.selectedId ? (annotations.find(a => a.id === interaction.selectedId) ?? null) : null}
          activeTool={interaction.activeTool}
          defaultColor={axisColor}
          defaultFontSize={typeof annotationFontSize === 'number' ? annotationFontSize : 10}
          zoomEnabled={zoomEnabled}
          zoomDomain={zoomDomain}
          onUpdate={(id, changes) => interaction.updateAnnotation(id, changes)}
          onDelete={interaction.removeAnnotation}
          onResetZoom={resetZoom}
        />

      </div>{/* /flex-col editor */}
    </>
  )
})

export default ChartPreview
