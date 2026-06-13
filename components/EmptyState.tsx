export default function EmptyState() {
  return (
    <div className="w-full max-w-2xl mx-auto aspect-[4/3] flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-600">Aucune figure à afficher</p>
      <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
        Importez un fichier .xlsx et configurez vos colonnes pour générer votre figure
      </p>
    </div>
  )
}
