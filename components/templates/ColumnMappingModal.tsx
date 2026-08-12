'use client'
import { useCallback, useRef, useState } from 'react'
import { parseExcelFile } from '@/lib/parseExcel'
import { isErrorColumn } from '@/lib/detectColumns'
import type { FigureTemplate } from '@/lib/templates/types'
import {
  trackTemplateDataUploaded,
  trackTemplateMappingCompleted,
} from '@/lib/analytics'

interface Props {
  template: FigureTemplate
  onConfirm: (mapping: {
    columns: string[]
    rows: Record<string, unknown>[]
    xCol: string
    yCols: string[]
    errorCols: Record<string, string>
    xAxisLabel: string
    yAxisLabel: string
  }) => void
  onClose: () => void
}

export default function ColumnMappingModal({ template, onConfirm, onClose }: Props) {
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [xCol, setXCol] = useState('')
  const [yCols, setYCols] = useState<string[]>([])
  const [errorCol, setErrorCol] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  const dataCols = columns.filter(c => !isErrorColumn(c))
  const errorCandidates = columns.filter(c => isErrorColumn(c))

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      setUploadError('Only .xlsx files are supported')
      return
    }
    setUploadError(null)
    try {
      const { columns: cols, rows: r } = await parseExcelFile(file)
      if (r.length === 0) { setUploadError('The file appears to be empty'); return }
      setFileName(file.name)
      setColumns(cols)
      setRows(r)
      // Auto-select using parsed cols (not stale state)
      const parsedDataCols = cols.filter(c => !isErrorColumn(c))
      const parsedErrCols = cols.filter(c => isErrorColumn(c))
      const x = parsedDataCols[0] ?? ''
      const yDefault = parsedDataCols.filter(c => c !== x)[0] ?? ''
      setXCol(x)
      setYCols(yDefault ? [yDefault] : [])
      setErrorCol(parsedErrCols[0] ?? '')
      trackTemplateDataUploaded({
        template_id: template.id,
        template_name: template.name,
        chart_type: template.chartType,
      })
    } catch {
      setUploadError('Failed to read the file')
    }
  }, [template])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const toggleYCol = (col: string) => {
    setYCols(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    )
  }

  const canConfirm = columns.length > 0 && xCol && yCols.length > 0

  const handleConfirm = () => {
    if (!canConfirm) return
    const errorCols: Record<string, string> = {}
    if (errorCol && yCols.length === 1) errorCols[yCols[0]] = errorCol
    trackTemplateMappingCompleted({
      template_id: template.id,
      template_name: template.name,
      chart_type: template.chartType,
    })
    onConfirm({
      columns,
      rows,
      xCol,
      yCols,
      errorCols,
      xAxisLabel: template.defaultAxisLabels?.x ?? xCol,
      yAxisLabel: template.defaultAxisLabels?.y ?? (yCols[0] ?? ''),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-[11px] font-semibold text-[#2563eb] uppercase tracking-wider mb-0.5">
              {template.name}
            </p>
            <h2 className="text-base font-bold text-slate-900">Map your data</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Step 1 — Upload */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Step 1 — Upload your Excel file
            </p>
            <label
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#2563eb] bg-[#dbeafe]'
                  : fileName
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-200 bg-slate-50 hover:border-[#2563eb]/50 hover:bg-[#eff6ff]'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx"
                className="sr-only"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
              />
              {fileName ? (
                <div className="flex items-center gap-2 text-emerald-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold truncate max-w-[260px]">{fileName}</span>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold text-[#2563eb]">Click to upload</span> or drag & drop
                  </p>
                  <p className="text-xs text-slate-400">.xlsx files only</p>
                </>
              )}
            </label>
            {uploadError && (
              <p className="mt-1.5 text-xs text-red-600">{uploadError}</p>
            )}
          </div>

          {/* Step 2 — Column mapping (shown after upload) */}
          {columns.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Step 2 — Map columns
              </p>
              <div className="space-y-3">
                {/* X axis */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-slate-700 w-24 shrink-0">
                    X axis <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={xCol}
                    onChange={e => setXCol(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                  >
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Y axis */}
                <div className="flex items-start gap-3">
                  <label className="text-xs font-medium text-slate-700 w-24 shrink-0 pt-1">
                    Y axis <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1 flex flex-wrap gap-1.5">
                    {dataCols.filter(c => c !== xCol).map(c => (
                      <button
                        key={c}
                        onClick={() => toggleYCol(c)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          yCols.includes(c)
                            ? 'bg-[#2563eb] text-white border-[#2563eb]'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-[#2563eb]/50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                    {dataCols.filter(c => c !== xCol).length === 0 && (
                      <span className="text-xs text-slate-400 italic">No columns available</span>
                    )}
                  </div>
                </div>

                {/* Error column — only if template needs it */}
                {template.requiredDataRoles.error && (
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-slate-700 w-24 shrink-0">
                      Error col <span className="text-slate-400">(opt.)</span>
                    </label>
                    <select
                      value={errorCol}
                      onChange={e => setErrorCol(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                    >
                      <option value="">— None —</option>
                      {columns.filter(c => c !== xCol && !yCols.includes(c)).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex items-center gap-2 px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            Open in editor
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
