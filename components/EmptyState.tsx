interface Props {
  onUploadClick?: () => void
}

export default function EmptyState({ onUploadClick }: Props) {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-slate-700 font-semibold text-base">No data yet</p>
        <p className="text-slate-400 text-sm">Upload an Excel file to generate your figure</p>
      </div>

      {onUploadClick && (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload Excel file
          </button>
          <p className="text-xs text-slate-400">Supports .xlsx files</p>
        </div>
      )}
    </div>
  )
}
