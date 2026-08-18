'use client'
import { useCallback, useState } from 'react'
import { parseExcelFile } from '@/lib/parseExcel'

interface Props {
  onData: (columns: string[], rows: Record<string, unknown>[]) => void
  compact?: boolean
}

export default function FileUploader({ onData, compact }: Props) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      setError('Only .xlsx files are supported')
      return
    }
    setError(null)
    try {
      setFileName(file.name)
      const { columns, rows } = await parseExcelFile(file)
      if (rows.length === 0) {
        setError('The file appears to be empty')
        return
      }
      onData(columns, rows)
    } catch {
      setError('Failed to read the file')
    }
  }, [onData])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }, [handleFile])

  const svgUpload = (
    <svg className="w-3.5 h-3.5 shrink-0 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )

  if (compact) {
    return (
      <div>
        <label
          htmlFor="file-upload-compact"
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors select-none ${
            isDragging ? 'bg-[#dbeafe]' : 'bg-[#eff6ff] hover:bg-[#dbeafe]'
          }`}
        >
          <input id="file-upload-compact" type="file" accept=".xlsx" onChange={handleChange} className="sr-only" />
          {svgUpload}
          <span className="text-[11px] text-slate-600 truncate flex-1">
            {fileName ?? 'Replace data…'}
          </span>
          <span className="text-[10px] font-semibold text-[#2563eb] shrink-0">Replace</span>
        </label>
        {error && <p className="mt-1 text-[10px] text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <div>
      <label
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        className={`flex flex-col items-center justify-center rounded-2xl p-4 cursor-pointer transition-all select-none ${
          isDragging ? 'bg-[#dbeafe] scale-[1.01]' : 'bg-[#eff6ff] hover:bg-[#dbeafe]'
        }`}
      >
        <input id="file-upload" type="file" accept=".xlsx" onChange={handleChange} className="sr-only" />
        <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center mb-2">
          <svg className="w-4 h-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        {fileName ? (
          <>
            <p className="text-xs font-semibold text-slate-700">{fileName}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Click to replace</p>
          </>
        ) : (
          <>
            <p className="text-xs font-medium text-slate-600">Drop your .xlsx file here</p>
            <p className="text-[10px] text-slate-400 mt-0.5">or click to browse</p>
          </>
        )}
      </label>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}
