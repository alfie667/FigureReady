import { isErrorColumn, matchErrorColumn } from '@/lib/detectColumns'
import { formatAxisLabel } from '@/lib/formatLabel'

interface Props {
  columns: string[]
  xCol: string
  yCols: string[]
  seriesNames: Record<string, string>
  errorCols: Record<string, string>
  xAxisLabel: string
  yAxisLabel: string
  onChange: (x: string, yCols: string[]) => void
  onSeriesNamesChange: (names: Record<string, string>) => void
  onErrorColsChange: (cols: Record<string, string>) => void
  onXAxisLabelChange: (label: string) => void
  onYAxisLabelChange: (label: string) => void
}

export default function ColumnSelector({ columns, xCol, yCols, seriesNames, errorCols, xAxisLabel, yAxisLabel, onChange, onSeriesNamesChange, onErrorColsChange, onXAxisLabelChange, onYAxisLabelChange }: Props) {
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
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Y Axis (une ou plusieurs colonnes)</label>
          <div className="border border-slate-200 rounded-xl p-2 max-h-32 overflow-y-auto bg-white space-y-0.5">
            {yCandidates.map(col => (
              <label key={col} className="flex items-center gap-2 text-sm text-slate-700 px-1.5 py-1 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={yCols.includes(col)}
                  onChange={() => toggleY(col)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                {col}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Titre axe X</label>
          <input
            type="text"
            placeholder={formatAxisLabel(xCol)}
            value={xAxisLabel}
            onChange={(e) => onXAxisLabelChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Titre axe Y</label>
          <input
            type="text"
            placeholder={yCols.length === 1 ? formatAxisLabel(yCols[0]) : 'Titre de l’axe Y'}
            value={yAxisLabel}
            onChange={(e) => onYAxisLabelChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {yCols.length > 0 && (
        <div className="pt-1 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-600 mt-3 mb-2">Séries</p>
          <div className="space-y-2">
            {yCols.map(col => (
              <div key={col} className="flex flex-wrap items-center gap-2">
                {yCols.length > 1 && (
                  <input
                    type="text"
                    placeholder={col}
                    value={seriesNames[col] ?? ''}
                    onChange={(e) => onSeriesNamesChange({ ...seriesNames, [col]: e.target.value })}
                    className="flex-1 min-w-[120px] border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
                {errorCandidates.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 shrink-0">
                      {yCols.length > 1 ? 'Erreur' : `${col} — Erreur`}
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
                      className="border border-slate-200 rounded-xl px-2 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Aucune</option>
                      {errorCandidates.map(errCol => (
                        <option key={errCol} value={errCol}>{errCol}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
