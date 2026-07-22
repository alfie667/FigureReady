import { isErrorColumn, matchErrorColumn } from '@/lib/detectColumns'
import { formatAxisLabel } from '@/lib/formatLabel'
import type { MarkerShape } from '@/lib/markerShapes'
import { ColorSwatchPicker, LineThicknessPicker, MarkerShapePicker, MarkerSizePicker, type NumericPreset } from './StyleControls'

const strokeWidthPresets: NumericPreset[] = [
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

type ChartType = 'line' | 'lineOnly' | 'scatter' | 'bar'

interface Props {
  columns: string[]
  xCol: string
  yCols: string[]
  seriesNames: Record<string, string>
  errorCols: Record<string, string>
  xAxisLabel: string
  yAxisLabel: string
  chartType: ChartType
  seriesColors: Record<string, string>
  seriesStrokeWidths: Record<string, number>
  seriesMarkerSizes: Record<string, number>
  seriesMarkerShapes: Record<string, MarkerShape>
  yAxisAssignment: Record<string, 'left' | 'right'>
  defaultColors: string[]
  defaultStrokeWidth: number
  defaultMarkerSize: number
  onChange: (x: string, yCols: string[]) => void
  onSeriesNamesChange: (names: Record<string, string>) => void
  onErrorColsChange: (cols: Record<string, string>) => void
  onXAxisLabelChange: (label: string) => void
  onYAxisLabelChange: (label: string) => void
  onSeriesColorsChange: (colors: Record<string, string>) => void
  onSeriesStrokeWidthsChange: (widths: Record<string, number>) => void
  onSeriesMarkerSizesChange: (sizes: Record<string, number>) => void
  onSeriesMarkerShapesChange: (shapes: Record<string, MarkerShape>) => void
  onYAxisAssignmentChange: (assignment: Record<string, 'left' | 'right'>) => void
}

export default function ColumnSelector({
  columns, xCol, yCols, seriesNames, errorCols, xAxisLabel, yAxisLabel, chartType,
  seriesColors, seriesStrokeWidths, seriesMarkerSizes, seriesMarkerShapes, yAxisAssignment,
  defaultColors, defaultStrokeWidth, defaultMarkerSize,
  onChange, onSeriesNamesChange, onErrorColsChange, onXAxisLabelChange, onYAxisLabelChange,
  onSeriesColorsChange, onSeriesStrokeWidthsChange, onSeriesMarkerSizesChange, onSeriesMarkerShapesChange,
  onYAxisAssignmentChange,
}: Props) {
  // Columns are partitioned by name so the Y axis list and the error column
  // list never overlap: error-like columns ("Error", "SD"...) only show up
  // as error candidates, everything else is a Y candidate.
  const errorCandidates = columns.filter(col => col !== xCol && isErrorColumn(col))
  const yCandidates = columns.filter(col => col !== xCol && !isErrorColumn(col))

  const toggleY = (col: string) => {
    if (yCols.includes(col)) {
      if (yCols.length === 1) return
      onChange(xCol, yCols.filter(c => c !== col))
      const { [col]: _removed, ...rest } = errorCols
      onErrorColsChange(rest)
    } else {
      onChange(xCol, [...yCols, col])
      const match = matchErrorColumn(col, columns)
      if (match) onErrorColsChange({ ...errorCols, [col]: match })
    }
  }

  const handleXChange = (x: string) => {
    const newYCols = yCols.includes(x) ? yCols.filter(c => c !== x) : yCols
    onChange(x, newYCols)
    const cleaned = Object.fromEntries(Object.entries(errorCols).filter(([y]) => newYCols.includes(y)))
    onErrorColsChange(cleaned)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">X Axis</label>
          <select
            value={xCol}
            onChange={(e) => handleXChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6F42] focus:border-transparent"
          >
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Y Axis (one or more columns)</label>
          <div className="border border-slate-200 rounded-xl p-2 max-h-32 overflow-y-auto bg-white space-y-0.5">
            {yCandidates.map(col => (
              <label key={col} className="flex items-center gap-2 text-sm text-slate-700 px-1.5 py-1 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={yCols.includes(col)}
                  onChange={() => toggleY(col)}
                  className="rounded border-slate-300 text-[#1D6F42] focus:ring-[#1D6F42]"
                />
                {col}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">X Axis Label</label>
          <input
            type="text"
            placeholder={formatAxisLabel(xCol)}
            value={xAxisLabel}
            onChange={(e) => onXAxisLabelChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6F42] focus:border-transparent"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Y Axis Label</label>
          <input
            type="text"
            placeholder={yCols.length === 1 ? formatAxisLabel(yCols[0]) : "Y axis label"}
            value={yAxisLabel}
            onChange={(e) => onYAxisLabelChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6F42] focus:border-transparent"
          />
        </div>
      </div>

      {yCols.length > 0 && (
        <div className="pt-1 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-600 mt-3 mb-2">Series</p>
          <div className="space-y-3">
            {yCols.map((col, i) => {
              const strokeWidth = seriesStrokeWidths[col] ?? defaultStrokeWidth
              const markerSize = seriesMarkerSizes[col] ?? defaultMarkerSize
              const markerShape = seriesMarkerShapes[col] ?? 'circle'
              return (
                <div key={col} className="rounded-xl border border-slate-200 p-3 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {yCols.length > 1 ? (
                      <input
                        type="text"
                        placeholder={col}
                        value={seriesNames[col] ?? ''}
                        onChange={(e) => onSeriesNamesChange({ ...seriesNames, [col]: e.target.value })}
                        className="flex-1 min-w-[120px] border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6F42] focus:border-transparent"
                      />
                    ) : (
                      <p className="flex-1 min-w-[120px] text-sm font-medium text-slate-700">{col}</p>
                    )}
                    {yCols.length >= 2 && (
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-slate-400">Axis</span>
                        {(['left', 'right'] as const).map(side => {
                          const active = (yAxisAssignment[col] ?? 'left') === side
                          return (
                            <button
                              key={side}
                              onClick={() => onYAxisAssignmentChange({ ...yAxisAssignment, [col]: side })}
                              className={`px-2 py-0.5 text-xs rounded-md border transition-colors ${active ? 'bg-[#1D6F42] text-white border-[#1D6F42]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                              {side === 'left' ? 'Y1' : 'Y2'}
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {errorCandidates.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 shrink-0">
                          {yCols.length > 1 ? 'Error' : `${col} — Error`}
                        </span>
                        <select
                          value={errorCols[col] ?? ''}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              const { [col]: _removed, ...rest } = errorCols
                              onErrorColsChange(rest)
                            } else {
                              onErrorColsChange({ ...errorCols, [col]: value })
                            }
                          }}
                          className="border border-slate-200 rounded-xl px-2 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6F42] focus:border-transparent"
                        >
                          <option value="">None</option>
                          {errorCandidates.map(errCol => (
                            <option key={errCol} value={errCol}>{errCol}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <ColorSwatchPicker
                    label="Color"
                    value={seriesColors[col] ?? defaultColors[i % defaultColors.length]}
                    onChange={(v) => onSeriesColorsChange({ ...seriesColors, [col]: v })}
                  />

                  <div className="flex flex-wrap gap-4">
                    {chartType !== 'scatter' && (
                      <LineThicknessPicker
                        label="Line thickness"
                        value={strokeWidth}
                        presets={strokeWidthPresets}
                        onChange={(v) => onSeriesStrokeWidthsChange({ ...seriesStrokeWidths, [col]: v })}
                        compact
                      />
                    )}
                    {chartType !== 'bar' && (
                      <>
                        <MarkerSizePicker
                          label="Marker size"
                          value={markerSize}
                          presets={markerSizePresets}
                          onChange={(v) => onSeriesMarkerSizesChange({ ...seriesMarkerSizes, [col]: v })}
                          compact
                        />
                        <MarkerShapePicker
                          label="Marker shape"
                          value={markerShape}
                          onChange={(shape: MarkerShape) => onSeriesMarkerShapesChange({ ...seriesMarkerShapes, [col]: shape })}
                          compact
                        />
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
