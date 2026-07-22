'use client'
import { useCallback, useState } from 'react'

interface Props {
  onImage: (dataUrl: string, fileName: string) => void
}

export default function ImageUploader({ onImage }: Props) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only images (PNG, JPG) are supported')
      return
    }
    setError(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => onImage(reader.result as string, file.name)
    reader.readAsDataURL(file)
  }, [onImage])

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
        htmlFor="image-upload"
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors select-none ${
          isDragging
            ? 'border-[#7c3aed] bg-[#ede9fe]'
            : 'border-slate-300 hover:border-[#a78bfa] hover:bg-slate-50'
        }`}
      >
        <input
          id="image-upload"
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleChange}
          className="sr-only"
        />
        <svg className="w-10 h-10 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {fileName ? (
          <>
            <p className="text-sm font-semibold text-slate-700">{fileName}</p>
            <p className="text-xs text-slate-400 mt-1">Click to replace</p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-600">Drop a curve image here</p>
            <p className="text-xs text-slate-400 mt-1">or click to browse (PNG, JPG)</p>
          </>
        )}
      </label>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}
