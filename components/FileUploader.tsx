'use client'
import { useCallback, useState } from 'react'
import { parseExcelFile } from '@/lib/parseExcel'

interface Props {
  onData: (columns: string[], rows: Record<string, unknown>[]) => void
}

export default function FileUploader({ onData }: Props) {
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

  return (
    <div>
      <label
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all select-none ${
          isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
        }`}
      >
        <input
          id="file-upload"
          type="file"
          accept=".xlsx"
          onChange={handleChange}
          className="sr-only"
        />
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        {fileName ? (
          <>
            <p className="text-sm font-semibold text-slate-700">{fileName}</p>
            <p className="text-xs text-slate-400 mt-1">Cliquez pour remplacer</p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-600">Déposez votre fichier .xlsx ici</p>
            <p className="text-xs text-slate-400 mt-1">ou cliquez pour parcourir</p>
          </>
        )}
      </label>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}
