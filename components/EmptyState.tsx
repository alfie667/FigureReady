interface Props {
  onUploadClick?: () => void
}

export default function EmptyState({ onUploadClick }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto aspect-[4/3] flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10">
      <div className="mb-6">
        <svg width="80" height="60" viewBox="0 0 80 60" fill="none" className="mx-auto text-blue-400">
          <rect x="4" y="8" width="72" height="44" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
          <line x1="4" y1="46" x2="76" y2="46" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <line x1="12" y1="8" x2="12" y2="46" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <polyline points="12,38 24,28 36,30 48,18 60,22 72,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="12,42 24,36 36,34 48,28 60,30 72,26" stroke="#E2211C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          <circle cx="12" cy="38" r="2.5" fill="currentColor" />
          <circle cx="36" cy="30" r="2.5" fill="currentColor" />
          <circle cx="60" cy="22" r="2.5" fill="currentColor" />
          <circle cx="72" cy="14" r="2.5" fill="currentColor" />
        </svg>
      </div>

      <p className="text-base font-semibold text-slate-700 mb-1">
        Upload an Excel file to start
      </p>
      <p className="text-sm text-slate-400 max-w-[280px] mb-6">
        Create publication-ready scientific figures from your data in seconds.
      </p>

      {onUploadClick && (
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
      )}
    </div>
  )
}
