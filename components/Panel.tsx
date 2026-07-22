interface Props {
  id?: string
  icon: React.ReactNode
  title: string
  action?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function Panel({ id, icon, title, action, defaultOpen = true, children }: Props) {
  return (
    <details id={id} open={defaultOpen} className="group mx-3 mt-3 last:mb-3 rounded-3xl bg-white shadow-[0_4px_20px_rgba(124,58,237,0.12)] scroll-mt-14 overflow-hidden">
      <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-slate-50/60 transition-colors duration-100">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-[#7c3aed] text-white shrink-0">
            {icon}
          </span>
          <span className="text-sm font-bold text-slate-900 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          <svg
            className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 group-open:rotate-180"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </summary>
      <div className="px-4 pb-5 pt-3 border-t border-slate-100">{children}</div>
    </details>
  )
}
