interface Props {
  onUploadClick?: () => void
}

export default function EmptyState({ onUploadClick }: Props) {
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-7 text-center">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center">
        <svg className="w-9 h-9 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-slate-700 font-semibold text-lg">Aucune donnée</p>
        <p className="text-slate-400 text-sm leading-relaxed">
          Importez un fichier Excel<br />pour générer votre figure scientifique
        </p>
      </div>

      {onUploadClick && (
        <div className="flex flex-col items-center gap-2.5">
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Importer un fichier Excel
          </button>
          <p className="text-xs text-slate-400">Formats supportés : .xlsx</p>
        </div>
      )}
    </div>
  )
}
