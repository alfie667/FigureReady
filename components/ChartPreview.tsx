'use client'
import { useEffect, useRef, useState } from 'react'
import {
  LineChart, Line,
  ScatterChart, Scatter,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea, ErrorBar,
  ResponsiveContainer,
} from 'recharts'
import { chartStyles } from '@/lib/chartStyles'
import type { StyleName, StyleOverrides } from '@/lib/chartStyles'
import type { ChartAnnotation } from '@/lib/annotations'
import { formatAxisLabel } from '@/lib/formatLabel'
import { getNiceTicks } from '@/lib/niceTicks'

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 16.5V3" />
    </svg>
  )
}

function TextIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4.5 6.75h15M5.25 12h13.5M6 17.25h12" />
    </svg>
  )
}

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
}

export default function ChartPreview({ data, xCol, yCols, seriesNames, errorCols, xAxisLabel, yAxisLabel, chartType, styleName, styleOverrides, annotations, onAnnotationsChange }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const draggingRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)
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

  const isNumericX = data.length > 0 && typeof data[0][xCol] === 'number'
  const zoomEnabled = isNumericX && chartType !== 'bar'

  const [refLeft, setRefLeft] = useState<number | null>(null)
  const [refRight, setRefRight] = useState<number | null>(null)
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null)

  useEffect(() => {
    setZoomDomain(null)
    setRefLeft(null)
    setRefRight(null)
  }, [xCol, yCols.join(','), chartType, data.length])

  const handleMouseDown = (e: ChartMouseEvent) => {
    if (!zoomEnabled || e.activeLabel === undefined) return
    setRefLeft(Number(e.activeLabel))
    setRefRight(null)
  }
  const handleMouseMove = (e: ChartMouseEvent) => {
    if (!zoomEnabled || refLeft === null || e.activeLabel === undefined) return
    setRefRight(Number(e.activeLabel))
  }
  const handleMouseUp = () => {
    if (refLeft !== null && refRight !== null && refLeft !== refRight) {
      setZoomDomain([Math.min(refLeft, refRight), Math.max(refLeft, refRight)])
    }
    setRefLeft(null)
    setRefRight(null)
  }
  const resetZoom = () => setZoomDomain(null)

  const inZoomRange = (x: unknown) =>
    zoomDomain === null || (typeof x === 'number' && x >= zoomDomain[0] && x <= zoomDomain[1])

  const hasError = (col: string) => !!errorCols[col]

  // {x, Y1, Y2, ...} rows for line/bar charts (one shared dataset for all series)
  const processedData = data
    .map(row => {
      const point: Record<string, unknown> = { x: row[xCol] }
      yCols.forEach(col => {
        const v = Number(row[col])
        point[col] = isNaN(v) ? null : v
        if (hasError(col)) {
          const e = Number(row[errorCols[col]])
          point[`error_${col}`] = isNaN(e) ? null : e
        }
      })
      return point
    })
    .filter(point => inZoomRange(point.x))

  // Independent {x, y} pairs per series for scatter charts
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
      .filter(d => !isNaN(d.y as number) && inZoomRange(d.x)),
  }))

  // Evenly-spaced ticks for numeric X axes, overriding Recharts' default
  // tick generation which can produce uneven steps (e.g. 1,2,3...10,12,14)
  const xValues = isNumericX
    ? data.map(row => Number(row[xCol])).filter(v => !isNaN(v) && inZoomRange(v))
    : []
  const xTicks = xValues.length > 0 ? getNiceTicks(Math.min(...xValues), Math.max(...xValues)) : undefined
  const xDomain = xTicks ? ([xTicks[0], xTicks[xTicks.length - 1]] as [number, number]) : undefined

  const boldLabels = styleOverrides.boldLabels ?? false
  const tickFontWeight = boldLabels ? 'bold' : 'normal'
  const titleFontWeight = boldLabels ? 'bold' : s.labelFontWeight
  const xTickStyle = { fontSize: xTickSize, fontFamily: s.fontFamily, fill: axisColor, fontWeight: tickFontWeight }
  const yTickStyle = { fontSize: yTickSize, fontFamily: s.fontFamily, fill: axisColor, fontWeight: tickFontWeight }
  const axisLine = { stroke: axisColor, strokeWidth: axisWidth }
  const margin = s.margin
  const xLabelStyle = { fontFamily: s.fontFamily, fontSize: xTitleSize, fontWeight: titleFontWeight, fill: axisColor }
  const yLabelStyle = { fontFamily: s.fontFamily, fontSize: yTitleSize, fontWeight: titleFontWeight, fill: axisColor }
  const legendStyle = { fontFamily: s.fontFamily, fontSize: s.tickFontSize, color: axisColor }

  const xLabel = { value: xAxisLabel.trim() || formatAxisLabel(xCol), position: 'bottom' as const, offset: s.labelOffset, style: xLabelStyle }
  const yLabelText = yAxisLabel.trim() || (yCols.length === 1 ? formatAxisLabel(yCols[0]) : '')
  const yLabel = yLabelText
    ? { value: yLabelText, angle: -90, position: 'left' as const, offset: s.labelOffset, style: yLabelStyle }
    : undefined
  const grid = showGrid ? <CartesianGrid strokeDasharray="3 3" stroke={s.gridColor} /> : null
  const legend = yCols.length > 1
    ? <Legend verticalAlign="top" align="center" height={36} wrapperStyle={legendStyle} />
    : null
  const zoomArea = refLeft !== null && refRight !== null
    ? <ReferenceArea x1={refLeft} x2={refRight} strokeOpacity={0.3} fill={s.colors[0]} fillOpacity={0.12} />
    : null

  const renderChart = () => {
    if (chartType === 'scatter') {
      return (
        <ScatterChart
          margin={margin}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={resetZoom}
        >
          {grid}
          <XAxis
            dataKey="x"
            type={isNumericX ? 'number' : 'category'}
            domain={xDomain}
            ticks={xTicks}
            tick={xTickStyle}
            axisLine={axisLine}
            tickLine={axisLine}
            label={xLabel}
            allowDataOverflow
          />
          <YAxis
            dataKey="y"
            type="number"
            tick={yTickStyle}
            axisLine={axisLine}
            tickLine={axisLine}
            label={yLabel}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          {legend}
          {scatterSeries.map(series => (
            <Scatter key={series.key} data={series.data} name={seriesLabel(series.key)} fill={series.color}>
              {hasError(series.key) && (
                <ErrorBar dataKey="error" width={4} strokeWidth={1} stroke={axisColor} direction="y" />
              )}
            </Scatter>
          ))}
          {zoomArea}
        </ScatterChart>
      )
    }

    if (chartType === 'bar') {
      return (
        <BarChart data={processedData} margin={margin}>
          {grid}
          <XAxis dataKey="x" tick={xTickStyle} axisLine={axisLine} tickLine={axisLine} label={xLabel} />
          <YAxis tick={yTickStyle} axisLine={axisLine} tickLine={axisLine} label={yLabel} />
          <Tooltip />
          {legend}
          {yCols.map((col, i) => (
            <Bar
              key={col}
              dataKey={col}
              name={seriesLabel(col)}
              fill={seriesColor(col, i)}
              radius={[s.barRadius, s.barRadius, 0, 0]}
            >
              {hasError(col) && (
                <ErrorBar dataKey={`error_${col}`} width={4} strokeWidth={1} stroke={axisColor} direction="y" />
              )}
            </Bar>
          ))}
        </BarChart>
      )
    }

    return (
      <LineChart
        data={processedData}
        margin={margin}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={resetZoom}
      >
        {grid}
        <XAxis
          dataKey="x"
          type={isNumericX ? 'number' : 'category'}
          domain={xDomain}
          ticks={xTicks}
          tick={xTickStyle}
          axisLine={axisLine}
          tickLine={axisLine}
          label={xLabel}
          allowDataOverflow
        />
        <YAxis tick={yTickStyle} axisLine={axisLine} tickLine={axisLine} label={yLabel} />
        <Tooltip />
        {legend}
        {yCols.map((col, i) => {
          const color = seriesColor(col, i)
          const showDots = chartType !== 'lineOnly'
          return (
            <Line
              key={col}
              type="monotone"
              dataKey={col}
              name={seriesLabel(col)}
              stroke={color}
              strokeWidth={s.strokeWidth}
              dot={showDots ? { r: s.dotRadius, fill: color, stroke: 'none' } : false}
              activeDot={{ r: s.dotRadius + 2 }}
              connectNulls
            >
              {hasError(col) && (
                <ErrorBar dataKey={`error_${col}`} width={4} strokeWidth={1} stroke={axisColor} direction="y" />
              )}
            </Line>
          )
        })}
        {zoomArea}
      </LineChart>
    )
  }

  const addAnnotation = () => {
    const annotation: ChartAnnotation = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ann-${Date.now()}`,
      text: 'Texte',
      xPct: 50,
      yPct: 50,
    }
    onAnnotationsChange([...annotations, annotation])
    setEditingId(annotation.id)
  }

  const updateAnnotation = (id: string, changes: Partial<ChartAnnotation>) => {
    onAnnotationsChange(annotations.map(a => (a.id === id ? { ...a, ...changes } : a)))
  }

  const removeAnnotation = (id: string) => {
    onAnnotationsChange(annotations.filter(a => a.id !== id))
  }

  const handleAnnotationPointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    if (editingId === id) return
    const container = chartRef.current
    const annotation = annotations.find(a => a.id === id)
    if (!container || !annotation) return
    const rect = container.getBoundingClientRect()
    draggingRef.current = {
      id,
      offsetX: e.clientX - (rect.left + (annotation.xPct / 100) * rect.width),
      offsetY: e.clientY - (rect.top + (annotation.yPct / 100) * rect.height),
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleAnnotationPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = draggingRef.current
    const container = chartRef.current
    if (!drag || !container) return
    const rect = container.getBoundingClientRect()
    const xPct = Math.min(100, Math.max(0, ((e.clientX - drag.offsetX - rect.left) / rect.width) * 100))
    const yPct = Math.min(100, Math.max(0, ((e.clientY - drag.offsetY - rect.top) / rect.height) * 100))
    updateAnnotation(drag.id, { xPct, yPct })
  }

  const handleAnnotationPointerUp = () => {
    draggingRef.current = null
  }

  const exportPNG = async () => {
    if (!chartRef.current) return
    const { toPng } = await import('html-to-image')
    try {
      const dataUrl = await toPng(chartRef.current, { backgroundColor: 'white', pixelRatio: 3 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'figureready.png'
      a.click()
    } catch (err) {
      console.error('PNG export failed:', err)
    }
  }

  const exportSVG = () => {
    if (!chartRef.current) return
    const svg = chartRef.current.querySelector('svg')
    if (!svg) return
    const containerRect = chartRef.current.getBoundingClientRect()
    const svgRect = svg.getBoundingClientRect()
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    bg.setAttribute('width', '100%')
    bg.setAttribute('height', '100%')
    bg.setAttribute('fill', 'white')
    clone.insertBefore(bg, clone.firstChild)

    annotations.forEach(ann => {
      const xPx = (ann.xPct / 100) * containerRect.width - (svgRect.left - containerRect.left)
      const yPx = (ann.yPct / 100) * containerRect.height - (svgRect.top - containerRect.top)
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', String(xPx))
      text.setAttribute('y', String(yPx))
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'middle')
      text.setAttribute('font-family', s.fontFamily)
      text.setAttribute('font-size', String(xTickSize))
      text.setAttribute('fill', axisColor)
      if (boldLabels) text.setAttribute('font-weight', 'bold')
      text.textContent = ann.text
      clone.appendChild(text)
    })

    const svgStr = new XMLSerializer().serializeToString(clone)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'figureready.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div
        ref={chartRef}
        className="relative bg-white p-6 rounded-lg"
        style={{ fontFamily: s.fontFamily, cursor: zoomEnabled ? 'crosshair' : 'default' }}
      >
        <ResponsiveContainer width="100%" height={s.chartHeight}>
          {renderChart() as React.ReactElement}
        </ResponsiveContainer>
        {annotations.map(ann => (
          <div
            key={ann.id}
            className="absolute group select-none"
            style={{
              left: `${ann.xPct}%`,
              top: `${ann.yPct}%`,
              transform: 'translate(-50%, -50%)',
              cursor: editingId === ann.id ? 'text' : 'move',
              touchAction: 'none',
            }}
            onPointerDown={(e) => handleAnnotationPointerDown(e, ann.id)}
            onPointerMove={handleAnnotationPointerMove}
            onPointerUp={handleAnnotationPointerUp}
            onDoubleClick={() => setEditingId(ann.id)}
          >
            <div
              contentEditable={editingId === ann.id}
              suppressContentEditableWarning
              onBlur={(e) => {
                const text = e.currentTarget.textContent?.trim() || 'Texte'
                updateAnnotation(ann.id, { text })
                setEditingId(null)
              }}
              className={`px-1 whitespace-nowrap outline-none ${editingId === ann.id ? 'ring-1 ring-blue-400 rounded' : ''}`}
              style={{
                fontFamily: s.fontFamily,
                fontSize: xTickSize,
                color: axisColor,
                fontWeight: boldLabels ? 'bold' : 'normal',
              }}
            >
              {ann.text}
            </div>
            <button
              onClick={() => removeAnnotation(ann.id)}
              className="absolute -top-2 -right-2 hidden group-hover:flex items-center justify-center w-4 h-4 bg-red-500 text-white rounded-full text-[10px] leading-none"
              title="Supprimer"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {zoomEnabled && (
            <p className="text-xs text-slate-400">
              Glissez sur le graphique pour zoomer · double-clic pour réinitialiser
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={addAnnotation}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <TextIcon />
            Ajouter un texte
          </button>
          {zoomDomain && (
            <button
              onClick={resetZoom}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Réinitialiser le zoom
            </button>
          )}
          <button
            onClick={exportSVG}
            className="flex items-center gap-2 px-5 py-2 border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <DownloadIcon />
            Export SVG
          </button>
          <button
            onClick={exportPNG}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <DownloadIcon />
            Export PNG (3×)
          </button>
        </div>
      </div>
    </div>
  )
}
