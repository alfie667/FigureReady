'use client'
import { useState } from 'react'
import FileUploader from '@/components/FileUploader'
import ColumnSelector from '@/components/ColumnSelector'
import ChartTypeSelector from '@/components/ChartTypeSelector'
import StyleSelector from '@/components/StyleSelector'
import StyleEditor from '@/components/StyleEditor'
import ChartPreview from '@/components/ChartPreview'
import Card from '@/components/Card'
import EmptyState from '@/components/EmptyState'
import Sidebar, { type NavStep } from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { chartStyles, type StyleName, type StyleOverrides } from '@/lib/chartStyles'
import type { ChartAnnotation } from '@/lib/annotations'
import { isErrorColumn, matchErrorColumn } from '@/lib/detectColumns'

type ChartType = 'line' | 'lineOnly' | 'scatter' | 'bar'

export default function Home() {
  const [columns, setColumns] = useState<string[]>([])
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [xCol, setXCol] = useState('')
  const [yCols, setYCols] = useState<string[]>([])
  const [chartType, setChartType] = useState<ChartType>('line')
  const [styleName, setStyleName] = useState<StyleName>('Clean')
  const [seriesNames, setSeriesNames] = useState<Record<string, string>>({})
  const [errorCols, setErrorCols] = useState<Record<string, string>>({})
  const [xAxisLabel, setXAxisLabel] = useState('')
  const [yAxisLabel, setYAxisLabel] = useState('')
  const [styleOverrides, setStyleOverrides] = useState<StyleOverrides>({})
  const [annotations, setAnnotations] = useState<ChartAnnotation[]>([])

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
    setXAxisLabel('')
    setYAxisLabel('')
    setStyleOverrides({})
    setAnnotations([])
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
  }

  const ready = xCol && yCols.length > 0 && data.length > 0

  const steps: NavStep[] = [
    { id: 'data', label: 'Données', status: columns.length > 0 ? 'done' : 'active' },
    { id: 'config', label: 'Configuration', status: columns.length === 0 ? 'pending' : ready ? 'done' : 'active' },
    { id: 'export', label: 'Aperçu & export', status: ready ? 'active' : 'pending' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <TopBar steps={steps} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-lg font-semibold text-slate-800 tracking-tight">Créer une figure</h1>
              <p className="text-xs text-slate-400 mt-0.5">Excel → graphique publication-ready</p>
            </div>
            {columns.length > 0 && (
              <button
                onClick={reset}
                className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Nouvelle figure
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
            <div className="space-y-5">
              <Card
                id="data"
                title="Données"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                }
              >
                <FileUploader onData={handleData} />
              </Card>

              {columns.length > 0 && (
                <Card
                  id="config"
                  title="Configuration"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m9 6h3.75M16.5 12a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 12H13.5m-9.75 6h9.75M13.5 18a1.5 1.5 0 1003 0m-3 0a1.5 1.5 0 003 0m3.75 0H17.25" />
                    </svg>
                  }
                >
                  <div className="space-y-5">
                    <ColumnSelector
                      columns={columns}
                      xCol={xCol}
                      yCols={yCols}
                      seriesNames={seriesNames}
                      errorCols={errorCols}
                      xAxisLabel={xAxisLabel}
                      yAxisLabel={yAxisLabel}
                      chartType={chartType}
                      seriesColors={styleOverrides.seriesColors ?? {}}
                      seriesStrokeWidths={styleOverrides.seriesStrokeWidths ?? {}}
                      seriesMarkerSizes={styleOverrides.seriesMarkerSizes ?? {}}
                      seriesMarkerShapes={styleOverrides.seriesMarkerShapes ?? {}}
                      defaultColors={chartStyles[styleName].colors}
                      defaultStrokeWidth={chartStyles[styleName].strokeWidth}
                      defaultMarkerSize={chartStyles[styleName].dotRadius}
                      onChange={(x, y) => { setXCol(x); setYCols(y) }}
                      onSeriesNamesChange={setSeriesNames}
                      onErrorColsChange={setErrorCols}
                      onXAxisLabelChange={setXAxisLabel}
                      onYAxisLabelChange={setYAxisLabel}
                      onSeriesColorsChange={(colors) => setStyleOverrides({ ...styleOverrides, seriesColors: colors })}
                      onSeriesStrokeWidthsChange={(widths) => setStyleOverrides({ ...styleOverrides, seriesStrokeWidths: widths })}
                      onSeriesMarkerSizesChange={(sizes) => setStyleOverrides({ ...styleOverrides, seriesMarkerSizes: sizes })}
                      onSeriesMarkerShapesChange={(shapes) => setStyleOverrides({ ...styleOverrides, seriesMarkerShapes: shapes })}
                    />
                    <div className="flex flex-wrap gap-6">
                      <ChartTypeSelector value={chartType} onChange={setChartType} />
                      <StyleSelector value={styleName} onChange={setStyleName} />
                    </div>
                  </div>
                </Card>
              )}

              {ready && (
                <Card
                  id="style"
                  title="Style Editor"
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
                </Card>
              )}
            </div>

            <div className="lg:sticky lg:top-6">
              <Card
                id="export"
                title="Aperçu & export"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                }
              >
                {ready ? (
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
                  />
                ) : (
                  <EmptyState />
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
