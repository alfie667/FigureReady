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
import type { StyleName } from '@/lib/chartStyles'
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
}

export default function ChartPreview({ data, xCol, yCols, seriesNames, errorCols, xAxisLabel, yAxisLabel, chartType, styleName }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const s = chartStyles[styleName]
  const seriesLabel = (col: string) => seriesNames[col]?.trim() || formatAxisLabel(col)

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
    color: s.colors[i % s.colors.length],
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

  const tickStyle = { fontSize: s.tickFontSize, fontFamily: s.fontFamily, fill: s.axisColor }
  const axisLine = { stroke: s.axisColor, strokeWidth: s.axisWidth }
  const margin = s.margin
  const labelStyle = { fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.labelFontWeight, fill: s.axisColor }
  const legendStyle = { fontFamily: s.fontFamily, fontSize: s.tickFontSize, color: s.axisColor }

  const xLabel = { value: xAxisLabel.trim() || formatAxisLabel(xCol), position: 'bottom' as const, offset: s.labelOffset, style: labelStyle }
  const yLabelText = yAxisLabel.trim() || (yCols.length === 1 ? formatAxisLabel(yCols[0]) : '')
  const yLabel = yLabelText
    ? { value: yLabelText, angle: -90, position: 'left' as const, offset: s.labelOffset, style: labelStyle }
    : undefined
  const grid = s.showGrid ? <CartesianGrid strokeDasharray="3 3" stroke={s.gridColor} /> : null
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
            tick={tickStyle}
            axisLine={axisLine}
            tickLine={axisLine}
            label={xLabel}
            allowDataOverflow
          />
          <YAxis
            dataKey="y"
            type="number"
            tick={tickStyle}
            axisLine={axisLine}
            tickLine={axisLine}
            label={yLabel}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          {legend}
          {scatterSeries.map(series => (
            <Scatter key={series.key} data={series.data} name={seriesLabel(series.key)} fill={series.color}>
              {hasError(series.key) && (
                <ErrorBar dataKey="error" width={4} strokeWidth={s.axisWidth} stroke={s.axisColor} direction="y" />
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
          <XAxis dataKey="x" tick={tickStyle} axisLine={axisLine} tickLine={axisLine} label={xLabel} />
          <YAxis tick={tickStyle} axisLine={axisLine} tickLine={axisLine} label={yLabel} />
          <Tooltip />
          {legend}
          {yCols.map((col, i) => (
            <Bar
              key={col}
              dataKey={col}
              name={seriesLabel(col)}
              fill={s.colors[i % s.colors.length]}
              radius={[s.barRadius, s.barRadius, 0, 0]}
            >
              {hasError(col) && (
                <ErrorBar dataKey={`error_${col}`} width={4} strokeWidth={s.axisWidth} stroke={s.axisColor} direction="y" />
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
          tick={tickStyle}
          axisLine={axisLine}
          tickLine={axisLine}
          label={xLabel}
          allowDataOverflow
        />
        <YAxis tick={tickStyle} axisLine={axisLine} tickLine={axisLine} label={yLabel} />
        <Tooltip />
        {legend}
        {yCols.map((col, i) => {
          const color = s.colors[i % s.colors.length]
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
                <ErrorBar dataKey={`error_${col}`} width={4} strokeWidth={s.axisWidth} stroke={s.axisColor} direction="y" />
              )}
            </Line>
          )
        })}
        {zoomArea}
      </LineChart>
    )
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
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    bg.setAttribute('width', '100%')
    bg.setAttribute('height', '100%')
    bg.setAttribute('fill', 'white')
    clone.insertBefore(bg, clone.firstChild)
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
        className="bg-white p-6 rounded-lg"
        style={{ fontFamily: s.fontFamily, cursor: zoomEnabled ? 'crosshair' : 'default' }}
      >
        <ResponsiveContainer width="100%" height={s.chartHeight}>
          {renderChart() as React.ReactElement}
        </ResponsiveContainer>
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
