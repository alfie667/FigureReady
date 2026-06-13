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
    <details id={id} open={defaultOpen} className="group border-b border-slate-100 scroll-mt-14 last:border-b-0">
      <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            {icon}
          </span>
          <span className="text-sm font-semibold text-slate-700 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          <svg className="w-4 h-4 text-slate-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  )
}
