import { useState } from 'react'
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
  seriesColors: Record<string, string>
  yAxisAssignment: Record<string, 'left' | 'right'>
  defaultColors: string[]
  figureConfigured?: boolean
  onChange: (x: string, yCols: string[]) => void
  onSeriesNamesChange: (names: Record<string, string>) => void
  onErrorColsChange: (cols: Record<string, string>) => void
  onXAxisLabelChange: (label: string) => void
  onYAxisLabelChange: (label: string) => void
  onYAxisAssignmentChange: (assignment: Record<string, 'left' | 'right'>) => void
}

// Static section heading (State 2 — flat layout)
function SH({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] font-semibold text-[#334155] mt-5 mb-2.5 first:mt-0 select-none">
      {children}
    </p>
  )
}

// Collapsible section (State 3 — all collapsed)
function ColSection({
  title, defaultOpen = false, children,
}: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-3 border-t border-[#E2E8F0] select-none"
      >
        <span className="text-[13px] font-semibold text-[#334155]">{title}</span>
        <svg
          className={`w-4 h-4 text-[#94A3B8] shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  )
}

const fieldCls = "w-full border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-[13px] text-[#0F172A] bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
const labelCls = "block text-[12px] font-medium text-[#64748B] mb-1.5"

export default function ColumnSelector({
  columns, xCol, yCols, seriesNames, errorCols, xAxisLabel, yAxisLabel,
  seriesColors, yAxisAssignment, defaultColors, figureConfigured,
  onChange, onSeriesNamesChange, onErrorColsChange,
  onXAxisLabelChange, onYAxisLabelChange, onYAxisAssignmentChange,
}: Props) {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null)

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

  const mappingContent = (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>X Axis</label>
        <select value={xCol} onChange={e => handleXChange(e.target.value)} className={fieldCls}>
          {columns.map(col => <option key={col} value={col}>{col}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Y Axis</label>
        <div className="rounded-lg border border-[#E2E8F0] bg-white divide-y divide-[#F1F5F9] max-h-36 overflow-y-auto">
          {yCandidates.map(col => (
            <label key={col} className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer">
              <input
                type="checkbox"
                checked={yCols.includes(col)}
                onChange={() => toggleY(col)}
                className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] w-3.5 h-3.5"
              />
              <span className="truncate">{col}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const labelsContent = (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2.5">
        <span className="text-[13px] font-medium text-[#64748B] w-4 shrink-0">X</span>
        <input
          type="text"
          placeholder={formatAxisLabel(xCol)}
          value={xAxisLabel}
          onChange={e => onXAxisLabelChange(e.target.value)}
          className={fieldCls}
        />
      </div>
      <div className="flex items-center gap-2.5">
        <span className="text-[13px] font-medium text-[#64748B] w-4 shrink-0">Y</span>
        <input
          type="text"
          placeholder={yCols.length === 1 ? formatAxisLabel(yCols[0]) : 'Y axis label'}
          value={yAxisLabel}
          onChange={e => onYAxisLabelChange(e.target.value)}
          className={fieldCls}
        />
      </div>
    </div>
  )

  const seriesContent = yCols.length > 0 && (
    <div className="space-y-px">
      {yCols.map((col, i) => {
        const expanded = expandedSeries === col
        const color = seriesColors[col] ?? defaultColors[i % defaultColors.length]
        const displayName = seriesNames[col] || col

        return (
          <div key={col} className={`rounded-lg transition-colors ${expanded ? 'bg-[#F8FAFC]' : ''}`}>
            <button
              onClick={() => setExpandedSeries(expanded ? null : col)}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#F8FAFC] transition-colors text-left"
            >
              <span className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10" style={{ backgroundColor: color }} />
              <span className="flex-1 text-[13px] font-medium text-[#0F172A] truncate">{displayName}</span>
              <svg
                className={`w-4 h-4 text-[#94A3B8] shrink-0 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expanded && (
              <div className="px-2 pb-3 space-y-3">
                {yCols.length > 1 && (
                  <div>
                    <label className={labelCls}>Name</label>
                    <input
                      type="text"
                      placeholder={col}
                      value={seriesNames[col] ?? ''}
                      onChange={e => onSeriesNamesChange({ ...seriesNames, [col]: e.target.value })}
                      className={fieldCls}
                    />
                  </div>
                )}

                {yCols.length >= 2 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-[#64748B]">Axis</span>
                    {(['left', 'right'] as const).map(side => {
                      const active = (yAxisAssignment[col] ?? 'left') === side
                      return (
                        <button
                          key={side}
                          onClick={() => onYAxisAssignmentChange({ ...yAxisAssignment, [col]: side })}
                          className={`px-3 py-1 text-[12px] font-semibold rounded-lg border transition-colors ${
                            active
                              ? 'bg-[#2563EB] text-white border-[#2563EB]'
                              : 'border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          {side === 'left' ? 'Y1' : 'Y2'}
                        </button>
                      )
                    })}
                  </div>
                )}

                {errorCandidates.length > 0 && (
                  <div>
                    <label className={labelCls}>Error column</label>
                    <select
                      value={errorCols[col] ?? ''}
                      onChange={e => {
                        const v = e.target.value
                        if (v === '') {
                          const { [col]: _r, ...rest } = errorCols
                          onErrorColsChange(rest)
                        } else {
                          onErrorColsChange({ ...errorCols, [col]: v })
                        }
                      }}
                      className={fieldCls}
                    >
                      <option value="">None</option>
                      {errorCandidates.map(ec => <option key={ec} value={ec}>{ec}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  // ── State 3: figure configured — collapsible sections ───────────────────────
  if (figureConfigured) {
    return (
      <div>
        <ColSection title="Mapping" defaultOpen={false}>
          {mappingContent}
        </ColSection>
        <ColSection title="Labels" defaultOpen={false}>
          {labelsContent}
        </ColSection>
        {yCols.length > 0 && (
          <ColSection title="Series" defaultOpen={false}>
            {seriesContent}
          </ColSection>
        )}
      </div>
    )
  }

  // ── State 2: mapping open, flat layout ──────────────────────────────────────
  return (
    <div>
      <SH>Mapping</SH>
      {mappingContent}
      <SH>Labels</SH>
      {labelsContent}
    </div>
  )
}
