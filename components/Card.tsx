interface Props {
  id?: string
  icon: React.ReactNode
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}

export default function Card({ id, icon, title, action, children }: Props) {
  return (
    <section id={id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 scroll-mt-20">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            {icon}
          </div>
          <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
