'use client'
import { useEffect, useRef, useState } from 'react'
import FileUploader from '@/components/FileUploader'
import ColumnSelector from '@/components/ColumnSelector'
import ChartTypeSelector from '@/components/ChartTypeSelector'
import StyleEditor from '@/components/StyleEditor'
import ChartPreview from '@/components/ChartPreview'
import Panel from '@/components/Panel'
import EmptyState from '@/components/EmptyState'
import Header from '@/components/Header'
import WelcomeModal from '@/components/WelcomeModal'
import FeedbackButton from '@/components/FeedbackButton'
import SaveTemplateModal from '@/components/SaveTemplateModal'
import { chartStyles, type StyleName, type StyleOverrides } from '@/lib/chartStyles'
import type { ChartAnnotation } from '@/lib/annotations'
import { isErrorColumn, matchErrorColumn } from '@/lib/detectColumns'
import { loadDefaultStyle } from '@/lib/styleStorage'
import { saveUserTemplate, type ChartTemplate, type ChartType } from '@/lib/templateStorage'
import type { MarkerShape } from '@/lib/markerShapes'
import { trackUpload, trackChartCreated } from '@/lib/analytics'

export default function AppPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  useEffect(() => {
    const saved = loadDefaultStyle()
    if (saved) setStyleOverrides(saved)
  }, [])

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
  }

  const focusUpload = () => {
    document.getElementById('file-upload')?.click()
  }

  const handleSaveTemplate = (name: string) => {
    const base = chartStyles[styleName]
    saveUserTemplate({
      name,
      chartType,
      overrides: styleOverrides,
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
        <aside className="w-full lg:w-[380px] lg:shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 lg:overflow-y-auto bg-white">
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
                </div>
              </div>
            </Panel>
          )}

          {ready && (
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
                onApplyTemplate={handleApplyTemplate}
              />
            </Panel>
          )}
        </aside>

        <main className="flex-1 flex flex-col lg:overflow-hidden">
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
              onStyleChange={(patch) => setStyleOverrides(prev => ({ ...prev, ...patch }))}
              onSaveTemplate={() => setSaveTemplateOpen(true)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50">
              <EmptyState onUploadClick={focusUpload} />
            </div>
          )}
        </main>
      </div>

      <FeedbackButton />
    </div>
  )
}
